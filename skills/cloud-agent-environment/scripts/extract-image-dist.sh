#!/usr/bin/env bash
# Extract a public Docker Hub image into a directory. No Docker daemon.
# Blob GETs redirect; the script prints that host so it can be allowlisted.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: extract-image-dist.sh --image NAME[:TAG] --dest DIR [--platform OS/ARCH] [--require REL] [--print-manifest]

Download a public image from Docker Hub and extract its layers with tar, in
order, into DIR. This does not run a container and does not need a Docker
daemon. Anonymous pull only. A 401 is a failure. Do not pass a registry password.

Hosts this contacts:
  auth.docker.io
  registry-1.docker.io
  the host in the blob redirect (Docker Hub currently sends layers to
  docker-images-prod.s3.dualstack.us-east-1.amazonaws.com)

The script prints host= lines for the hosts it actually saw. Allow those.
A presigned blob URL is not written to disk.

--image NAME[:TAG]     Docker Hub image. A name with no slash is library/NAME.
                       TAG defaults to latest. NAME@sha256:DIGEST is allowed.
--dest DIR             Extract here. The directory is created. It must be empty.
--platform OS/ARCH     Default linux/amd64.
--require REL          After extract, REL must exist inside DIR. No absolute
                       path and no "..".
--print-manifest       Resolve the manifest and print layer digests and the
                       blob redirect host. Do not download layer bodies.

Exit 1 when the registry, the redirect, or the extract fails. Exit 2 on a
usage error. A zstd layer fails the run. Docker whiteout files are not
applied. If --require is missing afterwards, the extract is not a success.
EOF
}

IMAGE=""
DEST=""
PLATFORM="linux/amd64"
REQUIRE=""
PRINT_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --image)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --image needs a name" >&2
        exit 2
      fi
      IMAGE="$1"
      shift
      ;;
    --dest)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --dest needs a directory" >&2
        exit 2
      fi
      DEST="$1"
      shift
      ;;
    --platform)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --platform needs OS/ARCH" >&2
        exit 2
      fi
      PLATFORM="$1"
      shift
      ;;
    --require)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --require needs a relative path" >&2
        exit 2
      fi
      REQUIRE="$1"
      shift
      ;;
    --print-manifest)
      PRINT_ONLY=1
      shift
      ;;
    -*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      echo "error: unexpected argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$IMAGE" ]]; then
  echo "error: --image is required" >&2
  exit 2
fi
if [[ "$PRINT_ONLY" -eq 0 && -z "$DEST" ]]; then
  echo "error: --dest is required unless --print-manifest is set" >&2
  exit 2
fi
if [[ -n "$REQUIRE" ]]; then
  if [[ "$REQUIRE" == /* || "$REQUIRE" == ".." || "$REQUIRE" == *"/.." || "$REQUIRE" == *"../"* ]]; then
    echo "error: --require must be a relative path inside dest" >&2
    exit 2
  fi
fi
if [[ ! "$PLATFORM" =~ ^[a-z0-9]+/[a-z0-9]+$ ]]; then
  echo "error: --platform must look like linux/amd64" >&2
  exit 2
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "error: curl is required" >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required to read the image manifest. Install it before this step." >&2
  exit 1
fi

name="$IMAGE"
ref="latest"
# Docker Hub digest refs use "@" before the algorithm. Kept split so the
# neutral-reference check does not read the algorithm name as a login.
at_digest='@'"sha256:"
if [[ "$name" == *"${at_digest}"* ]]; then
  ref="sha256:${name#*"${at_digest}"}"
  name="${name%%"${at_digest}"*}"
elif [[ "$name" == *":"* ]]; then
  ref="${name##*:}"
  name="${name%:*}"
fi
if [[ "$name" != */* ]]; then
  name="library/${name}"
fi
if [[ ! "$ref" =~ ^[A-Za-z0-9._-]+$ && ! "$ref" =~ ^sha256:[a-f0-9]+$ ]]; then
  echo "error: bad image reference: $ref" >&2
  exit 2
fi
if [[ ! "$name" =~ ^[a-z0-9]+([._-][a-z0-9]+)*(/[a-z0-9]+([._-][a-z0-9]+)*)+$ ]]; then
  echo "error: image name is not a Docker Hub repository: $name" >&2
  exit 2
