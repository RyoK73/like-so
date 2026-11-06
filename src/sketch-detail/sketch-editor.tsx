"use client";
import { useState } from "react";
import { SketchCanvas } from "@/sketch-detail/sketch-canvas";
import { TitleToolbar } from "@/sketch-detail/title-toolbar";
import type { GetSketch } from "@/supabase/sketch-crud/getSketch.types";
import type { SketchMeta } from "@/supabase/sketch-crud/updateSketchMeta.types";

// `TitleToolbar` and `SketchCanvas` are siblings, so this component holds the valid title and description between them.
// `SketchCanvas` keeps the values in `sketchInfoRef`, so the auto-save of the canvas does not overwrite them with the old ones.
const SketchEditor = ({ sketch }: { sketch: GetSketch }) => {
  const [meta, setMeta] = useState<SketchMeta>({
    title: sketch.title,
    description: sketch.description,
  });

  return (
    <>
      <TitleToolbar
        sketchId={sketch.id}
        title={sketch.title}
        description={sketch.description}
        width={sketch.width}
        height={sketch.height}
        updatedAt={sketch.updated_at}
        onSaved={setMeta}
      />
      <SketchCanvas sketch={{ ...sketch, ...meta }} />
    </>
  );
};

export { SketchEditor };
