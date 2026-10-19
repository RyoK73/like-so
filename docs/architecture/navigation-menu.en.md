# Navigation menu

## Overview

`NavigationMenu` (`src/navigation-menu/navigation-menu.tsx`) is a Server Component.
`src/app/sketches/layout.tsx` renders it, so it appears on both `/sketches` and `/sketches/[id]`.
It is fixed (`fixed top-1/2 left-4`) on the left side of the screen, and each item is an icon-only button or link.
`index.ts` exports only `NavigationMenu`.

## Visibility

`NavigationMenu` passes a client made by `createSupabaseServerClient` to `getAuthState` to get the auth state.
When the state is `signedOut`, it shows no menu at all (it returns `null`).
The items are defined in `menuItems`, and an item is shown only when the auth state is in its `visibleFor`.

| Item         | Component             | `guest` | `registered` | Status                        |
| ------------ | --------------------- | ------- | ------------ | ----------------------------- |
| Sketch list  | `SketchListLink`      | Shown   | Shown        | Implemented                   |
| New sketch   | `NewSketchIconButton` | Shown   | Shown        | Implemented                   |
| Theme toggle | `ThemeToggleButton`   | Shown   | Shown        | Not implemented (placeholder) |
| Sign out     | `SignOutButton`       | Shown   | Shown        | Not implemented (placeholder) |
| Sign up      | `SignUpLink`          | Shown   | Hidden       | Implemented                   |

- `ThemeToggleButton` is an empty `button` that has only an `aria-label`.
- `SignOutButton` is an empty `button` that has only an `aria-label`, wrapped in a `form`.
  Neither has an icon, a tooltip or any behavior.

## Files

| File                         | Role                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `navigation-menu.tsx`        | Server Component. Lines up the items for the auth state               |
| `sketch-list-link.tsx`       | Client Component. A link to `/sketches`                               |
| `new-sketch-icon-button.tsx` | Passes an icon and a tooltip to `NewSketchButton` (`src/new-sketch/`) |
| `sign-up-link.tsx`           | A link to `/signup`                                                   |
| `theme-toggle-button.tsx`    | A placeholder                                                         |
| `sign-out-button.tsx`        | A placeholder                                                         |
| `index.ts`                   | Exports `NavigationMenu`                                              |

## Details

- `SketchListLink` highlights itself as the current page (`bg-ds-primary`) only when `usePathname` equals `/sketches`.
  It does not highlight on `/sketches/[id]`.
- `NewSketchIconButton` uses the `tooltip` prop of `NewSketchButton`.
  See [Routing](./routing.en.md) for the flow of creating a sketch.
- `NavigationMenu` passes a common `className` (`iconItemClassName`) to each item.

## Tooltip

The icon-only items show their names with `MyToolTip` (`src/design-system/tool-tip.tsx`).
All of them use `side="right"` (the right side of the item).
`MyToolTipProvider` is placed in `src/app/layout.tsx`.
See `tooltip` in `DESIGN.md` for the look.
