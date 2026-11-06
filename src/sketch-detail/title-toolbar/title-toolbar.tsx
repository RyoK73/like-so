"use client";
import { cn } from "cn";
import { floatingToolbarClassName } from "@/design-system/constants";
import { LocalTime } from "@/design-system/local-time";
import { useSaveMeta } from "@/sketch-detail/save/useSaveMeta";
import type { SketchMeta } from "@/supabase/sketch-crud/updateSketchMeta.types";

type TitleToolbarProps = {
  sketchId: string;
  title: string;
  description: string;
  width: number;
  height: number;
  updatedAt: string;
  onSaved: (meta: SketchMeta) => void;
};

// The fields have no border until they are focused, so the toolbar looks like a plain title.
const fieldClassName =
  "w-full min-w-0 border-b-2 border-transparent bg-transparent outline-none transition-colors focus-visible:border-ring aria-invalid:border-destructive";

const TitleToolbar = ({
  sketchId,
  title,
  description,
  width,
  height,
  updatedAt,
  onSaved,
}: TitleToolbarProps) => {
  const {
    title: titleInput,
    description: descriptionInput,
    setTitle,
    setDescription,
    errors,
  } = useSaveMeta({
    sketchId,
    initial: { title, description },
    onSaved,
  });

  return (
    <div
      className={cn(
        floatingToolbarClassName,
        "absolute top-4 left-1/2 z-10 flex w-md max-w-[80%] -translate-x-1/2 flex-col gap-1 px-4 py-3",
      )}
    >
      <input
        type="text"
        aria-label="タイトル"
        aria-invalid={errors.title !== undefined}
        value={titleInput}
        onChange={(e) => setTitle(e.target.value)}
        className={cn(fieldClassName, "truncate text-xl font-semibold")}
      />
      {errors.title && (
        <p role="alert" className="text-sm text-destructive">
          {errors.title}
        </p>
      )}
      <textarea
        aria-label="説明"
        aria-invalid={errors.description !== undefined}
        placeholder="説明を入力"
        rows={1}
        value={descriptionInput}
        onChange={(e) => setDescription(e.target.value)}
        className={cn(
          fieldClassName,
          "max-h-32 resize-none text-muted-foreground field-sizing-content",
        )}
      />
      {errors.description && (
        <p role="alert" className="text-sm text-destructive">
          {errors.description}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {width} × {height}
      </p>
      <LocalTime updatedAt={updatedAt} />
    </div>
  );
};

export { TitleToolbar };
