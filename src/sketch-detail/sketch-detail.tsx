import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getSketch } from "@/supabase/sketch-crud/getSketch";
import { LocalTime } from "@/design-system/local-time";
import { SketchCanvas } from "@/sketch-detail/sketch-canvas";

const SketchDetail = async ({ id }: { id: string }) => {
  if (!z.uuid().safeParse(id).success) notFound();

  const supabaseClient = await createSupabaseServerClient();
  const result = await getSketch(supabaseClient, id);

  if (!result.ok) {
    return (
      <>
        <p role="alert">スケッチの取得に失敗しました。</p>
        <Link href="/sketches" className="underline">
          スケッチ一覧へ戻る
        </Link>
      </>
    );
  }

  const sketch = result.value;
  if (!sketch) notFound();

  return (
    <div className="flex h-dvh min-w-0 flex-1 flex-col gap-3 overflow-hidden bg-background bg-grid-paper px-6 py-8 [--grid-line:var(--grid-line-faint)]">
      <h1 className="text-xl font-semibold tracking-tight">{sketch.title}</h1>
      {sketch.description && (
        <p className="text-muted-foreground">{sketch.description}</p>
      )}
      <p className="text-sm text-muted-foreground">
        {sketch.width} × {sketch.height}
      </p>
      <LocalTime updatedAt={sketch.updated_at} />
      <SketchCanvas sketch={sketch} />
    </div>
  );
};

export { SketchDetail };
