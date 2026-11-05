# Saving sketches

## Flow

```
fabric "object:added" / "object:modified" (after loading)
  -> useSave (debounce 250 ms)
  -> saveToDb
  -> upsertSketch (browser Supabase client)
  -> sketches table (RLS: own rows only)
```

## Files

| File                                   | Role                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `src/sketch-detail/save/useSave.ts`    | Hook that saves on `object:added` and `object:modified` when auto-save is on |
| `src/sketch-detail/save/saveToDb.ts`   | Builds the row from the canvas and calls `upsertSketch`                      |
| `src/supabase/sketch-crud/handleDb.ts` | `insertSketch`, `upsertSketch`                                               |

## Details

- `useSave`
  - The debounce delay (`SAVE_DELAY`) is 250 ms and uses `p-debounce`.
  - Auto-save (`isAutoSave`) is on by default.
  - It does not subscribe to the events until the fourth argument `isSketchLoaded` becomes `true`.
    This is because `loadFromJSON` fires `object:added` for each object while loading.
    It keeps a sketch from being saved just by opening it.
  - Restoring by undo / redo (`loadFromJSON`) also fires `object:added` for each object, so the restored state is saved.
    However, restoring to a state with zero objects fires no `object:added`, so it is not saved.
  - The id returned by the first save is kept in `sketchIdRef`, and later saves upsert the same row.
  - If any of `fabricCanvasRef`, `sketchInfoRef` and `frameRef` is not set, it sets `err` instead of saving.
- `saveToDb`
  - Creates a browser Supabase client and passes it to `upsertSketch`.
  - Takes the canvas JSON (`canvas.toJSON()`) and the fabric version.
  - Combines them with the sketch info (`title`, `description`, `cell_size`) and the frame (`width`, `height`, `frame_id`).
- `handleDb`
  - Every function returns `Result<T>` (`src/utils/utility.types.ts`).
  - These are the pure CRUD functions.
  - `upsertSketch` takes a Supabase client as the first argument.
    Saving passes the browser client, and creating a sketch (see [Routing](./routing.en.md)) passes the client for Server Actions.
  - `upsertSketch` is an error if the number of returned rows is not 1.
- `width`, `height` and `updated_at` are finished by DB triggers. See [Database](./database.en.md).
