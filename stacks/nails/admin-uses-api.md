---
name: nails-admin-uses-api
description: In Nails admin, fetch and mutate data through the API. Do not add JSON routes on Admin controllers.
---

# nails-admin-uses-api

When an admin screen needs JSON for fetch or mutate, call a Nails API controller. **Do not add a JSON action, a JSON content type, or an API-shaped method on an Admin controller.**

An API controller lives under `src/Api/Controller/` (or a module's `Api/Controller`), extends `Nails\Api\Controller\Base` or `CrudController`, returns `ApiResponse`, and is served at `/api/{module}/{controller}/{method}`. Admin JavaScript calls that URL. A logged-in admin session is already accepted by the API.

HTML admin screens stay on the Admin controller: index, create, edit, delete, form posts, and `DefaultController` hooks.

## When to use

Building or changing a Nails admin screen that loads or saves data from JavaScript, or that needs a JSON endpoint.

## Steps

1. Look for an existing API controller for the same model or resource.
2. Call that endpoint from the admin UI (`/api/{module}/{controller}/{method}`).
3. If no API controller exists, add one under `src/Api/Controller/` (or the module's `Api/Controller`) that extends `Base` or `CrudController` and returns `ApiResponse`.
4. Do not add a JSON action, a JSON content type, or an API-shaped method on an Admin controller (`src/Admin/Controller/`, `DefaultController`, or `Base`).

## Stop

If the ticket is HTML CRUD on `DefaultController`, stay on the Admin controller. If an API controller already exists, extend it rather than adding a second one. Do not invent a parallel JSON route on the Admin controller.

**Source.** Recorded in the archive repository.
