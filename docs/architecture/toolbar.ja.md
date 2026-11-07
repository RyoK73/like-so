# ツールバー

## 概要

画面の上に重ねて浮かせるUIが、4つあります。
このドキュメントでは、4つに共通する仕様をまとめたあと、それぞれの特徴を説明します。

| 名前                   | コンポーネント   | 配置                                   | 表示されるページ              |
| ---------------------- | ---------------- | -------------------------------------- | ----------------------------- |
| ナビゲーションメニュー | `NavigationMenu` | 左端から`left-4`、縦中央(`fixed`)      | `/sketches`、`/sketches/[id]` |
| タイトル用ツールバー   | `TitleToolbar`   | 上端から`top-4`、横中央(`absolute`)    | `/sketches/[id]`              |
| 操作用ツールバー       | `ControlToolbar` | 下端から`bottom-4`、横中央(`absolute`) | `/sketches/[id]`              |
| 受け渡し用ツールバー   | `HandoffToolbar` | 右端から`right-4`、縦中央(`absolute`)  | `/sketches/[id]`              |

ナビゲーションメニューは`src/app/sketches/layout.tsx`が表示します。
ほかの3つは、`SketchCanvas`(`src/sketch-detail/sketch-canvas.tsx`)が表示します。
`SketchCanvas`の詳細は[概要](./overview.ja.md)を参照してください。

## 共通仕様

### 浮かせ方

- 本文やキャンバスの上に重ねて、浮かせます(`z-10`)。
- 4つとも、自身が位置を持ちます。
  ナビゲーションメニューは`fixed`で、ほかの3つは`absolute`です。
  幅や高さを本文から奪わないので、ツールバーの外側では、キャンバスにポインターイベントが届きます。
- 枠、影、アイコンボタンの共通のクラスは、`src/design-system/constants.ts`にあります。
  タイトル用ツールバーは`floatingToolbarClassName`を、ほかの3つは`iconItemListClassName`(`floatingToolbarClassName`を含みます)を使います。
  アイコンボタンの大きさは`iconItemClassName`です。
  色や枠の見た目は、`DESIGN.md`を参照してください。

### アイコンボタンとtooltip

- アイコンだけの項目は、`IconButton`(`src/design-system/icon-button.tsx`)または`MyToolTip`(`src/design-system/tool-tip.tsx`)で、名前をtooltipに表示します。
- `MyToolTipProvider`は、`src/app/layout.tsx`に配置しています。
- tooltipの表示位置は、ツールバーが画面のどこにあるかで決め、ツールバーごとの`constants.ts`の`TOOLTIP_SIDE`で持ちます。
  外部には公開しません。
- tooltipの見た目は、`DESIGN.md`の`tooltip`を参照してください。
- `IconButton`は、任意の`tooltipHint`(ショートカットキーなどの補足)を受け取ります。
  tooltipには「名前(`tooltipHint`)」と表示します。
  `aria-label`は、名前のままです。

### `role`と`aria-label`

| ツールバー             | 要素 / `role`    | `aria-label`           |
| ---------------------- | ---------------- | ---------------------- |
| ナビゲーションメニュー | `<nav>`          | ナビゲーションメニュー |
| タイトル用ツールバー   | なし(入力のUI)   | なし                   |
| 操作用ツールバー       | `role="toolbar"` | 操作                   |
| 受け渡し用ツールバー   | `role="toolbar"` | 受け渡し               |

- ボタンを並べる操作のUIは、`role="toolbar"`を持ちます。
- ナビゲーションメニューは、移動のリンクを含むので、`<nav>`にします。
- タイトル用ツールバーは、入力欄が並ぶだけで、操作のUIではないので、`role`を付けません。
  入力欄には、それぞれ`aria-label`(「タイトル」「説明」)があります。
- 操作用ツールバーの中の`ShapeNavigation`も、`role="toolbar"`(`aria-label`は「図形の操作」)を持ちます。

## ナビゲーションメニュー

`NavigationMenu`(`src/navigation-menu/navigation-menu.tsx`)は、Server Componentです。
`src/app/sketches/layout.tsx`が表示するので、`/sketches`と`/sketches/[id]`の両方に出ます。
画面の左端から`left-4`の位置に固定し(`fixed`)、縦中央に表示します。
本文の幅は占有しないので、本文がメニューの下に隠れないようにしたいページは、左余白に`navigationMenuInsetClassName`(`src/design-system/constants.ts`)を使います。
`/sketches`は、この余白を使っています。
`/sketches/[id]`は、canvasを画面全体に広げるので、余白は付けません。
各項目はアイコンだけのボタンかリンクです。
tooltipは、項目の右側に出します(`TOOLTIP_SIDE`は`"right"`)。
`index.ts`が公開するのは`NavigationMenu`のみです。

### 表示条件

