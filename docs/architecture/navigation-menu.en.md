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

## Tooltip

The icon-only items show their names with `IconButton` (`src/design-system/icon-button.tsx`) or `MyToolTip` (`src/design-system/tool-tip.tsx`).
All of them use `TOOLTIP_SIDE` in `constants.ts` (`"right"`, the right side of the item).
`MyToolTipProvider` is placed in `src/app/layout.tsx`.
See `tooltip` in `DESIGN.md` for the look.
