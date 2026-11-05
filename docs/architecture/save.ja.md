# スケッチの保存

## 流れ

```
fabric "object:added" / "object:modified"(読み込み完了後)
  -> useSave (250msのdebounce)
  -> saveToDb
  -> upsertSketch (ブラウザのSupabaseクライアント)
  -> sketchesテーブル (RLS: 自分の行のみ)
```

## ファイル

| ファイル                               | 役割                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `src/sketch-detail/save/useSave.ts`    | 自動保存がオンのとき、`object:added`と`object:modified`で保存するフックです。 |
| `src/sketch-detail/save/saveToDb.ts`   | キャンバスから行を組み立て、`upsertSketch`を呼びます。                        |
| `src/supabase/sketch-crud/handleDb.ts` | `insertSketch`、`upsertSketch`                                                |

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
- `width`、`height`、`updated_at`は、DBのトリガが最終的に確定します。
  詳細は[データベース](./database.ja.md)を参照してください。
