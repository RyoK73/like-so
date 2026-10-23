# ディレクトリ構成規約 - Vertical Codebase -

## ディレクトリ・ファイルの配置ルール

### What

- **技術的な種類(component/hooks/utils)**ではなく、**「何をするか(ドメイン・機能)」**を基準にフォルダを分割する

### Why

- 技術的な関心(component/hook/util/lib)ではなく、意味のあるまとまり(login,widgets...etc)を優先する

| structure  | features                                             | Pros                                                  | Cons                               |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| horizontal | `src/components,utils,hooks`など*技術種別ごと*で分割 | 一見わかりやすい                                      | コード量増加で参照が増える         |
| vertical   | *なにをするか*で分割                                 | 変更時の参照箇所が1箇所に収まり、認知負荷を下げられる | 分類を見極めるのが難しい場合がある |

## `src/app/`はルーティング専用

- `page.tsx`/`layout.tsx`にロジックやUIの実装を直接書かない
- 実装は対応する`src/{vertical名}/`からimportして薄くつなぐだけ
- `app`/`login`などにルーティング以外に必要なファイルを置かない。
- ロジックを混在させるとルーティング定義と機能実装が増え肥大化・可読性低下につながる

### Example

```bash
src/
├── app/                    # Next.js App Router専用。ルーティングの薄い入り口のみ
│   └── login/
│       └── page.tsx
├── login/                  # 機能単位のvertical。ログインに関するもの全部
│   ├── login-form.tsx
│   ├── login-form.test.tsx
│   ├── use-login.ts
│   ├── login-action.ts
│   ├── login-schema.ts
│   └── index.ts            # 外部公開インターフェース
├── design-system/          # ドメインに属さない汎用UI部品
│   ├── button.tsx          # shadcn/uiが生成した"素"のプリミティブ
│   ├── dialog.tsx
│   └── primary-button.tsx  # button.tsx をラップした自社独自コンポーネント
├── utils/                    # ドメインに属さない汎用関数
└── widgets/                # 複数ページ・機能から使われる独立verticalの例
```

## 機能ごとに`src/{vertical名}/`を作り、関連コードをすべて集約する

対象は component / hook / util / type / schema / action など種類を問わない。
**「そのvertical(機能)が変更されたら一緒に変更されるか」**を基準に置き場所を判断する。

### Example

ログイン機能なら `src/login/` に、フォームUI・バリデーション・API呼び出し・関連する型を全てまとめる。

```bash
src/
├── login/                  # 機能単位のvertical。ログインに関するもの全部
│   ├── login-form.tsx
│   ├── login-form.test.tsx
│   ├── use-login.ts
│   ├── login-action.ts
│   ├── login-schema.ts
│   └── index.ts            # 外部公開インターフェース
~~~~~
```

## 汎用UI部品は`src/design-system/`へ

- 特定の機能・ドメインに依存しない、再利用前提のUI部品(Button, Input, Dialog等)が対象
- 素のshadcn部品をラップして独自スタイルを当てる場合は `design-system/` 直下に分けて置く

> Ex
> `design-system/button.tsx` ← 素の部品
> `design-system/primary-button.tsx` ← ラップ後

### shadcn/uiへの対応

- shadcn/uiで生成したコンポーネントは `src/design-system/` 直下にそのまま配置する
- `components.json` の `aliases` を変更し、以降の `npx shadcn add` でも自動的に正しい場所に生成されるようにする

```json
// components.json
"aliases": {
  "components": "@/components",
  "utils": "@/design-system/utils",
  "ui": "@/design-system/",
  "lib": "@/design-system/utils",
  "hooks": "@/design-system/hooks"
}
```

## 複数のvertical(機能)から使われるコードは、それ自体を独立したverticalにする

- 特定の機能に属さないが、汎用UI部品とも言えないもの(例: 複数ページで使う`PageFilters`のような複合UI)が対象
- 安易に「共通」フォルダへ逃さず、`src/<新しいvertical名>/` として切り出す

## 各verticalの公開範囲は `index.ts` で明示する

- vertical内部でのみ使うファイル(hookやactionの詳細実装等)は外部からdeep importさせない
- 他のverticalから使わせたいものだけを `index.ts` からexportする

```ts
// src/login/index.ts
export { LoginForm } from "./login-form";
// use-login.ts, login-action.ts は非公開(vertical内部専用)
```

> 検討中: ESLintルール(例: `eslint-plugin-boundaries`)などで、
> `index.ts` を経由しないdeep importを機械的に禁止する

## verticalの内部は、責務ごとのサブディレクトリに分けてよい

- 1つのverticalのファイルが増えたら、`src/{vertical名}/`の中を、責務ごとのサブディレクトリに分けてよい。
- 分ける基準は、技術的な種類(`hooks/`、`components/`など)ではなく、責務(`canvas/`、`save/`など)とする。
- サブディレクトリの中のファイルは、同じvertical内からのみ使う。
  外部への公開は、vertical直下の`index.ts`だけで行う。

### Example

```bash
src/
├── sketch-detail/          # スケッチの個別ページ
│   ├── sketch-detail.tsx
│   ├── sketch-canvas.tsx
│   ├── canvas/             # fabricキャンバスの生成・破棄・読み込み
│   │   └── useFabricCanvas.ts
│   ├── shapes/             # 図形の作成
│   │   └── useShapes.ts
│   ├── history/            # undo/redo
│   │   └── useHistory.ts
│   ├── save/               # DBへの保存に関するフックと関数
│   │   ├── useSave.ts
│   │   └── saveToDb.ts
│   └── index.ts            # 外部公開インターフェース
```

## 判断フローチャート(コンポーネントをどこに置くか迷った時)

1. **ロジックを持たない、見た目だけの汎用UI部品か？**
   → `design-system/` へ
2. **特定の機能(vertical)専用で、他から使われないか？**
   → その機能の `src/<vertical名>/` 内に置く(index.tsからは公開しない)
3. **複数の機能から使われる、特定用途のコンポーネントか？**
   → それ自体を新しいverticalとして独立させる(`src/<新しいvertical名>/`)

## 注意点

- *正しいVertical名・分類*を見極めるのは簡単ではない。チーム内で相談する必要あり
- `idex.ts`とのセット運用で、依存関係を明確化する必要あり
