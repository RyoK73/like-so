import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getSketch } from "@/supabase/sketch-crud/getSketch";
import { SketchEditor } from "@/sketch-detail/sketch-editor";
import { SketchError } from "@/sketch-detail/sketch-error";

const SketchDetail = async ({ id }: { id: string }) => {
  if (!z.uuid().safeParse(id).success) notFound();

  const supabaseClient = await createSupabaseServerClient();
  const result = await getSketch(supabaseClient, id);

  if (!result.ok) {
    return <SketchError message="スケッチの取得に失敗しました。" />;
  }

  const sketch = result.value;
  if (!sketch) notFound();

  return (
    <div className="relative h-dvh overflow-hidden">
      <SketchEditor sketch={sketch} />
    </div>
  );
};

export { SketchDetail };
