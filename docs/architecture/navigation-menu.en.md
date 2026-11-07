# Navigation menu

## Overview

`NavigationMenu` (`src/navigation-menu/navigation-menu.tsx`) is a Server Component.
`src/app/sketches/layout.tsx` renders it, so it appears on both `/sketches` and `/sketches/[id]`.
The menu floats over the content.
It is fixed (`fixed`) at `left-4` from the left edge of the screen and vertically centered.
It does not take any width from the content, so a page that must not go under the menu uses `navigationMenuInsetClassName` (`src/design-system/constants.ts`) for its left padding.
`/sketches` uses this padding.
`/sketches/[id]` does not add it, because the canvas fills the whole screen.
Each item is an icon-only button or link.
`index.ts` exports only `NavigationMenu`.

## Visibility

`NavigationMenu` passes a client made by `createSupabaseServerClient` to `getAuthState` to get the auth state.
When the state is `signedOut`, it shows no menu at all (it returns `null`).
The items are defined in `menuItems`, and an item is shown only when the auth state is in its `visibleFor`.

| Item         | Component             | `guest` | `registered` | Status      |
| ------------ | --------------------- | ------- | ------------ | ----------- |
| Sketch list  | `SketchListLink`      | Shown   | Shown        | Implemented |
| New sketch   | `NewSketchIconButton` | Shown   | Shown        | Implemented |
| Theme toggle | `ThemeToggleButton`   | Shown   | Shown        | Implemented |
| Sign up      | `SignUpLink`          | Shown   | Hidden       | Implemented |
| Sign in      | `SignInLink`          | Shown   | Hidden       | Implemented |
| Sign out     | `SignOutButton`       | Hidden  | Shown        | Implemented |

## Files

| File                         | Role                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `navigation-menu.tsx`        | Server Component. Lines up the items for the auth state                      |
| `sketch-list-link.tsx`       | Client Component. A link to `/sketches`                                      |
| `new-sketch-icon-button.tsx` | Passes an icon and the tooltip side to `NewSketchButton` (`src/new-sketch/`) |
| `constants.ts`               | Holds the tooltip side (`TOOLTIP_SIDE`). Not exported outside                |
| `sign-up-link.tsx`           | A link to `/signup`                                                          |
| `sign-in-link.tsx`           | A link to `/signin`                                                          |
| `theme-toggle-button.tsx`    | Client Component. Switches between `dark` and `light`                        |
| `sign-out/`                  | `SignOutButton` and `signOutAction` (Server Action). Handles signing out     |
| `index.ts`                   | Exports `NavigationMenu`                                                     |

## Details

- `SketchListLink` highlights itself as the current page (`bg-paint-yellow`) only when `usePathname` equals `/sketches`.
  It does not highlight on `/sketches/[id]`.
- `NewSketchIconButton` passes `variant="icon"` and `tooltipSide` to `NewSketchButton`.
  With `variant="icon"`, `NewSketchButton` uses `IconButton` (`src/design-system/icon-button.tsx`).
  The button has no brush frame.
  See [Routing](./routing.en.md) for the flow of creating a sketch.
- `ThemeToggleButton` switches between `dark` and `light` on each click with `useTheme` of `next-themes`.
  It shows the icon (`LuSun` or `LuMoonStar`) with the CSS `dark:` variant.
  It shows the button and its tooltip ("テーマ切り替え") with `IconButton`.
  It depends on `ThemeProvider` (`src/design-system/`).
  See [Overview](./overview.en.md) for the tech stack.
- `SignOutButton` calls `signOutAction` with `useActionState` (Client Component).
  It is `disabled` while the action is pending.
  Its icon is `LuLogOut`.
  It shows the button and its tooltip ("サインアウト") with `IconButton`.
  On success, it redirects to `/`.
  On failure, `signOutAction` returns "サインアウトに失敗しました", and the button shows it as a toast (`error`).
- `NavigationMenu` passes a common `className` (`iconItemClassName`) to each item.

## Handoff toolbar

It has the buttons to hand the sketch over to LLMs and others.
`SketchCanvas` renders it, so it appears only on `/sketches/[id]`.
It floats over the canvas, is fixed (`absolute`) at `right-4` from the right edge of the screen, and is vertically centered.
It is always shown and has no toggle.
It has `role="toolbar"` (`aria-label` is "受け渡し"), and its buttons are lined up vertically.
`index.ts` exports only `HandoffToolbar`.

| Button   | Component             | Icon         | Tooltip            |
| -------- | --------------------- | ------------ | ------------------ |
| Copy     | `CopyImageButton`     | `LuCopy`     | 画像をコピー       |
| Download | `DownloadImageButton` | `LuDownload` | 画像をダウンロード |

Both are shown with `IconButton`.
They are disabled until the canvas is loaded (`isLoaded` is `true`).
The tooltip opens on the left of the item (`TOOLTIP_SIDE` in `handoff-toolbar/constants.ts`).

### How the PNG is made

`exportFramePng` (`handoff-toolbar/exportFramePng.ts`) returns a `Promise<Blob>`.

- The range is the whole frame (`sketch.width` × `sketch.height`).
  It is output at the scale 1 (the px of the frame as they are), whatever the pan and the zoom are.
  The part of a shape outside the frame is cut off.
- The background of fabric is `transparent`, so `backgroundColor` is set to the paper color only while drawing.
  The paper color is read from the CSS variable `--canvas` with `getComputedStyle` at the time of the click (`getPaperColor`).
  The grid is not included.
- `viewportTransform` is set to the identity matrix only while drawing.
  The drawing is synchronous, and `viewportTransform` and `backgroundColor` are restored right after it.
  They are restored even when an exception occurs, so the pan and the zoom on the screen do not change.
- It outputs the image as it is even when there is no shape.

### Copy

`copyImage` (`handoff-toolbar/copy-image-button/copyImage.ts`) passes `ClipboardItem({ "image/png": Promise<Blob> })` to `navigator.clipboard.write`.
Safari needs the write to start inside the user's action, so it passes a `Promise<Blob>` instead of a `Blob`.
It tells the result with a toast: `success` ("コピーしました") on success and `error` on failure.
There is no fallback for the environments where the Clipboard API is not available.

### Download

`downloadImage` (`handoff-toolbar/download-image-button/downloadImage.ts`) checks the title, makes the PNG, and saves it.
`buildPngFileName` makes the file name in the form `{title}-{YYYYMMDD-HHmmss}.png` (local time).
It trims the spaces around the title and replaces the characters that cannot be used in a file name (`/ \ : * ? " < > |`) with `_`.
In the following cases, it neither makes the PNG nor saves it, and tells the error with a toast (`error`).

| Condition                                           | Toast message                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| A title that is empty after trimming                | タイトルが空のためダウンロードできません                         |
| A title of unusable characters only (such as `///`) | タイトルにファイル名に使える文字がないためダウンロードできません |

On success, it tells it with a toast (`success`, "ダウンロードしました") and releases the object URL it made.

## Tooltip

The icon-only items show their names with `IconButton` (`src/design-system/icon-button.tsx`) or `MyToolTip` (`src/design-system/tool-tip.tsx`).
All of them use `TOOLTIP_SIDE` in `constants.ts` (`"right"`, the right side of the item).
`MyToolTipProvider` is placed in `src/app/layout.tsx`.
See `tooltip` in `DESIGN.md` for the look.
