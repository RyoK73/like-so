# ナビゲーションメニュー

## 概要

`NavigationMenu`(`src/navigation-menu/navigation-menu.tsx`)は、Server Componentです。
`src/app/sketches/layout.tsx`が表示するので、`/sketches`と`/sketches/[id]`の両方に出ます。
画面の左側に固定(`fixed top-1/2 left-4`)で表示し、各項目はアイコンだけのボタンかリンクです。
`index.ts`が公開するのは`NavigationMenu`のみです。

## 表示条件

`NavigationMenu`は、`createSupabaseServerClient`で作成したクライアントを`getAuthState`に渡し、認証状態を取得します。
`signedOut`の場合は、メニュー全体を表示しません(`null`を返します)。
項目は`menuItems`で定義し、`visibleFor`に含まれる認証状態のときだけ表示します。

| 項目         | コンポーネント        | `guest` | `registered` | 状態                     |
| ------------ | --------------------- | ------- | ------------ | ------------------------ |
| スケッチ一覧 | `SketchListLink`      | 表示    | 表示         | 実装済み                 |
| 新規作成     | `NewSketchIconButton` | 表示    | 表示         | 実装済み                 |
| テーマ切替   | `ThemeToggleButton`   | 表示    | 表示         | 実装済み                 |
| サインアップ | `SignUpLink`          | 表示    | 非表示       | 実装済み                 |
| サインイン   | `SignInLink`          | 表示    | 非表示       | 実装済み                 |
| サインアウト | `SignOutButton`       | 非表示  | 表示         | 未実装(プレースホルダー) |

- `SignOutButton`は、`aria-label`だけを持つ空の`button`を、`form`で包んだものです。
  アイコン、tooltip、処理を持ちません。

## ファイル

| ファイル                     | 役割                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `navigation-menu.tsx`        | Server Component。認証状態に応じて項目を並べます。                    |
| `sketch-list-link.tsx`       | Client Component。`/sketches`へのリンクです。                         |
| `new-sketch-icon-button.tsx` | `NewSketchButton`(`src/new-sketch/`)に、アイコンとtooltipを渡します。 |
| `sign-up-link.tsx`           | `/signup`へのリンクです。                                             |
| `sign-in-link.tsx`           | `/signin`へのリンクです。                                             |
| `theme-toggle-button.tsx`    | Client Component。`dark`と`light`を切り替えます。                     |
| `sign-out-button.tsx`        | プレースホルダーです。                                                |
| `index.ts`                   | 公開するのは`NavigationMenu`です。                                    |

## 詳細

- `SketchListLink`は、`usePathname`が`/sketches`と一致するときだけ、現在地として強調します(`bg-ds-primary`)。
  `/sketches/[id]`では強調しません。
- `NewSketchIconButton`は、`NewSketchButton`の`tooltip`プロップを使います。
  新規作成の流れは[ルーティング](./routing.ja.md)を参照してください。
- `ThemeToggleButton`は、`next-themes`の`useTheme`で、クリックするたびに`dark`と`light`を切り替えます。
  アイコン(`LuSun`、`LuMoonStar`)は、CSSの`dark:`で出し分けます。
  tooltip(「テーマ切り替え」)は、`MyToolTip`で右側(`side="right"`)に表示します。
  `ThemeProvider`(`src/design-system/`)に依存します。
  技術スタックは[概要](./overview.ja.md)を参照してください。
- 各項目の`className`は、`NavigationMenu`が共通の値(`iconItemClassName`)を渡します。

## tooltip

アイコンだけの項目は、`MyToolTip`(`src/design-system/tool-tip.tsx`)で名前を表示します。
表示位置は、すべて`side="right"`(項目の右側)です。
`MyToolTipProvider`は、`src/app/layout.tsx`に配置しています。
見た目は、`DESIGN.md`の`tooltip`を参照してください。
