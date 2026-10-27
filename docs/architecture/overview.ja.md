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

| ディレクトリ           | 役割                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`             | ルーティング専用                                                                                                                  |
| `src/proxy.ts`         | Next.jsのproxy。リクエストごとに認証セッションを更新します。                                                                      |
| `src/auth-form/`       | サインインとゲスト登録のフォーム                                                                                                  |
| `src/landing-page/`    | ランディングページの表示(認証状態ごとのボタン)                                                                                    |
| `src/navigation-menu/` | ナビゲーションメニュー(認証状態ごとの項目)                                                                                        |
| `src/new-sketch/`      | スケッチの新規作成(ボタンとServer Action)                                                                                         |
| `src/sketch-detail/`   | スケッチの個別ページ(表示、描画、DBへの保存)                                                                                      |
| `src/sketch-list/`     | スケッチ一覧の表示(Server ComponentとClient Component)                                                                            |
| `src/design-system/`   | 汎用UI部品(shadcn/ui由来のボタン、入力欄、ラベル、toast、`LocalTime`、tooltip(`MyToolTip`、`MyToolTipProvider`)、`ThemeProvider`) |
| `src/supabase/`        | Supabaseのクライアント、認証、CRUD、DBテスト                                                                                      |
| `src/utils/`           | 共通の型                                                                                                                          |
| `src/dev-scripts/`     | 開発用スクリプト                                                                                                                  |
| `src/test/`            | テスト用のヘルパー                                                                                                                |

## 描画(`src/sketch-detail/`の`canvas/`・`shapes/`・`history/`・`viewport/`)

| ディレクトリ | 責務                                     |
| ------------ | ---------------------------------------- |
| `canvas/`    | fabricのキャンバスの生成・破棄・読み込み |
| `shapes/`    | 図形の作成                               |
| `history/`   | undo/redo                                |
| `viewport/`  | 固定枠、パン、ズーム                     |

| ファイル                    | 役割                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `canvas/useFabricCanvas.ts` | fabricのキャンバスを作成して`canvasJson`を読み込み、アンマウント時に破棄します。                       |
| `shapes/useShapes.ts`       | 四角形、円、三角形を、表示中のビューの中央(枠内)に追加します。                                         |
| `history/useHistory.ts`     | `past` / `present` / `future`を保持し、`set`、`undo`、`redo`を提供します。                             |
| `viewport/`                 | 固定枠、パン、ズームの計算とフック。詳細は[固定枠とパン・ズーム](./viewport.ja.md)を参照してください。 |

`useFabricCanvas`の詳細は、次の通りです。

- `loadFromJSON`は`AbortController`の`signal`を受け取り、アンマウント時に中断します。
- 読み込みが完了すると、`isLoaded`が`true`になります。
  読み込みに失敗すると、`isLoaded`は`false`のまま、`loadError`にエラーが入ります。
- `loadFromJSON`はキャンバスの背景色を消すので、読み込み後にJSONが`background`を持たない場合だけ、`backgroundColor`を設定し直します。
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

## サインインとゲスト登録(`src/auth-form/`)

| ファイル        | 役割                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `auth-page.tsx` | Server Component。認証状態を取得し、ゲストかどうかを`AuthForm`に渡します。 |
| `auth-form.tsx` | Client Component。メールアドレスとコードの入力、再送、遷移を担当します。   |
| `auth-error.ts` | Supabaseのエラーコードを、表示用の文言に変換します。                       |
| `index.ts`      | 公開するのは`AuthPage`です。                                               |

詳細は[認証](./auth.ja.md)を参照してください。

## スケッチの個別ページ(`src/sketch-detail/`)

| ファイル            | 役割                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `sketch-detail.tsx` | Server Component。`getSketch`で取得した1件のメタ情報を描画し、`SketchCanvas`に渡します。 |
| `sketch-canvas.tsx` | Client Component。キャンバス、図形の追加ボタン、自動保存を担当します。                   |
| `canvas/`           | fabricのキャンバスの生成・破棄・読み込み(前節を参照)                                     |
| `shapes/`           | 図形の作成(前節を参照)                                                                   |
| `history/`          | undo/redo(前節を参照)                                                                    |
| `viewport/`         | 固定枠、パン、ズーム(前節と[固定枠とパン・ズーム](./viewport.ja.md)を参照)               |
| `save/`             | DBへの保存に関するフックと関数([スケッチの保存](./save.ja.md)を参照)                     |
| `index.ts`          | 公開するのは`SketchDetail`のみです。                                                     |

`SketchCanvas`の詳細は、次の通りです。

- キャンバス要素は、画面の空き部分に収まる大きさにし、枠(`width` × `height`)の内容をパンとズームで表示します。
  ページ自体はスクロールしません。
- キャンバスの紙とグリッドは、親要素のCSSで描くので、fabricの背景は`transparent`です。
  グリッドの間隔は、スケッチの`cell_size`で、ズームとパンに追従します。
  枠の外側は、半透明の色で薄く表示します。
- 図形の追加ボタンは、`isSketchLoaded`が`true`になるまで無効です。
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
- [ナビゲーションメニュー](./navigation-menu.ja.md)
