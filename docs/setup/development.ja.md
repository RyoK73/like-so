# 開発

## 開発サーバーの起動

```bash
pnpm dev
```

- `src/dev-scripts/open-localhost.ts`を実行します。
- このスクリプトは`next dev`を起動し、サーバーが"Ready"を出力したら`http://localhost:3000`をブラウザで開きます。
- 開発サーバーが終了すると、スクリプトも終了します。

## スクリプト

| コマンド           | 内容                                                             |
| ------------------ | ---------------------------------------------------------------- |
| `pnpm build`       | `next build`でビルドします。                                     |
| `pnpm start`       | ビルド済みのアプリを起動します。                                 |
| `pnpm lint`        | ESLintを実行します。                                             |
| `pnpm check`       | ESLintと`tsc --noEmit`を実行します。                             |
| `pnpm test`        | vitestをwatchモードで実行します(`*.remote.test.ts`は除外)。      |
| `pnpm test:here`   | コマンドを実行したディレクトリのテストを、1回だけ実行します。    |
| `pnpm test:remote` | リモートプロジェクトに対する`*.remote.test.ts`のみを実行します。 |
| `pnpm prtc <path>` | 指定したパスがPrettierで整形済みかを確認します(`prettier -c`)。  |
| `pnpm prtw <path>` | 指定したパスをPrettierで整形して書き込みます(`prettier -w`)。    |

## テスト

- 先に`pnpm db:start`を実行してください。
  多くのテストがローカルのSupabaseに接続します。
- `.env.local`が必要です。
  詳細は[環境変数](./environment.ja.md)を参照してください。
- `pnpm test:remote`は、Supabase Management APIでリモートプロジェクトの設定を確認します。
  - `PROJECTID`と`SUPABASE_ACCESS_TOKEN`が必要です。
  - 現在は、匿名サインインが有効であることを確認しています。
- vitestでは、`server-only`を`src/test/emptyModule.ts`に差し替えています。
- Next.jsの外で`server-only`をimportするとエラーになるためです。

## コーディング規約

- [ディレクトリ構成](../rules/directory-structure.ja.md)
- [命名](../rules/naming.ja.md)
- [TypeScript](../rules/typescript.ja.md)
- [UI文言の表記](../rules/ui-text.ja.md)
