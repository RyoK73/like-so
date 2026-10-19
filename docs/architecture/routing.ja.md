# ルーティング

## ルート一覧

| パス             | 内容                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| `/`              | ランディングページです。認証状態によってボタンが変わります。                      |
| `/signin`        | サインインです。`src/auth-form/`の`AuthPage`を表示します。                        |
| `/signup`        | 新規登録です。ゲストの場合は、メールアドレスの登録になります。                    |
| `/sketches`      | スケッチ一覧です。`loading.tsx`を持ちます。                                       |
| `/sketches/[id]` | スケッチの個別ページです。一覧の各項目のリンク先です。`not-found.tsx`を持ちます。 |

パスごとのリダイレクトは[認証](./auth.ja.md)を参照してください。
`/signin`と`/signup`の挙動も、[認証](./auth.ja.md)を参照してください。

## ランディングページ(`/`)

`src/app/page.tsx`は、`src/landing-page/`の`LandingPage`を表示します。
未サインインでも、サインイン済みでも、常に表示します。

- `LandingPage`は、`createSupabaseServerClient`で作成したクライアントを`getAuthState`に渡し、認証状態によってボタンを出し分けます。
- 「ゲストとして続ける」は`NewSketchButton`です。
  流れは[スケッチ一覧](#スケッチ一覧sketches)の「新規作成」と同じです。

| 認証状態     | 表示するボタン                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `signedOut`  | 「ゲストとして続ける」、「サインアップ」(`/signup`)、「サインイン」(`/signin`)                 |
| `guest`      | 「スケッチ一覧へ」(`/sketches`)、「アカウント登録（他の端末でも使えるようにする）」(`/signup`) |
| `registered` | 「スケッチ一覧へ」(`/sketches`)                                                                |

## スケッチ一覧(`/sketches`)

`src/app/sketches/page.tsx`は、`src/sketch-list/`の`SketchList`を表示します。
コンポーネントの構成は[概要](./overview.ja.md)を参照してください。

`src/app/sketches/layout.tsx`は、`/sketches`配下のすべてのページ(`/sketches/[id]`を含む)に、`NavigationMenu`を表示します。
詳細は[ナビゲーションメニュー](./navigation-menu.ja.md)を参照してください。

### 取得

- `SketchList`は、`createSupabaseServerClient`で作成したクライアントを`getSketchList`(`src/supabase/sketch-crud/getSketchList.ts`)に渡します。
- `getSketchList`はサーバー専用(`server-only`)です。
- `id`、`title`、`description`、`created_at`、`updated_at`を取得します。
  `canvas_json`は取得しません。
- `updated_at`の降順に並べます。
- `getSketchList`自体には、`user_id`による絞り込みがありません。
  `sketches`テーブルのRLS(`auth.uid() = user_id`)により、ログイン中のユーザーの行だけが返ります。
  詳細は[データベース](./database.ja.md)を参照してください。
- `getSketchList`は`Result<T>`を返します(`src/utils/utility.types.ts`)。

### 表示

| 状態       | 表示                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 読み込み中 | `loading.tsx`の「読み込み中…」                                                                   |
| 取得失敗   | `role="alert"`の「スケッチ一覧の取得に失敗しました。」                                           |
| 0件        | 「スケッチがまだありません。」                                                                   |
| 1件以上    | 各項目が`/sketches/{id}`へのリンクです。`title`、`description`(ある場合)、更新日時を表示します。 |

- 更新日時は`LocalTime`(`src/design-system/local-time.tsx`)で表示します。`updated_at`が`null`の場合は表示しません。

### 新規作成

新規作成のボタンは、`NavigationMenu`の`NewSketchIconButton`が、`src/new-sketch/`の`NewSketchButton`を使って表示します。
`src/app/sketches/page.tsx`自体には、ボタンがありません。

- `NewSketchButton`はClient Componentです。
  `useActionState`でServer Action `startNewSketch`を呼びます。
- `startNewSketch`の流れは次の通りです。
  1. Server Action用のクライアント(`createSupabaseActionClient`)を作成します。
  2. `getAuthState`が`signedOut`の場合だけ、`signInAnonymously`で匿名サインインします。
  3. `upsertSketch`で、`fabric_version`だけを指定して空のスケッチを作成します。
     `id`は渡しません。
     `title`、`canvas_json`、`width`、`height`などは、DBのデフォルトとトリガが埋めます。
     詳細は[データベース](./database.ja.md)を参照してください。
  4. 成功したら、`/sketches/{id}`へリダイレクトします。
- 匿名サインインに失敗した場合、またはスケッチの作成に失敗した場合は、エラーの文言を返します。
  `NewSketchButton`は、その文言をtoast(`src/design-system/toast.tsx`)で表示します。
- `<Toaster>`は`src/app/layout.tsx`に配置しています。

## スケッチ個別(`/sketches/[id]`)

`src/app/sketches/[id]/page.tsx`は、`src/sketch-detail/`の`SketchDetail`を表示します。

- `SketchDetail`は、`id`がuuidでない場合に`notFound()`を呼びます。
- `createSupabaseServerClient`で作成したクライアントを`getSketch`(`src/supabase/sketch-crud/getSketch.ts`)に渡します。
- `getSketch`はサーバー専用(`server-only`)です。
  `id`、`title`、`description`、`width`、`height`、`created_at`、`updated_at`に加えて、キャンバスの復元に必要な`canvas_json`、`cell_size`、`frame_id`を取得します。
  `fabric_version`も取得しますが、アプリでは使っていません。
- RLSにより、存在しない`id`と他のユーザーの`id`は、どちらも`null`になります。

| 状態                           | 表示                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `id`がuuidでない、または`null` | `notFound()`。`not-found.tsx`が「スケッチが見つかりません。」と一覧へのリンクを表示します。  |
| 取得失敗                       | `role="alert"`の「スケッチの取得に失敗しました。」                                           |
| 取得成功                       | `title`、`description`(ある場合)、`width × height`、更新日時と、`SketchCanvas`を表示します。 |
