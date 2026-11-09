# 環境変数

## 置き場所

- リポジトリ直下に`.env.local`を作成します。
- `.env.example`をコピーして作成してください。
- `.env*`はgit管理外です。ただし`.env.example`のみ管理対象です。
- `src/setupTests.ts`が全テストの実行時に`.env.local`を読み込みます。
- そのため、`pnpm test`の実行にも`.env.local`が必要です。

## 変数一覧

| 変数                            | 使用箇所                            | 用途                                      |
| ------------------------------- | ----------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | アプリ(ブラウザ、サーバー)          | SupabaseプロジェクトのURL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | アプリ(ブラウザ、サーバー)          | Supabaseのanonキー                        |
| `SUPABASE_SECRET_KEY`           | アプリ(サーバーのみ)                | Supabaseのsecret key(匿名サインイン専用)  |
| `SUPABASE_LOCAL_URL`            | ローカルDBに対するテスト            | ローカルSupabaseのAPI URL                 |
| `SUPABASE_LOCAL_ANON_KEY`       | ローカルDBに対するテスト            | ローカルSupabaseのanonキー                |
| `SUPABASE_LOCAL_ADMIN_KEY`      | ローカルDBに対するテスト            | ローカルSupabaseの管理者キー              |
| `SUPABASE_LOCAL_DB_URL`         | `pg`でPostgresに直接接続するテスト  | ローカルDBの接続文字列                    |
| `PROJECTID`                     | `pnpm type:gen`、`pnpm test:remote` | リモートSupabaseのプロジェクトID          |
| `SUPABASE_ACCESS_TOKEN`         | `pnpm test:remote`                  | Supabase Management APIのアクセストークン |

- アプリは`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SECRET_KEY`をzodで検証します(`src/supabase/utils/env.ts`)。
- `SUPABASE_SECRET_KEY`は、RLSをバイパスします。
  `NEXT_PUBLIC_`を付けず、ブラウザに公開しないでください。
  使うのは、匿名サインイン専用のクライアントだけです。
  詳細は[認証](../architecture/auth.ja.md)を参照してください。
- 本番では、VercelのEnvironment Variablesに`SUPABASE_SECRET_KEY`を登録します。
  SupabaseダッシュボードのAuthentication > Rate Limitsで、IP address forwardingも有効にします。
- ローカル用の値は、`pnpm db:start`の後に`pnpm db:status`で確認できます。
  `SUPABASE_SECRET_KEY`のローカル用の値は、`sb_secret_`で始まるキーです。
  この値は、匿名サインインを実際のローカルSupabaseに対して行うテストにも必要です。
- 実際の値は絶対にコミットしないでください。

## 次のステップ

- [データベース](./database.ja.md)
