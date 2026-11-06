# スケッチの保存

## 流れ

```
fabric "object:added" / "object:modified"(読み込み完了後)
  -> useSave (250msのdebounce)
  -> saveToDb
  -> upsertSketch (ブラウザのSupabaseクライアント)
  -> sketchesテーブル (RLS: 自分の行のみ)
```

タイトルと説明は、描画とは別の流れで保存します。

```
TitleToolbarの入力
  -> validateSketchMeta (検証。タイトルはtrim)
  -> useSaveMeta (500msのdebounce、直列化)
  -> updateSketchMeta (ブラウザのSupabaseクライアント)
  -> sketchesテーブル (RLS: 自分の行のみ)
```

## ファイル

| ファイル                                                | 役割                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/sketch-detail/save/useSave.ts`                     | 自動保存がオンのとき、`object:added`と`object:modified`で保存するフックです。 |
| `src/sketch-detail/save/saveToDb.ts`                    | キャンバスから行を組み立て、`upsertSketch`を呼びます。                        |
| `src/sketch-detail/save/useSaveMeta.ts`                 | タイトルと説明の入力を検証し、debounceして保存するフックです。                |
| `src/sketch-detail/title-toolbar/validateSketchMeta.ts` | タイトルと説明を検証する純粋関数です。                                        |
| `src/supabase/sketch-crud/handleDb.ts`                  | `insertSketch`、`upsertSketch`                                                |
| `src/supabase/sketch-crud/updateSketchMeta.ts`          | `title`と`description`だけを更新します。                                      |

## 詳細

- `useSave`
  - debounceの待ち時間(`SAVE_DELAY`)は250msで、`p-debounce`を使います。
  - 自動保存(`isAutoSave`)は、デフォルトでオンです。
  - 第4引数の`isSketchLoaded`が`true`になるまで、イベントを購読しません。
    読み込み中の`loadFromJSON`が、オブジェクトごとに`object:added`を発火するためです。
    開いただけで保存されることを防ぎます。
  - undo / redo の復元(`loadFromJSON`)も、オブジェクトごとに`object:added`を発火するため、復元後の状態が保存されます。
    ただし、オブジェクトが0個の状態への復元では`object:added`が発火しないため、保存されません。
  - 最初の保存で返ったidを`sketchIdRef`に保持し、以降は同じ行をupsertします。
  - `fabricCanvasRef`、`sketchInfoRef`、`frameRef`のいずれかが未設定の場合は、保存せずに`err`を設定します。
- `saveToDb`
  - ブラウザのSupabaseクライアントを作成し、`upsertSketch`に渡します。
  - キャンバスのJSON(`canvas.toJSON()`)とfabricのバージョンを取得します。
  - スケッチ情報(`title`、`description`、`cell_size`)と、フレーム(`width`、`height`、`frame_id`)を合成します。
- `handleDb`
  - すべての関数が`Result<T>`(`src/utils/utility.types.ts`)を返します。
  - これらは純粋なCRUD関数です。
  - `upsertSketch`は、第1引数でSupabaseクライアントを受け取ります。
    保存ではブラウザのクライアントを、新規作成([ルーティング](./routing.ja.md)を参照)ではServer Action用のクライアントを渡します。
  - `upsertSketch`は、返った行数が1でない場合にエラーとなります。
- `validateSketchMeta`
  - タイトルは、前後の空白を`trim`します。
    空、または空白のみ(半角・全角)の場合はエラーです。
    上限は、`trim`後で100文字です。
  - 説明は、入力のまま保存します。
    空文字と空白のみも有効です。
    上限は500文字です。
  - 文字数は、コードポイント単位(`[...str].length`)で数えます。
    DBの`char_length`と合わせるためです。
    このため、入力欄に`maxLength`属性は付けず、検証エラーで知らせます。
- `useSaveMeta`
  - 入力値(`title`、`description`)と、検証エラー(`errors`)を持ちます。
  - 検証を通った入力は、保存を待たずに、すぐ`onValidChange`で通知します。
    `SketchEditor`が保持し、`SketchCanvas`の`sketchInfoRef`に反映されます。
    描画の自動保存が、古いタイトルと説明で上書きしないためです。
  - どちらかが無効な場合は、保存の予約を新しく行わず、`onValidChange`も呼びません。
    入力欄の値は戻しません。
    無効になる直前の有効な入力が、まだ保存前だった場合は、その値が予定どおり保存されます。
  - 保存は、`p-debounce`で、最後の入力から500ms後に行います。
    最後に保存した値と同じ値の場合は、保存しません。
    初回表示でも保存しません。
  - 保存の通信中は、`pDebounce.promise`の`after: true`で、同時に別の通信をしません。
    通信中の入力は最新の有効な値だけを保持し、完了後に1回保存します。
  - 失敗した場合は、専用のid(`save-sketch-meta-error`)のトーストで通知します。
    入力欄の値は戻しません。
    通信中に保持していた新しい値があれば、失敗後でも保存を試みます。
    それ以外は、次の入力で再度保存します。
  - ページを離れるときに、未保存の入力を保護する仕組みはありません。
    デバウンス中の保存は取り消しませんが、完了は保証しません。
- `updateSketchMeta`
  - `id`を指定して`title`と`description`だけを更新し、`canvas_json`には触れません。
  - 返った行数が1でない場合はエラーとなります。
- `width`、`height`、`updated_at`は、DBのトリガが最終的に確定します。
  詳細は[データベース](./database.ja.md)を参照してください。
