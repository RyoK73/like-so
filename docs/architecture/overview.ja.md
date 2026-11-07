# 概要

## 技術スタック

| 領域            | 技術                       |
| --------------- | -------------------------- |
| フレームワーク  | Next.js(App Router)、React |
| 描画            | fabric.js                  |
| バックエンド    | Supabase(Postgres、Auth)   |
| バリデーション  | zod                        |
| スタイリング    | Tailwind CSS               |
| テスト          | vitest、Testing Library    |
| アイコン        | react-icons                |
| UI部品(tooltip) | @base-ui/react             |
| テーマ切り替え  | next-themes                |

正確なバージョンは`package.json`を参照してください。
fabric.jsだけは、`^`を付けずにバージョンを固定しています。
保存時には、その時点のバージョンを`fabric_version`としてDBに記録します。

## ディレクトリ構成

コードは「何をするか」で縦に分割しています(vertical)。
ルールは[ディレクトリ構成](../rules/directory-structure.ja.md)を参照してください。

| ディレクトリ           | 役割                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `src/app/`             | ルーティング専用                                             |
| `src/proxy.ts`         | Next.jsのproxy。リクエストごとに認証セッションを更新します。 |
| `src/auth-form/`       | サインインとゲスト登録のフォーム                             |
| `src/landing-page/`    | ランディングページの表示(認証状態ごとのボタン)               |
| `src/navigation-menu/` | ナビゲーションメニュー(認証状態ごとの項目)                   |
| `src/new-sketch/`      | スケッチの新規作成(ボタンとServer Action)                    |
| `src/sketch-detail/`   | スケッチの個別ページ(表示、描画、DBへの保存)                 |
| `src/sketch-list/`     | スケッチ一覧の表示(Server ComponentとClient Component)       |
| `src/design-system/`   | 汎用UI部品                                                   |
| `src/error-pages/`     | 404とエラー画面の共通部品                                    |
| `src/supabase/`        | Supabaseのクライアント、認証、CRUD、DBテスト                 |
| `src/utils/`           | 共通の型                                                     |
| `src/dev-scripts/`     | 開発用スクリプト                                             |
| `src/test/`            | テスト用のヘルパー                                           |

## 描画(`src/sketch-detail/`の`canvas/`・`shapes/`・`selection/`・`history/`・`viewport/`)

| ディレクトリ | 責務                                     |
| ------------ | ---------------------------------------- |
| `canvas/`    | fabricのキャンバスの生成・破棄・読み込み |
| `shapes/`    | 図形の作成                               |
| `selection/` | 選択した図形の削除                       |
| `history/`   | undo/redo                                |
| `viewport/`  | 固定枠、パン、ズーム                     |

| ファイル                              | 役割                                                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `canvas/useFabricCanvas.ts`           | fabricのキャンバスを作成して`canvasJson`を読み込み、アンマウント時に破棄します。                                                                                                                             |
| `shapes/useShapes.ts`                 | 四角形、円を、表示中のビューの中央(枠内)に追加します。                                                                                                                                                       |
| `selection/useDeleteSelectedShape.ts` | 選択した図形を削除する`deleteSelectedShape`を返し、Deleteキーも受け付けます。                                                                                                                                |
| `history/useHistory.ts`               | `past` / `present` / `future`を保持し、`recordHistory`、`undo`、`redo`を提供します。                                                                                                                         |
| `history/useCanvasHistory.ts`         | キャンバスの変更(`object:added` / `object:modified` / `object:removed`)を`useHistory`に記録し、undo / redo時に`present`をキャンバスへ反映します。同じタイミングで複数のイベントが発火しても、記録は1件です。 |
| `viewport/`                           | 固定枠、パン、ズームの計算とフック。詳細は[固定枠とパン・ズーム](./viewport.ja.md)を参照してください。                                                                                                       |

`useFabricCanvas`の詳細は、次の通りです。

- `loadFromJSON`は`AbortController`の`signal`を受け取り、アンマウント時に中断します。
- 読み込みが完了すると、`isLoaded`が`true`になります。
  読み込みに失敗すると、`isLoaded`は`false`のまま、`loadError`にエラーが入ります。
- `loadFromJSON`はキャンバスの背景色を消すので、読み込み後にJSONが`background`を持たない場合だけ、`backgroundColor`を設定し直します。
- 読み込み後に、すべてのオブジェクトの`strokeUniform`を`true`にします。
  リサイズしても線の太さを変えないためです。
  保存済みのJSONに指定がなくても揃えます。
- fabricはcanvas要素を自前のラッパーで包みます。
  そのため、canvas要素の親要素は、Reactが管理する要素(`div`など)にします。

## スケッチ一覧(`src/sketch-list/`)

| ファイル          | 役割                                                          |
| ----------------- | ------------------------------------------------------------- |
| `sketch-list.tsx` | Server Component。`getSketchList`で取得した一覧を描画します。 |
| `index.ts`        | 公開するのは`SketchList`です。                                |

## 日時表示(`src/design-system/local-time.tsx`)

`LocalTime`は、Client Componentです。
`updated_at`を`<time dateTime>`で表示します。
`LocalTime`の表示は、描画の場面によって次のように異なります。
`useSyncExternalStore`を使い、ハイドレーションの不一致を避けています。

| 場面                           | ロケール           | タイムゾーン           |
| ------------------------------ | ------------------ | ---------------------- |
| サーバー側とハイドレーション時 | `en-US`            | UTC                    |
| クライアント                   | ブラウザのロケール | ブラウザのタイムゾーン |

## スケッチの新規作成(`src/new-sketch/`)

