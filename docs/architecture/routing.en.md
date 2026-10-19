# Routing

## Routes

| Path             | Content                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| `/`              | The landing page. The buttons change with the auth state                         |
| `/signin`        | Sign-in. Renders `AuthPage` from `src/auth-form/`                                |
| `/signup`        | Registration. For a guest, it registers the email address                        |
| `/sketches`      | The sketch list. Has a `loading.tsx`                                             |
| `/sketches/[id]` | The sketch page. The link target of each item in the list. Has a `not-found.tsx` |

See [Authentication](./auth.en.md) for the redirects by path.
See [Authentication](./auth.en.md) also for the behavior of `/signin` and `/signup`.

## Landing page (`/`)

`src/app/page.tsx` renders `LandingPage` from `src/landing-page/`.
It is always shown, whether the user is signed out or signed in.

- `LandingPage` passes a client made by `createSupabaseServerClient` to `getAuthState`, and shows different buttons by the auth state.
- "ゲストとして続ける" (Continue as a guest) is `NewSketchButton`.
  The flow is the same as "Creating a sketch" in [Sketch list](#sketch-list-sketches).

| Auth state   | Buttons                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| `signedOut`  | "ゲストとして続ける", "サインアップ" (`/signup`), "サインイン" (`/signin`)                   |
| `guest`      | "スケッチ一覧へ" (`/sketches`), "アカウント登録（他の端末でも使えるようにする）" (`/signup`) |
| `registered` | "スケッチ一覧へ" (`/sketches`)                                                               |

## Sketch list (`/sketches`)

`src/app/sketches/page.tsx` renders `SketchList` from `src/sketch-list/`.
See [Overview](./overview.en.md) for the components.

`src/app/sketches/layout.tsx` renders `NavigationMenu` on every page under `/sketches` (including `/sketches/[id]`).
See [Navigation menu](./navigation-menu.en.md) for details.

### Fetching

- `SketchList` passes a client made by `createSupabaseServerClient` to `getSketchList` (`src/supabase/sketch-crud/getSketchList.ts`).
- `getSketchList` is server only (`server-only`).
- It gets `id`, `title`, `description`, `created_at` and `updated_at`.
  It does not get `canvas_json`.
- It orders the rows by `updated_at` descending.
- `getSketchList` itself has no filter by `user_id`.
  The RLS of the `sketches` table (`auth.uid() = user_id`) returns only the rows of the signed-in user.
  See [Database](./database.en.md).
- `getSketchList` returns `Result<T>` (`src/utils/utility.types.ts`).

### Display

| State   | Display                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------- |
| Loading | "読み込み中…" from `loading.tsx`                                                                |
| Error   | "スケッチ一覧の取得に失敗しました。" with `role="alert"`                                        |
| No rows | "スケッチがまだありません。"                                                                    |
| 1+ rows | Each item links to `/sketches/{id}`. Shows `title`, `description` (if any) and the updated time |

- The updated time is shown by `LocalTime` (`src/design-system/local-time.tsx`). It is not shown when `updated_at` is `null`.

### Creating a sketch

The new-sketch button is rendered by `NewSketchIconButton` in `NavigationMenu`, using `NewSketchButton` from `src/new-sketch/`.
`src/app/sketches/page.tsx` itself has no button.

- `NewSketchButton` is a Client Component.
  It calls the Server Action `startNewSketch` through `useActionState`.
- `startNewSketch` works as follows.
  1. It creates a client for Server Actions (`createSupabaseActionClient`).
  2. Only when `getAuthState` returns `signedOut`, it signs in anonymously by `signInAnonymously`.
  3. It creates an empty sketch by `upsertSketch` with only `fabric_version`.
     It does not pass `id`.
     `title`, `canvas_json`, `width`, `height` and so on are filled in by the DB defaults and the trigger.
     See [Database](./database.en.md).
  4. On success, it redirects to `/sketches/{id}`.
- When the anonymous sign-in or the creation fails, it returns an error message.
  `NewSketchButton` shows the message as a toast (`src/design-system/toast.tsx`).
- `<Toaster>` is placed in `src/app/layout.tsx`.

## Sketch page (`/sketches/[id]`)

`src/app/sketches/[id]/page.tsx` renders `SketchDetail` from `src/sketch-detail/`.

- `SketchDetail` calls `notFound()` when `id` is not a uuid.
- It passes a client made by `createSupabaseServerClient` to `getSketch` (`src/supabase/sketch-crud/getSketch.ts`).
- `getSketch` is server only (`server-only`).
  It gets `id`, `title`, `description`, `width`, `height`, `created_at` and `updated_at`, and also `canvas_json`, `cell_size` and `frame_id`, which are needed to restore the canvas.
  It also gets `fabric_version`, but the app does not use it.
- By the RLS, both a nonexistent `id` and an `id` of another user give `null`.

| State                         | Display                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `id` is not a uuid, or `null` | `notFound()`. `not-found.tsx` shows "スケッチが見つかりません。" and a link to the list      |
| Error                         | "スケッチの取得に失敗しました。" with `role="alert"`                                         |
| Success                       | Shows `title`, `description` (if any), `width × height`, the updated time and `SketchCanvas` |
