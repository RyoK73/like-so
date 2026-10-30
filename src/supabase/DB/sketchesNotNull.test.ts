import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import {
  insertSketch,
  insertSketchOrThrow,
  SketchPayload,
} from "@/supabase/utils/sketchTestUtility";

const NOT_NULL_VIOLATION = "23502";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

let user: TestUser;

// The generated types do not accept `null` for NOT NULL columns, so the tests pass it on purpose through a cast.
const withNull = (column: "created_at" | "updated_at" | "description") =>
  ({ [column]: null }) as unknown as SketchPayload;

// Launch the Supabase DB before running these tests.
beforeEach(async () => {
  userTracker.reset();
  user = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("sketches NOT NULL columns", () => {
  describe("insert", () => {
    test("should fill created_at and updated_at and set description to '' when they are omitted", async () => {
      const sketch = await insertSketchOrThrow(user);

      expect(sketch.created_at).not.toBeNull();
      expect(sketch.updated_at).not.toBeNull();
      expect(sketch.description).toBe("");
    });

    test("should keep the given description", async () => {
      const sketch = await insertSketchOrThrow(user, { description: "memo" });

      expect(sketch.description).toBe("memo");
    });

    test("should keep an empty description", async () => {
      const sketch = await insertSketchOrThrow(user, { description: "" });

      expect(sketch.description).toBe("");
    });

    test.each(["created_at", "updated_at", "description"] as const)(
      "should return an error when %s is null",
      async (column) => {
        const { error } = await insertSketch(user, withNull(column));

        expect(error?.code).toBe(NOT_NULL_VIOLATION);
      },
    );
  });

  describe("update", () => {
    // "updated_at" is overwritten by the trigger so these tests don't include it.
    test.each(["created_at", "description"] as const)(
      "should return an error and keep the value when %s is set to null",
      async (column) => {
        const sketch = await insertSketchOrThrow(user);

        const { error } = await user.client
          .from("sketches")
          .update(withNull(column))
          .eq("id", sketch.id);

        const { data: after } = await user.client
          .from("sketches")
          .select("created_at,description")
          .eq("id", sketch.id)
          .single();

        expect(error?.code).toBe(NOT_NULL_VIOLATION);
        expect(after?.[column]).toBe(sketch[column]);
      },
    );
  });
});