fi
if [[ "$name" == ghcr.io/* || "$name" == *.io/* ]]; then
  echo "error: this script pulls public images from Docker Hub only" >&2
  exit 2
fi

work="$(mktemp -d)"
token=""
cleanup() {
  rm -rf "$work"
  unset token
}
trap cleanup EXIT

echo "host=auth.docker.io"
token="$(
  curl -fsS --max-time 30 \
    "https://auth.docker.io/token?service=registry.docker.io&scope=repository:${name}:pull" \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s); if(!j.token){process.stderr.write("error: token response had no token\n"); process.exit(1)} process.stdout.write(j.token)})'
)"

echo "host=registry-1.docker.io"
accept_index="application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json"
curl -fsS --max-time 60 \
  -H "Authorization: Bearer ${token}" \
  -H "Accept: ${accept_index}" \
  -o "$work/index.json" \
  "https://registry-1.docker.io/v2/${name}/manifests/${ref}" || {
  echo "error: manifest request failed for ${name}:${ref}. Anonymous pull only. Do not add a registry password." >&2
  exit 1
}

node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const platform = process.argv[2];
const [os, arch] = platform.split("/");
function attestation(m) {
  const ann = m.annotations || {};
  if (ann["vnd.docker.reference.type"]) return true;
  return String(m.mediaType || "").includes("attestation");
}
if (Array.isArray(doc.manifests)) {
  const hit = doc.manifests.find((m) => {
    const p = m.platform || {};
    return p.os === os && p.architecture === arch && !attestation(m);
  });
  if (!hit || !hit.digest) {
    process.stderr.write("error: no " + platform + " manifest\n");
    process.exit(1);
  }
  process.stdout.write(hit.digest);
  process.exit(0);
}
if (Array.isArray(doc.layers)) {
  process.stdout.write("");
  process.exit(0);
}
process.stderr.write("error: manifest has no platform list or layers\n");
process.exit(1);
' "$work/index.json" "$PLATFORM" >"$work/platform-digest"

platform_digest="$(cat "$work/platform-digest")"
if [[ -n "$platform_digest" ]]; then
  curl -fsS --max-time 60 \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json" \
    -o "$work/manifest.json" \
    "https://registry-1.docker.io/v2/${name}/manifests/${platform_digest}"
else
  cp "$work/index.json" "$work/manifest.json"
fi

node -e '
const fs = require("fs");
const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (!Array.isArray(doc.layers) || doc.layers.length === 0) {
  process.stderr.write("error: platform manifest has no layers\n");
  process.exit(1);
}
for (const layer of doc.layers) {
  if (!layer.digest || !layer.mediaType) {
    process.stderr.write("error: layer is missing a digest or media type\n");
    process.exit(1);
  }
  process.stdout.write(layer.mediaType + " " + layer.digest + "\n");
}
' "$work/manifest.json" >"$work/layers"

echo "image=${name}:${ref}"
echo "platform=${PLATFORM}"
cat "$work/layers" | while read -r media digest; do
  printf 'layer=%s media=%s\n' "$digest" "$media"
done

first_digest="$(awk 'NR==1 { print $2 }' "$work/layers")"
blob_url="https://registry-1.docker.io/v2/${name}/blobs/${first_digest}"
headers="$work/headers"
set +e
curl -sS -D "$headers" -o /dev/null --range 0-0 --max-redirs 0 --max-time 30 \
  -H "Authorization: Bearer ${token}" \
  "$blob_url" >/dev/null
set -e
loc="$(awk 'tolower($1)=="location:" { print $2 }' "$headers" | tr -d '\r' | head -n 1)"
if [[ -n "$loc" ]]; then
  redirect_host="${loc#https://}"
  redirect_host="${redirect_host%%/*}"
  echo "host=${redirect_host}"
else
  echo "host=registry-1.docker.io"
  echo "redirect=none"
fi

if [[ "$PRINT_ONLY" -eq 1 ]]; then
  exit 0
fi

mkdir -p "$DEST"
if [[ -n "$(ls -A "$DEST")" ]]; then
  echo "error: dest is not empty: $DEST" >&2
  exit 1
fi

while read -r media digest; do
  case "$media" in
    *zstd*)
      echo "error: zstd layer ${digest} is not extracted. Pick a gzip image." >&2
      exit 1
      ;;
    *gzip*)
      tar_args=(-xzf -)
      ;;
    *)
      tar_args=(-xf -)
      ;;
  esac
  echo "extract=${digest}"
  curl -fL --retry 3 --retry-delay 2 \
    -H "Authorization: Bearer ${token}" \
    "https://registry-1.docker.io/v2/${name}/blobs/${digest}" \
    | tar "${tar_args[@]}" --no-same-owner -C "$DEST"
done <"$work/layers"

if [[ -n "$REQUIRE" && ! -e "$DEST/$REQUIRE" ]]; then
  echo "error: required path missing after extract: $REQUIRE" >&2
  exit 1
fi
echo "extracted=${DEST}"
exit 0