| ファイル                | 役割                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `start-new-sketch.ts`   | Server Action。必要なら匿名サインインし、空のスケッチを作成して`/sketches/{id}`へ遷移します。                     |
| `new-sketch-button.tsx` | Client Component。`startNewSketch`を呼び、失敗したらtoastを表示します。`tooltip`を渡すと、tooltip付きになります。 |
| `index.ts`              | `NewSketchButton`と`startNewSketch`を公開します。                                                                 |

## ランディングページ(`src/landing-page/`)

| ファイル           | 役割                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `landing-page.tsx` | Server Component。認証状態を取得し、状態ごとのボタンを描画します。 |
| `introduction.tsx` | Server Component。アプリケーションの静的な紹介文を描画します。     |
| `index.ts`         | 公開するのは`LandingPage`です。                                    |

## 404とエラー画面(`src/error-pages/`)

| ファイル                   | 役割                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error-page-layout.tsx`    | 画面中央の枠です。`title`(h1)、`description`、`actions`、`illustration`を受け取って描画します。`description`と`illustration`は省略できます。            |
| `error-retry-button.tsx`   | Client Component。「再試行」ボタンで、クリックすると`onRetry`を呼びます。                                                                               |
| `error-link-button.tsx`    | `Link`を、ボタンの見た目(`outline`)で描画します。                                                                                                       |
| `universal-error-page.tsx` | Client Component。見出し、説明、警告アイコン、「再試行」ボタン、リンクボタンを組み合わせたエラー画面です。`reset`、`href`、`buttonText`を受け取ります。 |
| `index.ts`                 | `ErrorPageLayout`、`ErrorRetryButton`、`ErrorLinkButton`、`UniversalErrorPage`の4つを公開します。                                                       |

`not-found.tsx`の文言とリンク先は、`src/app/`の各ファイルに書きます。
エラー画面の文言は`UniversalErrorPage`に書き、`error.tsx`はリンク先とボタンの文言だけを渡します。
詳細は[ルーティング](./routing.ja.md)を参照してください。

## サインインとゲスト登録(`src/auth-form/`)

| ファイル        | 役割                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `auth-page.tsx` | Server Component。認証状態を取得し、ゲストかどうかを`AuthForm`に渡します。 |
| `auth-form.tsx` | Client Component。メールアドレスとコードの入力、再送、遷移を担当します。   |
| `auth-error.ts` | Supabaseのエラーコードを、表示用の文言に変換します。                       |
| `index.ts`      | 公開するのは`AuthPage`です。                                               |

詳細は[認証](./auth.ja.md)を参照してください。

## スケッチの個別ページ(`src/sketch-detail/`)

| ファイル            | 役割                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `sketch-detail.tsx` | Server Component。`getSketch`で取得した1件を`SketchEditor`に渡します。                                                                     |
| `sketch-editor.tsx` | Client Component。`TitleToolbar`で検証を通ったタイトルと説明を保持し、`SketchCanvas`に渡します。                                           |
| `sketch-canvas.tsx` | Client Component。キャンバス、操作用ツールバー(`ControlToolbar`)、自動保存を担当します。                                                   |
| `title-toolbar/`    | タイトル用ツールバー(`TitleToolbar`)。タイトルと説明の入力欄、サイズ、更新日時を表示します。入力値の検証(`validateSketchMeta`)もあります。 |
| `control-toolbar/`  | 操作用ツールバー(`ControlToolbar`)の枠と、ズームの操作(`zoom-controls/`の`ZoomControls`)、図形の追加・削除ボタンなど(`ShapeNavigation`)    |
| `handoff-toolbar/`  | 受け渡し用ツールバー(`HandoffToolbar`)。スケッチの画像をコピーまたはダウンロードするボタンを持ちます                                       |
| `canvas/`           | fabricのキャンバスの生成・破棄・読み込み(前節を参照)                                                                                       |
| `selection/`        | 選択した図形の削除(前節を参照)                                                                                                             |
| `shapes/`           | 図形の作成(前節を参照)                                                                                                                     |
| `history/`          | undo/redo(前節を参照)                                                                                                                      |
| `viewport/`         | 固定枠、パン、ズーム(前節と[固定枠とパン・ズーム](./viewport.ja.md)を参照)                                                                 |
| `save/`             | DBへの保存に関するフックと関数([スケッチの保存](./save.ja.md)を参照)                                                                       |
| `index.ts`          | 公開するのは`SketchDetail`のみです。                                                                                                       |

`SketchCanvas`の詳細は、次の通りです。

- キャンバス要素は、画面全体(`h-dvh`、余白なし)に広げ、枠(`width` × `height`)を中央に置いて、内容をパンとズームで表示します。
  ページ自体はスクロールしません。
- キャンバスの紙とグリッドは、キャンバス要素のCSSで描くので、fabricの背景は`transparent`です。
  グリッドの間隔は、スケッチの`cell_size`で、ズームとパンに追従します。
  グリッドは枠の外側にも続き、枠の外側を暗くすることはしません。
  枠は、細い枠線(`brush-a`と`ring-border`)で示します。
- キャンバスの上には、タイトル用、操作用、受け渡し用のツールバーを重ねて浮かせます。
  配置と仕様は、[ツールバー](./toolbar.ja.md)を参照してください。
- 保存に失敗すると、固定の文言をtoast(`id`は固定)で表示します。
  同じ`id`のtoastは、重ねずに更新されます。
- 読み込みに失敗した場合、または`canvas_json`がオブジェクトでない場合は、キャンバスとボタンを表示しません。
  `role="alert"`の文言と、一覧へのリンクを表示します。
  自動保存が、読み込めなかった内容を上書きするのを防ぐためです。

## 次のステップ

- [ルーティング](./routing.ja.md)
- [認証](./auth.ja.md)
- [データベース](./database.ja.md)
- [スケッチの保存](./save.ja.md)
- [ツールバー](./toolbar.ja.md)
