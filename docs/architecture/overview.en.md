# Overview

## Tech stack

| Area               | Technology                  |
| ------------------ | --------------------------- |
| Framework          | Next.js (App Router), React |
| Drawing            | fabric.js                   |
| Backend            | Supabase (Postgres, Auth)   |
| Validation         | zod                         |
| Styling            | Tailwind CSS                |
| Test               | vitest, Testing Library     |
| Icons              | react-icons                 |
| UI parts (tooltip) | @base-ui/react              |
| Theme switching    | next-themes                 |
| Web Analytics      | @vercel/analytics           |

Exact versions are in `package.json`.
Only fabric.js is pinned to an exact version, without `^`.
On saving, the version at that time is recorded in the DB as `fabric_version`.

## Directory structure

The codebase is split by what it does (vertical).
See [Directory structure](../rules/directory-structure.en.md) for the rule.

| Directory              | Role                                                      |
| ---------------------- | --------------------------------------------------------- |
| `src/app/`             | Routing only                                              |
| `src/proxy.ts`         | Next.js proxy. Refreshes the auth session on each request |
| `src/analytics/`       | Web Analytics (with a rule to exclude some pages)         |
| `src/auth-form/`       | The form for sign-in and guest registration               |
| `src/landing-page/`    | Showing the landing page (buttons by auth state)          |
| `src/navigation-menu/` | The navigation menu (items by auth state)                 |
| `src/new-sketch/`      | Creating a sketch (button and Server Action)              |
| `src/sketch-detail/`   | The sketch page (showing, drawing and saving to the DB)   |
| `src/design-system/`   | Generic UI parts                                          |
| `src/sketch-list/`     | Showing the sketch list (Server and Client Components)    |
| `src/error-pages/`     | Shared parts for the 404 and error pages                  |
| `src/supabase/`        | Supabase clients, auth, CRUD and DB tests                 |
| `src/utils/`           | Shared types                                              |
| `src/dev-scripts/`     | Scripts for development                                   |
| `src/test/`            | Pure helpers for tests                                    |

## Drawing (`canvas/`, `shapes/`, `selection/`, `history/` and `viewport/` in `src/sketch-detail/`)

| Directory    | Responsibility                                    |
| ------------ | ------------------------------------------------- |
| `canvas/`    | Creating, disposing and loading the fabric canvas |
| `shapes/`    | Creating shapes                                   |
| `selection/` | Deleting the selected shapes                      |
| `history/`   | Undo / redo                                       |
| `viewport/`  | Fixed frame, pan and zoom                         |

| File                                  | Role                                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `canvas/useFabricCanvas.ts`           | Creates a fabric canvas, loads `canvasJson` and disposes it on unmount                                                                                                                                             |
| `shapes/useShapes.ts`                 | Adds a rect or circle to the center of the view (inside the frame)                                                                                                                                                 |
| `selection/useDeleteSelectedShape.ts` | Returns `deleteSelectedShape`, which deletes the selected shapes, and also handles the Delete and Backspace keys                                                                                                   |
| `history/useHistory.ts`               | Keeps `past` / `present` / `future` and provides `recordHistory`, `undo` and `redo`                                                                                                                                |
| `history/useCanvasHistory.ts`         | Records the changes of the canvas (`object:added` / `object:modified` / `object:removed`) in `useHistory` and applies `present` to the canvas on undo / redo. Events fired at the same timing make a single record |
| `viewport/`                           | Calculations and hooks for the fixed frame, pan and zoom. See [Fixed frame, pan and zoom](./viewport.en.md)                                                                                                        |

Details of `useFabricCanvas`:

- `loadFromJSON` receives the `signal` of an `AbortController`, and it is aborted on unmount.
- When the loading finishes, `isLoaded` becomes `true`.
  When the loading fails, `isLoaded` stays `false` and the error is set in `loadError`.
- `loadFromJSON` clears the background color of the canvas, so after loading it sets `backgroundColor` again only when the JSON has no `background`.
- After loading, it sets `strokeUniform` to `true` for all objects, so the stroke width does not change on resize.
  It applies even if the saved JSON does not specify it.
- fabric wraps the canvas element in its own wrapper.
  So the parent element of the canvas element is an element managed by React (such as a `div`).

## Sketch list (`src/sketch-list/`)

| File              | Role                                                    |
| ----------------- | ------------------------------------------------------- |
| `sketch-list.tsx` | Server Component. Renders the list from `getSketchList` |
| `index.ts`        | Exports `SketchList`                                    |

## Date and time (`src/design-system/local-time.tsx`)

`LocalTime` is a Client Component.
It shows `updated_at` in a `<time dateTime>` element.

`LocalTime` renders differently depending on where it runs.
It uses `useSyncExternalStore` to avoid a hydration mismatch.

| Where                        | Locale         | Time zone         |
| ---------------------------- | -------------- | ----------------- |
| Server side and on hydration | `en-US`        | UTC               |
| Client                       | Browser locale | Browser time zone |

## Creating a sketch (`src/new-sketch/`)

