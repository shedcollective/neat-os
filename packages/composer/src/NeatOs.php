<?php

declare(strict_types=1);

namespace Neat\Os;

/**
 * PHP metadata for shedcollective/neat-os.
 *
 * Composer does not ship the knowledge tree (skills/, templates/,
 * principles/, conventions/). Those live in the git repo; Node
 * consumers install @shedcollective/neat-os via file: or github:.
 */
final class NeatOs
{
    public const VERSION = '0.6.0';

    public static function version(): string
    {
        return self::VERSION;
    }

    /**
     * Documented consume hint — not a filesystem walk.
     *
     * Knowledge is not on the Composer autoload path. Use
     * require('@shedcollective/neat-os') after a sibling file: or
     * github:shedcollective/neat-os#tag install, or a neat-os git
     * checkout (NEAT_OS_ROOT).
     */
    public static function knowledgeSourceHint(): string
    {
        return 'Knowledge (skills/, templates/, principles/, conventions/) lives in the shedcollective/neat-os git repo. require("@shedcollective/neat-os") after a file: sibling or github:shedcollective/neat-os#tag install, or set NEAT_OS_ROOT. SHED_OS_ROOT is a deprecated fallback. Composer autoload does not ship the knowledge tree.';
    }
}
