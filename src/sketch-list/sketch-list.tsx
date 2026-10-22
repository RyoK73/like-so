import Link from "next/link";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getSketchList } from "@/supabase/sketch-crud/getSketchList";
import { LocalTime } from "@/design-system/local-time";

const SketchList = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const result = await getSketchList(supabaseClient);

  if (!result.ok) {
    return <p role="alert">スケッチ一覧の取得に失敗しました。</p>;
  }

  if (result.value.length === 0) {
    return <p>スケッチがまだありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {result.value.map((sketch) => (
        <li key={sketch.id}>
          <Link
            href={`/sketches/${sketch.id}`}
            className="brush-a rotate-0 flex flex-col gap-1 border bg-background p-4 transition-colors hover:bg-accent"
          >
            <span className="font-semibold">{sketch.title}</span>
            {sketch.description && (
              <span className="text-muted-foreground">
                {sketch.description}
              </span>
            )}
            {sketch.updated_at ? (
              <LocalTime updatedAt={sketch.updated_at} />
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { SketchList };