`NavigationMenu`は、`createSupabaseServerClient`で作成したクライアントを`getAuthState`に渡し、認証状態を取得します。
`signedOut`の場合は、メニュー全体を表示しません(`null`を返します)。
項目は`menuItems`で定義し、`visibleFor`に含まれる認証状態のときだけ表示します。

| 項目         | コンポーネント        | `guest` | `registered` | 状態     |
| ------------ | --------------------- | ------- | ------------ | -------- |
| スケッチ一覧 | `SketchListLink`      | 表示    | 表示         | 実装済み |
| 新規作成     | `NewSketchIconButton` | 表示    | 表示         | 実装済み |
| テーマ切替   | `ThemeToggleButton`   | 表示    | 表示         | 実装済み |
| サインアップ | `SignUpLink`          | 表示    | 非表示       | 実装済み |
| サインイン   | `SignInLink`          | 表示    | 非表示       | 実装済み |
| サインアウト | `SignOutButton`       | 非表示  | 表示         | 実装済み |

### ファイル

| ファイル                     | 役割                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `navigation-menu.tsx`        | Server Component。認証状態に応じて項目を並べます。                              |
| `sketch-list-link.tsx`       | Client Component。`/sketches`へのリンクです。                                   |
| `new-sketch-icon-button.tsx` | `NewSketchButton`(`src/new-sketch/`)に、アイコンとtooltipの表示位置を渡します。 |
| `constants.ts`               | tooltipの表示位置(`TOOLTIP_SIDE`)を持ちます。外部には公開しません。             |
| `sign-up-link.tsx`           | `/signup`へのリンクです。                                                       |
| `sign-in-link.tsx`           | `/signin`へのリンクです。                                                       |
| `theme-toggle-button.tsx`    | Client Component。`dark`と`light`を切り替えます。                               |
| `sign-out/`                  | `SignOutButton`と`signOutAction`(Server Action)。サインアウトの処理を持ちます。 |
| `index.ts`                   | 公開するのは`NavigationMenu`です。                                              |

### 詳細

- `SketchListLink`は、`usePathname`が`/sketches`と一致するときだけ、現在地として強調します(`bg-paint-yellow`)。
  `/sketches/[id]`では強調しません。
- `NewSketchIconButton`は、`NewSketchButton`に`variant="icon"`と`tooltipSide`を渡します。
  `variant="icon"`のとき、`NewSketchButton`は`IconButton`を使います。
  手描き風の枠は付きません。
  新規作成の流れは[ルーティング](./routing.ja.md)を参照してください。
- `ThemeToggleButton`は、`next-themes`の`useTheme`で、クリックするたびに`dark`と`light`を切り替えます。
  アイコン(`LuSun`、`LuMoonStar`)は、CSSの`dark:`で出し分けます。
  ボタンとtooltip(「テーマ切り替え」)は、`IconButton`で表示します。
  `ThemeProvider`(`src/design-system/`)に依存します。
  技術スタックは[概要](./overview.ja.md)を参照してください。
- `SignOutButton`は、`useActionState`で`signOutAction`を呼びます(Client Component)。
  処理中は`disabled`になります。
  アイコンは`LuLogOut`です。
  ボタンとtooltip(「サインアウト」)は、`IconButton`で表示します。
  成功すると`/`へリダイレクトします。
  失敗すると「サインアウトに失敗しました」を返し、toast(`error`)で表示します。
- 各項目の`className`は、`NavigationMenu`が共通の値(`iconItemClassName`)を渡します。

## タイトル用ツールバー

`TitleToolbar`(`src/sketch-detail/title-toolbar/title-toolbar.tsx`)は、Client Componentです。
キャンバスの上に重ねて、上部中央に浮かせます。
`index.ts`が公開するのは`TitleToolbar`のみです。

- `title`と`description`は、常に入力欄として表示します。
  入力欄は、フォーカスされるまで枠を出しません。
- `description`の入力欄は、行数に応じて伸びます(高さの上限あり)。
- `width × height`と更新日時は、表示のみです。
- 入力の検証と保存は、[スケッチの保存](./save.ja.md)を参照してください。
- アイコンボタンを持たないので、tooltipはありません。

## 操作用ツールバー

`ControlToolbar`(`src/sketch-detail/control-toolbar/control-toolbar.tsx`)は、キャンバスの上に重ねて、画面の下端から少し浮かせて中央に置きます。
ツールバー自身が枠と配置(`absolute`)を持ち、中身は`children`で受け取ります。
`index.ts`が公開するのは、`ControlToolbar`と`ZoomControls`です。
tooltipは、項目の上側に出します(`control-toolbar/constants.ts`の`TOOLTIP_SIDE`は`"top"`)。

中身は、図形用ナビ(`ShapeNavigation`)とズームの操作(`ZoomControls`)です。

