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

Exact versions are in `package.json`.
Only fabric.js is pinned to an exact version, without `^`.
On saving, the version at that time is recorded in the DB as `fabric_version`.

## Directory structure

The codebase is split by what it does (vertical).
See [Directory structure](../rules/directory-structure.en.md) for the rule.

| Directory              | Role                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`             | Routing only                                                                                                                                             |
| `src/proxy.ts`         | Next.js proxy. Refreshes the auth session on each request                                                                                                |
| `src/auth-form/`       | The form for sign-in and guest registration                                                                                                              |
| `src/landing-page/`    | Showing the landing page (buttons by auth state)                                                                                                         |
| `src/navigation-menu/` | The navigation menu (items by auth state)                                                                                                                |
| `src/new-sketch/`      | Creating a sketch (button and Server Action)                                                                                                             |
| `src/sketch-detail/`   | The sketch page (showing, drawing and saving to the DB)                                                                                                  |
| `src/design-system/`   | Generic UI parts (button, input, label and toast from shadcn/ui, `LocalTime`, tooltip (`MyToolTip`, `MyToolTipProvider`), `IconButton`, `ThemeProvider`) |
| `src/sketch-list/`     | Showing the sketch list (Server and Client Components)                                                                                                   |
| `src/supabase/`        | Supabase clients, auth, CRUD and DB tests                                                                                                                |
| `src/utils/`           | Shared types                                                                                                                                             |
| `src/dev-scripts/`     | Scripts for development                                                                                                                                  |
| `src/test/`            | Pure helpers for tests                                                                                                                                   |

## Drawing (`canvas/`, `shapes/`, `history/` and `viewport/` in `src/sketch-detail/`)

| Directory   | Responsibility                                    |
| ----------- | ------------------------------------------------- |
| `canvas/`   | Creating, disposing and loading the fabric canvas |
| `shapes/`   | Creating shapes                                   |
| `history/`  | Undo / redo                                       |
| `viewport/` | Fixed frame, pan and zoom                         |

| File                        | Role                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `canvas/useFabricCanvas.ts` | Creates a fabric canvas, loads `canvasJson` and disposes it on unmount                                      |
| `shapes/useShapes.ts`       | Adds a rect, circle or triangle to the center of the view (inside the frame)                                |
| `history/useHistory.ts`     | Keeps `past` / `present` / `future` and provides `set`, `undo` and `redo`                                   |
| `viewport/`                 | Calculations and hooks for the fixed frame, pan and zoom. See [Fixed frame, pan and zoom](./viewport.en.md) |

Details of `useFabricCanvas`:

- `loadFromJSON` receives the `signal` of an `AbortController`, and it is aborted on unmount.
- When the loading finishes, `isLoaded` becomes `true`.
  When the loading fails, `isLoaded` stays `false` and the error is set in `loadError`.
- `loadFromJSON` clears the background color of the canvas, so after loading it sets `backgroundColor` again only when the JSON has no `background`.
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

## Sign-in and guest registration (`src/auth-form/`)

| File            | Role                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `auth-page.tsx` | Server Component. Gets the auth state and passes whether it is a guest to `AuthForm` |
| `auth-form.tsx` | Client Component. Handles entering the email and the code, resending and navigation  |
| `auth-error.ts` | Converts Supabase error codes into messages to show                                  |
| `index.ts`      | Exports `AuthPage`                                                                   |

See [Authentication](./auth.en.md) for details.

## Sketch page (`src/sketch-detail/`)

| File                | Role                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `sketch-detail.tsx` | Server Component. Renders the info of one sketch got by `getSketch` and passes it to `SketchCanvas` |
| `sketch-canvas.tsx` | Client Component. Handles the canvas, the buttons to add shapes and auto-save                       |
| `canvas/`           | Creating, disposing and loading the fabric canvas (see the section above)                           |
| `shapes/`           | Creating shapes (see the section above)                                                             |
| `history/`          | Undo / redo (see the section above)                                                                 |
| `viewport/`         | Fixed frame, pan and zoom (see the section above and [Fixed frame, pan and zoom](./viewport.en.md)) |
| `save/`             | Hooks and functions for saving to the DB (see [Saving sketches](./save.en.md))                      |
| `index.ts`          | Exports only `SketchDetail`                                                                         |

Details of `SketchCanvas`:

- The canvas element is sized to fit the free space on the screen, and the content of the frame (`width` × `height`) is shown with pan and zoom.
  The page itself does not scroll.
- The paper and the grid of the canvas are drawn by CSS on the parent element, so the background of fabric is `transparent`.
  The interval of the grid is `cell_size` of the sketch, and it follows the zoom and the pan.
  The outside of the frame is dimmed with a translucent color.
- The buttons to add shapes are disabled until `isSketchLoaded` becomes `true`.
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
- [Navigation menu](./navigation-menu.en.md)
