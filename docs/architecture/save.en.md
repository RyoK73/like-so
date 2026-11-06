# Saving sketches

## Flow

```
fabric "object:added" / "object:modified" (after loading)
  -> useSave (debounce 250 ms)
  -> saveToDb
  -> upsertSketch (browser Supabase client)
  -> sketches table (RLS: own rows only)
```

The title and the description are saved by a separate flow from drawing.

```
Input of TitleToolbar
  -> validateSketchMeta (validation; the title is trimmed)
  -> useSaveMeta (debounce 500 ms, serialized)
  -> updateSketchMeta (browser Supabase client)
  -> sketches table (RLS: own rows only)
```

## Files

| File                                                    | Role                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/sketch-detail/save/useSave.ts`                     | Hook that saves on `object:added` and `object:modified` when auto-save is on                |
| `src/sketch-detail/save/saveToDb.ts`                    | Builds the row from the canvas and calls `upsertSketch`                                     |
| `src/sketch-detail/save/useSaveMeta.ts`                 | Hook that validates the input of the title and the description and saves it with a debounce |
| `src/sketch-detail/title-toolbar/validateSketchMeta.ts` | Pure function that validates the title and the description                                  |
| `src/supabase/sketch-crud/handleDb.ts`                  | `insertSketch`, `upsertSketch`                                                              |
| `src/supabase/sketch-crud/updateSketchMeta.ts`          | Updates only `title` and `description`                                                      |

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
- `validateSketchMeta`
  - The title is trimmed on both sides.
    It is an error when it is empty or only spaces (half-width or full-width).
    The limit is 100 characters after trimming.
  - The description is saved as it is. An empty string and only spaces are valid. The limit is 500 characters.
  - Characters are counted by code points (`[...str].length`), to match `char_length` of the DB.
    So the inputs do not have the `maxLength` attribute, and an invalid input is shown as a validation error.
- `useSaveMeta`
  - Holds the input values (`title`, `description`) and the validation errors (`errors`).
  - A valid input is notified by `onValidChange` right away, without waiting for the save.
    `SketchEditor` holds it, and it is reflected in `sketchInfoRef` of `SketchCanvas`.
    This keeps the auto-save of drawing from overwriting them with the old title and description.
  - If either of them is invalid, it does not schedule a new save and does not call `onValidChange`.
    The value in the input is not reverted.
    If a valid input just before it is not saved yet, that value is saved as scheduled.
  - It saves 500 ms after the last input, using `p-debounce`.
    It does not save when the value is the same as the last saved one, nor on the first render.
  - It never runs two requests at the same time, using `after: true` of `pDebounce.promise`.
    While a save is in flight, only the latest valid value is kept, and it is saved once after the save finishes.
  - On failure, it shows a toast with its own id (`save-sketch-meta-error`).
    It does not revert the input.
    If a newer value was kept during the save, it tries to save it even after the failure.
    Otherwise, it tries to save again at the next input.
  - There is no mechanism to protect an unsaved input when the user leaves the page.
    A debounced save is not cancelled, but its completion is not guaranteed.
- `updateSketchMeta`
  - Updates only `title` and `description` of the row with the given `id`, and does not touch `canvas_json`.
  - It is an error if the number of returned rows is not 1.
- `width`, `height` and `updated_at` are finished by DB triggers. See [Database](./database.en.md).
