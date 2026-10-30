# データベース

Supabase上のPostgresです。
スキーマは`supabase/migrations/`で定義されています。
生成された型は`src/supabase/utils/database.types.ts`にあります。
アプリが参照する型は`src/supabase/utils/modifiedDatabase.types.ts`の`DatabaseModified`です。
`DatabaseModified`は生成された`Database`の`sketches.canvas_json`を、`FabricJSON`(`string | Record<string, unknown>`)に差し替えたものです。
`FabricJSON`は、fabricの`loadFromJSON`の第1引数に基づきます。

## テーブル

### `public.sketches`

ユーザーが描いたスケッチです。

| カラム                     | 備考                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `id`                       | uuid、主キー                                                                            |
| `user_id`                  | `auth.users`を参照します(`ON DELETE CASCADE`)。デフォルトは`auth.uid()`です。           |
| `title`                    | デフォルトは`'Untitled'`です。                                                          |
| `description`              | `NOT NULL`。デフォルトは`''`です。                                                      |
| `canvas_json`              | jsonb。fabricのキャンバスを`toJSON()`でシリアライズしたものです。デフォルトは`{}`です。 |
| `fabric_version`           | 保存時のpackage.jsonのfabricのバージョンです。                                          |
| `frame_id`                 | `canvas_frames`を参照します(`ON DELETE SET NULL`)。                                     |
| `width`, `height`          | 320〜1920                                                                               |
| `cell_size`                | デフォルトは20です。4〜200                                                              |
| `created_at`, `updated_at` | `NOT NULL`。`updated_at`は`trg_set_updated_at`トリガで設定されます。                    |

`description`、`created_at`、`updated_at`の`NOT NULL`のテストは`src/supabase/DB/sketchesNotNull.test.ts`にあります。

### `public.canvas_frames`

スケッチが使用できるキャンバスのサイズ(フレーム)です。

| カラム            | 備考                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| `id`              | uuid、主キー                                                                      |
| `user_id`         | `auth.users`を参照します(`ON DELETE CASCADE`)。`NULL`は公式プリセットを表します。 |
| `name`            | 1〜100文字。空白のみは不可です。公式プリセットの名前は一意です。                  |
| `width`, `height` | 320〜1920                                                                         |

### 公式フレーム

`supabase/seed.sql`が、公式フレームを7件登録します(`user_id`は`NULL`)。

| 名前               | サイズ    |
| ------------------ | --------- |
| `desktop_fhd`      | 1920x1080 |
| `laptop`           | 1440x900  |
| `tablet_portrait`  | 768x1024  |
| `tablet_landscape` | 1024x768  |
| `mobile_portrait`  | 390x844   |
| `mobile_landscape` | 844x390   |
| `mobile_small`     | 320x568   |

## フレームとサイズのルール

`sketches_apply_frame`トリガが、insertの前、または`frame_id`、`width`、`height`のupdateの前に実行されます。

- insert時に何も指定がなければ、`desktop_fhd`のフレームを適用します。
- `frame_id`のみが指定された場合は、フレームの幅と高さをコピーします。
- `width`と`height`が指定された場合は、それを優先します。
- フレームと一致しなければ、`frame_id`を`NULL`にします。
- insert時に`width`と`height`の片方だけを指定すると、エラーになります。

## Row Level Security

- 両方のテーブルでRLSが有効です。
- `sketches`: ユーザーは自分の行に対して、すべての操作ができます(`auth.uid() = user_id`)。
- `canvas_frames`: ユーザーは公式フレームと自分のフレームを読み取れます。作成、更新、削除は自分のフレームのみです。

## 権限

- `anon`と`service_role`には、これらのテーブルに対する権限がありません。
- `authenticated`には、`SELECT`、`INSERT`、`UPDATE`、`DELETE`のみがあります。
- `public`スキーマのデフォルト権限は、`anon`、`authenticated`、`service_role`から取り消されています。
- これらのルールのテストは`src/supabase/DB/privileges.test.ts`にあります。

## スキーマの変更手順

1. `pnpm db:new`でマイグレーションを作成します。
   詳細は[データベースのセットアップ](../setup/database.ja.md)を参照してください。
2. テーブルを変更するマイグレーションは、`SET lock_timeout = '5s'`から始めます。
3. `pnpm type:gen-local`で型を再生成します。
4. このドキュメントを更新します。
