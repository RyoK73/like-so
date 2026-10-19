---
version: alpha
name: Like-so
description: A UI sketching tool for handing ideas to LLMs, built around simplicity and speed. The look is a tribute to the tile-based, modern style of shapez 1/2, with both dark and light modes.
colors:
  primary: "#4AA3DF"
  background-dark: "#3E3F47"
  surface-dark: "#444856"
  surface-raised-dark: "#646B7D"
  on-surface-dark: "#EDEDED"
  success-dark: "#4AED86"
  error-dark: "#FF8989"
  background-light: "#DEE1EA"
  surface-light: "#ECEEF2"
  surface-raised-light: "#C5CCD6"
  on-surface-light: "#171717"
  primary-text-light: "#1A64A0"
  success-light: "#0F6E37"
  error-light: "#B71C1C"
  canvas: "#F6F7FA"
  canvas-grid: "#E3E7EA"
  stroke: "#55575A"
  ink: "#171717"
  shape-red: "#FF666A"
  shape-green: "#78FF66"
  shape-blue: "#66A7FF"
  shape-yellow: "#FCF52A"
  shape-purple: "#DD66FF"
  shape-cyan: "#00FCFF"
  shape-white: "#FFFFFF"
  shape-uncolored: "#AAAAAA"
typography:
  headline-lg:
    fontFamily: Geist Sans
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.02em
  body-md:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  canvas-text:
    fontFamily: Geist Mono
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 6px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  grid: 20px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.shape-blue}"
  button-tool:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 16px
  button-tool-hover:
    backgroundColor: "{colors.surface-raised-dark}"
  button-tool-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
  button-tool-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.on-surface-light}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 16px
  button-tool-light-hover:
    backgroundColor: "{colors.surface-raised-light}"
  button-danger:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.error-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 16px
  button-danger-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.error-light}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 16px
  input:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  input-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.on-surface-light}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  panel:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
    rounded: "{rounded.lg}"
    padding: 16px
  panel-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.on-surface-light}"
    rounded: "{rounded.lg}"
    padding: 16px
  tooltip:
    backgroundColor: "{colors.surface-raised-dark}"
    textColor: "{colors.on-surface-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  tooltip-light:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.on-surface-light}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  canvas-frame:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.canvas-text}"
    rounded: "{rounded.lg}"
  sketch-object:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.stroke}"
    typography: "{typography.canvas-text}"
    rounded: "{rounded.md}"
    padding: 16px
---

## Overview

Like-so is a canvas for sketching an idea the moment it strikes and handing it straight to an LLM.
The core of the design is the "simplicity and speed" stated in the README.
Even as features grow, the UI must not get heavy, and it should feel as if you can start drawing the instant an idea arrives.

The look is a tribute to shapez 1/2, which is the main reference.
It also borrows the Mini Metro idea of keeping the background quiet and making the objects you work on stand out.
The goal is a modern, playful tool built on tiles and a grid, where shapes can be placed quickly like pieces of a puzzle.

The color values in this document are facts taken from the official shapez 1 repository (`themes/light.json`, `themes/dark.json`, `colors.js`), except where noted as a proposal.
Concrete shapez 2 values could not be obtained, so anything attributed to shapez 2 (such as the strength of the corner radius) is a proposal based on its qualitative impression.

## Colors

The app supports two modes, dark and light.
Both are derived from the corresponding shapez 1 themes.

- Default: follow the OS setting (`prefers-color-scheme`).
- Manual switch: the user can choose light, dark, or system.
  An explicit choice overrides the OS setting.
  This is a proposal.
- Tokens with the `-dark` and `-light` suffixes are the per-mode values.
  Tokens without a suffix are shared by both modes.
- The drawing canvas stays light in both modes (see below), so that the exported image looks the same regardless of the mode.
  This is a proposal.

### Shared

- **primary (`#4AA3DF`)**: the shapez selection color.
  Use it for fills such as selected objects, focus, the active tool, and the main action.
  In both modes, put `ink` text on top of it.
- **canvas (`#F6F7FA`) / canvas-grid (`#E3E7EA`)**: the drawing surface and its grid lines.
  The grid color is from the shapez light theme.
  The canvas color is a proposal: it is lighter than the shapez light background (`#ECEEF2`) so that the canvas stays distinguishable from the light-mode page.
- **stroke (`#55575A`) / ink (`#171717`)**: the outline of sketch objects, and text on bright surfaces.
- **shape-\***: the shapez shape colors.
  Use them as the color choices for filling sketch objects.

### Dark mode

- **background-dark (`#3E3F47`)**: the app background, from the shapez dark theme.
- **surface-dark (`#444856`) / surface-raised-dark (`#646B7D`)**: panels and toolbars.
  Raise to surface-raised on hover or press.
- **on-surface-dark (`#EDEDED`)**: text on dark surfaces.
- **success-dark (`#4AED86`) / error-dark (`#FF8989`)**: success states such as snap being enabled, and deletion or errors.

### Light mode

- **background-light (`#DEE1EA`)**: the app background, taken from the shapez light theme tooltip color.
- **surface-light (`#ECEEF2`) / surface-raised-light (`#C5CCD6`)**: panels and toolbars, which sit lighter than the page.
  Darken to surface-raised on hover or press.
  Both are from the shapez light theme.
- **on-surface-light (`#171717`)**: text on light surfaces.
- **primary-text-light (`#1A64A0`)**: a darker blue for text, links, and icons on light surfaces, because `primary` is too pale to read there.
  This is a proposal.
- **success-light (`#0F6E37`) / error-light (`#B71C1C`)**: darker variants of the dark-mode colors for text on light surfaces.
  These are proposals.

## Typography

