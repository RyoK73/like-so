import { updateSketchMeta } from "@/supabase/sketch-crud/updateSketchMeta";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import { insertSketchOrThrow } from "@/supabase/utils/sketchTestUtility";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

// Launch the supabase DB before running this tests.
let firstUser: TestUser;

beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("updateSketchMeta", () => {
  it("should update the title and description, and update updated_at", async () => {
    const sketch = await insertSketchOrThrow(firstUser, {
      title: "old title",
      description: "old description",
    });

    const result = await updateSketchMeta(firstUser.client, sketch.id, {
      title: "new title",
      description: "new description",
    });

    if (!result.ok) {
      throw new Error(result.error.message);
    }
    expect(result.value).toMatchObject({
      id: sketch.id,
      title: "new title",
      description: "new description",
    });
    expect(new Date(result.value.updated_at).getTime()).toBeGreaterThan(
      new Date(sketch.updated_at).getTime(),
    );
  });

  it("should not change canvas_json, width, height and cell_size", async () => {
    const sketch = await insertSketchOrThrow(firstUser, {
      canvas_json: { objects: [{ type: "rect" }] },
      width: 800,
      height: 600,
      cell_size: 32,
    });

    const result = await updateSketchMeta(firstUser.client, sketch.id, {
      title: "new title",
      description: "new description",
    });

    if (!result.ok) {
      throw new Error(result.error.message);
    }
    expect(result.value).toMatchObject({
      canvas_json: sketch.canvas_json,
      width: 800,
      height: 600,
      cell_size: 32,
    });
  });

  it("should return an error when the id does not exist", async () => {
    const result = await updateSketchMeta(
      firstUser.client,
      crypto.randomUUID(),
      { title: "new title", description: "new description" },
    );

    expect(result.ok).toBe(false);
  });

  it("should return an error and not change the row when the sketch belongs to another user (RLS)", async () => {
    const sketch = await insertSketchOrThrow(firstUser, {
      title: "old title",
      description: "old description",
    });
    const secondUser = await userTracker.create();

    const result = await updateSketchMeta(secondUser.client, sketch.id, {
      title: "malicious title",
      description: "malicious description",
    });

    expect(result.ok).toBe(false);
    const { data } = await firstUser.client
      .from("sketches")
      .select("title,description")
      .eq("id", sketch.id)
      .single();
    expect(data).toEqual({
      title: "old title",
      description: "old description",
    });
  });

  it("should return the error of supabase as it is when supabase returns an error", async () => {
    const supabaseError = { message: "supabase error" };
    const fakeClient = {
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: supabaseError }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<DatabaseModified>;

    const result = await updateSketchMeta(fakeClient, "sketch-id", {
      title: "new title",
      description: "new description",
    });

    expect(result).toEqual({ ok: false, error: supabaseError });
  });
});
