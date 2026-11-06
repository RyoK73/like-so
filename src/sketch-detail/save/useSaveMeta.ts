import { useState } from "react";
import pDebounce from "p-debounce";
import { toast } from "@/design-system/toast";
import { updateSketchMeta } from "@/supabase/sketch-crud/updateSketchMeta";
import type { SketchMeta } from "@/supabase/sketch-crud/updateSketchMeta.types";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import {
  validateSketchMeta,
  type SketchMetaErrors,
} from "@/sketch-detail/title-toolbar/validateSketchMeta";

const SAVE_DELAY = 500;
const SAVE_META_ERROR_TOAST_ID = "save-sketch-meta-error";

const isSameAsSavedMeta = (meta: SketchMeta, savedMeta: SketchMeta) =>
  meta.title === savedMeta.title && meta.description === savedMeta.description;

type UseSaveMetaParams = {
  sketchId: string;
  initial: SketchMeta;
  // Called as soon as the input is valid, without waiting for the save.
  onValidChange: (meta: SketchMeta) => void;
};

// Save the title and the description with a debounce.
// Saves never run at the same time: while a save is in flight, only the latest valid value is kept and saved after it.
const useSaveMeta = ({
  sketchId,
  initial,
  onValidChange,
}: UseSaveMetaParams) => {
  const [title, setTitleState] = useState(initial.title);
  const [description, setDescriptionState] = useState(initial.description);
  const [errors, setErrors] = useState<SketchMetaErrors>({});

  // Created once per mount. It keeps the last saved value inside, so React does not need to know it.
  const [debouncedSave] = useState(() => {
    let lastSavedMeta = initial;

    // Skipping a value that is already saved makes a value that returns to the saved one cause no request.
    const saveUnlessSaved = async (meta: SketchMeta) => {
      if (isSameAsSavedMeta(meta, lastSavedMeta)) return;
      const result = await updateSketchMeta(
        createSupabaseBrowserClient(),
        sketchId,
        meta,
      );
      if (!result.ok) {
        // TODO(#70): Log `result.error` according to the policy decided in #70.
        toast.add({
          type: "error",
          title: "タイトルと説明の保存に失敗しました。",
          id: SAVE_META_ERROR_TOAST_ID,
        });
        return;
      }
      lastSavedMeta = meta;
    };

    // `after: true` keeps only the latest call during a save, and runs it after the save finishes.
    const saveOneByOne = pDebounce.promise(saveUnlessSaved, { after: true });
    return pDebounce(saveOneByOne, SAVE_DELAY);
  });

  const handleChange = (next: SketchMeta) => {
    const result = validateSketchMeta(next);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onValidChange(result.value);
    void debouncedSave(result.value);
  };

  const setTitle = (value: string) => {
    setTitleState(value);
    handleChange({ title: value, description });
  };

  const setDescription = (value: string) => {
    setDescriptionState(value);
    handleChange({ title, description: value });
  };

  return { title, description, setTitle, setDescription, errors };
};

export { useSaveMeta };