| File                    | Role                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `start-new-sketch.ts`   | Server Action. Signs in anonymously if needed, creates an empty sketch and goes to `/sketches/{id}`     |
| `new-sketch-button.tsx` | Client Component. Calls `startNewSketch` and shows a toast on failure. Passing `tooltip` adds a tooltip |
| `index.ts`              | Exports `NewSketchButton` and `startNewSketch`                                                          |

## Landing page (`src/landing-page/`)

| File               | Role                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `landing-page.tsx` | Server Component. Gets the auth state and renders the buttons for it  |
| `introduction.tsx` | Server Component. Renders the application's static introductory text. |
| `index.ts`         | Exports `LandingPage`                                                 |

## 404 and error pages (`src/error-pages/`)

| File                       | Role                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `error-page-layout.tsx`    | The frame at the center of the screen. Renders `title` (h1), `description`, `actions` and `illustration`. `description` and `illustration` are optional                        |
| `error-retry-button.tsx`   | Client Component. A "再試行" button that calls `onRetry` on click                                                                                                              |
| `error-link-button.tsx`    | Renders a `Link` in the look of a button (`outline`)                                                                                                                           |
| `universal-error-page.tsx` | Client Component. An error page that combines the heading, the description, a warning icon, the "再試行" button and the link button. Receives `reset`, `href` and `buttonText` |
| `index.ts`                 | Exports `ErrorPageLayout`, `ErrorRetryButton`, `ErrorLinkButton` and `UniversalErrorPage`                                                                                      |

The wording and the link targets of `not-found.tsx` are written in each file in `src/app/`.
The wording of the error pages is written in `UniversalErrorPage`, and `error.tsx` passes only the link target and the button text.
See [Routing](./routing.en.md) for details.

## Sign-in and guest registration (`src/auth-form/`)

| File            | Role                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `auth-page.tsx` | Server Component. Gets the auth state and passes whether it is a guest to `AuthForm` |
| `auth-form.tsx` | Client Component. Handles entering the email and the code, resending and navigation  |
| `auth-error.ts` | Converts Supabase error codes into messages to show                                  |
| `index.ts`      | Exports `AuthPage`                                                                   |

See [Authentication](./auth.en.md) for details.

## Sketch page (`src/sketch-detail/`)

| File                | Role                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sketch-detail.tsx` | Server Component. Passes the sketch got by `getSketch` to `SketchEditor`                                                                                                  |
| `sketch-editor.tsx` | Client Component. Holds the title and description that `TitleToolbar` has validated, and passes them to `SketchCanvas`                                                    |
| `sketch-canvas.tsx` | Client Component. Handles the canvas, the control toolbar (`ControlToolbar`) and auto-save                                                                                |
| `title-toolbar/`    | The title toolbar (`TitleToolbar`). Shows the inputs for the title and description, the size and the updated time. It also has the validation (`validateSketchMeta`)      |
| `control-toolbar/`  | The frame of the control toolbar (`ControlToolbar`), the zoom controls (`ZoomControls` in `zoom-controls/`), and the buttons to add and delete shapes (`ShapeNavigation`) |
| `handoff-toolbar/`  | The handoff toolbar (`HandoffToolbar`). Has the buttons to copy or download the image of the sketch                                                                       |
| `canvas/`           | Creating, disposing and loading the fabric canvas (see the section above)                                                                                                 |
| `selection/`        | Deleting the selected shapes (see the section above)                                                                                                                      |
| `shapes/`           | Creating shapes (see the section above)                                                                                                                                   |
| `history/`          | Undo / redo (see the section above)                                                                                                                                       |
| `viewport/`         | Fixed frame, pan and zoom (see the section above and [Fixed frame, pan and zoom](./viewport.en.md))                                                                       |
| `save/`             | Hooks and functions for saving to the DB (see [Saving sketches](./save.en.md))                                                                                            |
| `index.ts`          | Exports only `SketchDetail`                                                                                                                                               |

Details of `SketchCanvas`:

- The canvas element fills the whole screen (`h-dvh`, no margin), the frame (`width` × `height`) is placed at its center, and the content is shown with pan and zoom.
  The page itself does not scroll.
- The paper and the grid of the canvas are drawn by CSS on the canvas element, so the background of fabric is `transparent`.
  The interval of the grid is `cell_size` of the sketch, and it follows the zoom and the pan.
  The grid continues outside the frame, and the outside of the frame is not dimmed.
  The frame is shown with a thin outline (`brush-a` and `ring-border`).
- The title toolbar, the control toolbar and the handoff toolbar float over the canvas.
  See [Toolbars](./toolbar.en.md) for their positions and specifications.
- When saving fails, it shows a fixed message as a toast with a fixed `id`.
  A toast with the same `id` is updated instead of stacking.
- When the loading fails, or `canvas_json` is not an object, it shows neither the canvas nor the buttons.
  It shows a message with `role="alert"` and a link to the list.
  This keeps auto-save from overwriting the content that could not be loaded.

## Next

- [Routing](./routing.en.md)
- [Authentication](./auth.en.md)
- [Database](./database.en.md)
- [Saving sketches](./save.en.md)
- [Toolbars](./toolbar.en.md)