Use Geist Sans for the UI in general and Geist Mono for text placed on the canvas.
`layout.tsx` currently loads Geist, but `body` in `globals.css` specifies Arial, so Geist is not applied in practice.
When implementing, align `body` with Geist.

- **headline-lg**: headings on the landing page.
- **body-md**: body text.
- **label-md**: buttons, the toolbar, and input labels.
- **canvas-text**: text placed on the canvas.
  A monospaced font keeps character widths even, which gives the mockups a wireframe look.

## Layout

The basis is tiles and a grid.
The canvas has a 20px grid, and shapes snap to it (the default of the prototype app outside this repository).
UI spacing follows a scale based on 4px (4 / 8 / 16 / 24 / 48).

The screen is a simple vertical stack of the toolbar, the canvas frame, and the output actions.
Controls are gathered in the toolbar at the edge, and the center of the canvas is kept clear.
Body content on the landing page sits within a fixed maximum width surrounded by generous margins.

## Elevation & Depth

Hierarchy is expressed with differences in surface lightness and with outlines, not with shadows.
In dark mode, the three levels are background-dark, surface-dark, and surface-raised-dark.
In light mode, the page is the darkest level, and panels sit lighter than it.
Sketch objects are distinguished by a thin `stroke` outline.
To match the flat, game-like feel of shapez, do not use strong drop shadows.
This policy is inferred from how shapez looks and is not based on an official design specification.

## Shapes

Following the impression of shapez 2, corners are strongly rounded.
The values are proposals, not measurements from shapez 2.

- **sm (6px)**: small elements such as checkboxes.
- **md (12px)**: buttons, inputs, and sketch objects.
- **lg (20px)**: panels and the canvas frame.
- **xl (28px)**: large cards on the landing page.
- **full**: pill-shaped chips and badges.

Within one screen, use the same radius for elements on the same level, and do not mix rounded and sharp corners.
The one exception is a dashed box on the canvas, such as a "list" placeholder, which uses md.

## Components

This is based on the structure detected in a screenshot of the prototype app outside this repository.
No component implementation exists yet, so this is only what could be read from the image.
The light-mode variants carry the `-light` suffix, and the dark-mode ones are the unsuffixed defaults.

- **button-primary**: the most important action on the screen, such as copying the image.
  Put `ink` text on a `primary` background.
  It is the same in both modes.
- **button-tool**: drawing tools such as rectangle, circle, text, and arrow.
  The active tool is filled with `primary`.
- **button-danger**: delete.
  In dark mode, put `error-dark` text on `background-dark`, because it fails the contrast threshold on `surface-dark`.
  In light mode, put `error-light` text on `surface-light`.
- **input**: inputs such as the frame width and height, the scale, and the grid size.
- **panel**: a group of toolbar items or settings.
- **tooltip**: a speech bubble that shows the name of an icon-only control on hover.
  Put `on-surface` text on a `surface-raised` background, with no border.
  A small arrow (an 8px square rotated by 45°, in the same color as the background) points to the center of the control.
  The caller chooses the side it appears on, and it is drawn above the navigation menu.
  The values are the ones implemented in `src/design-system/tool-tip.tsx`.
- **canvas-frame**: the drawing surface.
  The export range is shown with a dashed border.
- **sketch-object**: rectangles, circles, and similar objects placed on the canvas.
  Draw them with a `stroke` outline and a fill from `shape-*` or `canvas`.
- **mode switch**: a control for choosing light, dark, or system.
  It is a proposal and has no component tokens yet.

## Do's and Don'ts

Contrast ratios are calculated with the WCAG formula.

### Both modes

- Do use `ink` for text on a `primary` background.
  It is 6.48:1, which meets AA (4.5:1).
- Don't put white text on a `primary` background.
  It is only 2.76:1, which fails AA.
- Do draw sketch outlines and text with `stroke` or `ink`.
  On `canvas`, they are 6.77:1 and 16.74:1.
- Don't use `canvas-grid`, `shape-yellow`, `shape-cyan`, or `shape-white` for lines or text on the canvas.
  The contrast is only about 1.1 to 1.2:1, so they are almost invisible.
  Use them as fills, together with a `stroke` outline.
- Do use `primary` only for the single most important action and the selected state on a screen.
- Don't create hierarchy with shadows.
  Use differences in surface lightness and outlines.
- Don't mix different corner radii among elements on the same level.

### Dark mode

- Do use `on-surface-dark` for body text.
  It is 8.94:1 on `background-dark` and 7.77:1 on `surface-dark`.
- Don't use `primary` as the color of small body text on dark surfaces.
  It is 3.78:1 on `background-dark` and 3.29:1 on `surface-dark`, which fails the normal-text threshold (4.5:1).
  Limit it to large text (3:1), icons, and borders.
- Don't use `error-dark` for small text on `surface-dark`.
  It is 3.98:1, which fails.
  On `background-dark` it is 4.58:1, which passes.

### Light mode

- Do use `on-surface-light` for body text.
  It is 13.71:1 on `background-light` and 15.43:1 on `surface-light`.
- Do use `primary-text-light` for blue text and icons.
  It is 4.76:1 on `background-light` and 5.36:1 on `surface-light`.
- Don't use `primary` or `success-dark` as text color on light surfaces.
  `primary` is only 2.11:1 and `success-dark` is 1.17:1 on `background-light`.
- Don't use `error-dark` as text color on light surfaces.
  It is 1.75:1 on `background-light`.
  Use `error-light` (5.03:1 on `background-light`).
- Don't place text on `surface-raised-light` other than `on-surface-light`.
  `primary-text-light` is 3.85:1 and `error-light` is 4.06:1 there, which fail.
