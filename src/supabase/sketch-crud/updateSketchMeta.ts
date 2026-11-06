import { SupabaseClient } from "@supabase/supabase-js";
import { ReturnSketch } from "@/supabase/sketch-crud/handleDb.types";
import { SketchMeta } from "@/supabase/sketch-crud/updateSketchMeta.types";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";
import { Result } from "@/utils/utility.types";

// Update only the title and the description. It does not touch canvas_json.
const updateSketchMeta = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  id: string,
  meta: SketchMeta,
): Promise<Result<ReturnSketch>> => {
  const { data, error } = await supabaseClient
    .from("sketches")
    .update({ title: meta.title, description: meta.description })
    .eq("id", id)
    .select();

  if (error) {
    return { ok: false, error: error };
  }
  if (data.length !== 1) {
    return {
      ok: false,
      error: new Error(
        `data array does not have exactly one element. data array has ${data.length} elements`,
      ),
    };
  }
  return { ok: true, value: data[0] };
};

export { updateSketchMeta };