- 図形用ナビのボタンは、四角形、円、元に戻す、やり直し、削除です。
- ズームの操作は、「− 倍率の入力欄 % +」です([固定枠とパン・ズーム](./viewport.ja.md)を参照)。
- どれも、`isLoaded`が`true`になるまで無効です。
- 図形用ナビは、undo / redoでキャンバスを復元している間(`isOperable`が`false`)も無効です。
- 元に戻す、やり直しは、戻せる履歴ややり直せる履歴がないときも無効です。
- 削除ボタン(`LuTrash2`)は、選択中の図形を削除します。
  tooltipは「削除(Delete / Backspaceキー)」で、`IconButton`の`tooltipHint`で表示します。
  選択を購読しないので、図形が選択されていなくても有効で、そのときは何もしません。
  複数選択(ドラッグ選択)しているときは、すべて削除します。
- Delete、Backspaceキーでも、同じ削除ができます。
  Macの「delete」キーは、Backspaceとして届くためです。
  削除の処理とキーの受け付けは、どちらも`useDeleteSelectedShape`(`src/sketch-detail/selection/`)が持ちます。
  次のときは、Delete、Backspaceキーで削除しません。
  - Ctrl、Meta、Alt、Shiftのいずれかを押しているとき。
  - input、textarea、`contenteditable`の中で押したとき。
  - IMEで変換中のとき。
  - ボタンが無効のとき(`isLoaded`が`false`、または`isOperable`が`false`)。

## 受け渡し用ツールバー

スケッチを、LLMなど外部へ渡すためのボタンを持ちます。
`SketchCanvas`が表示するので、`/sketches/[id]`にだけ出ます。
キャンバスの上に重ねて、画面の右端から`right-4`の位置に固定し(`absolute`)、縦中央に表示します。
表示のオン/オフは切り替えず、常時表示します。
ボタンは縦に並びます。
`index.ts`が公開するのは`HandoffToolbar`のみです。

| ボタン       | コンポーネント        | アイコン     | tooltip            |
| ------------ | --------------------- | ------------ | ------------------ |
| コピー       | `CopyImageButton`     | `LuCopy`     | 画像をコピー       |
| ダウンロード | `DownloadImageButton` | `LuDownload` | 画像をダウンロード |

どちらも`IconButton`で表示します。
キャンバスの読み込み前(`isLoaded`が`false`)は、無効です。
tooltipは、項目の左側に出します(`handoff-toolbar/constants.ts`の`TOOLTIP_SIDE`は`"left"`)。

### PNGの作り方

`exportFramePng`(`handoff-toolbar/exportFramePng.ts`)が、`Promise<Blob>`を返します。

- 範囲は枠(`sketch.width` × `sketch.height`)全体です。
  パンとズームに関係なく、倍率1(枠のpxそのまま)で出力します。
  枠の外にはみ出した部分は、切り取ります。
- fabricの背景は`transparent`なので、書き出す間だけ、`backgroundColor`を紙の色にします。
  紙の色は、CSS変数`--canvas`を、クリック時に`getComputedStyle`で読みます(`getPaperColor`)。
  グリッドは含めません。
- 書き出す間だけ、`viewportTransform`を単位行列にします。
  描画は同期で行い、直後に`viewportTransform`と`backgroundColor`を元に戻します。
  例外が起きても元に戻すので、画面のパンとズームは変わりません。
- 図形が1つもなくても、そのまま出力します。

### コピー

`copyImage`(`handoff-toolbar/copy-image-button/copyImage.ts`)は、`navigator.clipboard.write`に`ClipboardItem({ "image/png": Promise<Blob> })`を渡します。
Safariでは、ユーザーの操作の中で書き込みを始める必要があるため、`Blob`ではなく`Promise<Blob>`を渡します。
成功するとtoast(`success`)で「コピーしました」、失敗するとtoast(`error`)で知らせます。
Clipboard APIが使えない環境用の代替は、ありません。

### ダウンロード

`downloadImage`(`handoff-toolbar/download-image-button/downloadImage.ts`)は、タイトルを検査してから、PNGを作って保存します。
ファイル名は、`buildPngFileName`が`{タイトル}-{YYYYMMDD-HHmmss}.png`の形(ローカル時刻)で作ります。
タイトルの前後の空白は除き、ファイル名に使えない文字(`/ \ : * ? " < > |`)は`_`に置き換えます。
次の場合は、PNGを作らず、保存もせず、toast(`error`)で知らせます。

| 条件                                  | toastの文言                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| trimして空のタイトル                  | タイトルが空のためダウンロードできません                         |
| 使えない文字だけのタイトル(`///`など) | タイトルにファイル名に使える文字がないためダウンロードできません |

成功するとtoast(`success`)で「ダウンロードしました」と知らせ、作ったObject URLは解放します。
