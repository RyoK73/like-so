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
See [Toolbars](./toolbar.en.md) for details.

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
- The browser back button reuses the client cache of Next.js.
  To show the latest list after a save on the sketch page, the cache of `/sketches` is discarded after a save succeeds.
  See `revalidateSketchList` in [Saving sketches](./save.en.md).

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
  1. It creates a client for Server Actions (`createSupabaseAnonActionClient`).
  2. Only when `getAuthState` returns `signedOut`, it signs in anonymously by `signInAnonymouslyWithForwardedIp`.
     After signing in, it creates `createSupabaseAnonActionClient` again.
     See [Authentication](./auth.en.md).
  3. It creates an empty sketch by `upsertSketch` with only `fabric_version`.
     It does not pass `id`.
     `title`, `canvas_json`, `width`, `height` and so on are filled in by the DB defaults and the trigger.
     See [Database](./database.en.md).
  4. On success, it redirects to `/sketches/{id}`.
- It returns an error message in the following cases.
  - When the anonymous sign-in fails, it returns "サインインに失敗しました。".
  - When `upsertSketch` fails with `SK001` (the sketch count limit), it returns "スケッチの作成上限に達しました。".
    See [Database](./database.en.md) for the limit.
  - When the creation fails for any other reason, it returns "スケッチの作成に失敗しました。".
- `NewSketchButton` shows the returned message as a toast (`src/design-system/toast.tsx`).
- `<Toaster>` is placed in `src/app/layout.tsx`.

## Sketch page (`/sketches/[id]`)

`src/app/sketches/[id]/page.tsx` renders `SketchDetail` from `src/sketch-detail/`.

- `SketchDetail` calls `notFound()` when `id` is not a uuid.
- It passes a client made by `createSupabaseServerClient` to `getSketch` (`src/supabase/sketch-crud/getSketch.ts`).
- `getSketch` is server only (`server-only`).
  It gets `id`, `title`, `description`, `width`, `height`, `created_at` and `updated_at`, and also `canvas_json`, `cell_size` and `frame_id`, which are needed to restore the canvas.
  It also gets `fabric_version`, but the app does not use it.
- By the RLS, both a nonexistent `id` and an `id` of another user give `null`.

| State                         | Display                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `id` is not a uuid, or `null` | `notFound()`. `not-found.tsx` shows "スケッチが見つかりません。" and a link to the list                            |
| Error                         | "スケッチの取得に失敗しました。" with `role="alert"`                                                               |
| Success                       | Shows `TitleToolbar` (inputs for `title` and `description`, `width × height`, the updated time) and `SketchCanvas` |

## 404 and error pages

The frame, the retry button, the link button and the error page (`UniversalErrorPage`) are components in `src/error-pages/`.
See [Overview](./overview.en.md) for details.
`not-found.tsx` writes the wording and the link target in each file.
`error.tsx` passes the link target and the button text to `UniversalErrorPage`.

| File                                  | Kind             | Heading                  | Actions                                      |
| ------------------------------------- | ---------------- | ------------------------ | -------------------------------------------- |
| `src/app/not-found.tsx`               | Server Component | ページが見つかりません   | "トップへ戻る" (`/`)                         |
| `src/app/sketches/[id]/not-found.tsx` | Server Component | スケッチが見つかりません | "スケッチ一覧へ戻る" (`/sketches`)           |
| `src/app/error.tsx`                   | Client Component | 問題が発生しました       | "再試行", "トップへ戻る" (`/`)               |
| `src/app/sketches/error.tsx`          | Client Component | 問題が発生しました       | "再試行", "スケッチ一覧へ戻る" (`/sketches`) |

- `error.tsx` receives only `reset`.
  It does not receive `error`, so `message`, `stack` and `digest` are never shown.
- "再試行" calls `reset` to render the segment again.
- `src/app/sketches/error.tsx` is rendered inside `sketches/layout.tsx`.
  So `NavigationMenu` stays on an error.
- There is no `global-error.tsx`.
  An error in the root `layout.tsx` shows the default Next.js screen.
