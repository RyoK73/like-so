import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import {
  FABRIC_VERSION,
  insertSketch,
  insertSketchOrThrow,
} from "@/supabase/utils/sketchTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

// The SQLSTATE raised by the trigger. It is written literally on purpose, so that the test checks the DB side independently of the TypeScript constant.
const SKETCH_LIMIT_SQLSTATE = "SK001";
const SKETCH_LIMIT = 20;

// Launch the supabase DB (with the migrations applied) before running this tests.
let firstUser: TestUser;
let secondUser: TestUser;

// Insert sequentially, so that every INSERT sees the rows inserted before it.
const fillSketches = async (user: TestUser, count: number) => {
  for (let i = 0; i < count; i++) {
    await insertSketchOrThrow(user);
  }
};

const countSketches = async (user: TestUser) => {
  const { count, error } = await user.client
    .from("sketches")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count;
};

// Every column is optional because the width and height are filled in by the trigger.
const upsertSketch = (user: TestUser, payload: Partial<InsertSketch>) =>
  user.client
    .from("sketches")
    .upsert({ fabric_version: FABRIC_VERSION, ...payload } as InsertSketch)
    .select()
    .single();

beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
  secondUser = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("The sketch count limit trigger", () => {
  it("should allow the 20th insert (boundary)", async () => {
    await fillSketches(firstUser, SKETCH_LIMIT - 1);

    const { error } = await insertSketch(firstUser);

    expect(error).toBeNull();
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should reject the 21st insert with SK001 (boundary)", async () => {
    await fillSketches(firstUser, SKETCH_LIMIT);

    const { error } = await insertSketch(firstUser);

    expect(error?.code).toBe(SKETCH_LIMIT_SQLSTATE);
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should allow upserting an existing id when the user has 20 sketches", async () => {
    const existing = await insertSketchOrThrow(firstUser, {
      title: "before",
    });
    await fillSketches(firstUser, SKETCH_LIMIT - 1);

    const { data, error } = await upsertSketch(firstUser, {
      id: existing.id,
      title: "after",
    });

    expect(error).toBeNull();
    expect(data?.title).toBe("after");
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should allow updating an existing row when the user has 20 sketches", async () => {
    const existing = await insertSketchOrThrow(firstUser, {
      title: "before",
    });
    await fillSketches(firstUser, SKETCH_LIMIT - 1);

    const { error } = await firstUser.client
      .from("sketches")
      .update({ title: "after" })
      .eq("id", existing.id);

    expect(error).toBeNull();
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should reject upserting a new explicit id when the user has 20 sketches", async () => {
    await fillSketches(firstUser, SKETCH_LIMIT);

    const { error } = await upsertSketch(firstUser, {
      id: crypto.randomUUID(),
    });

    expect(error?.code).toBe(SKETCH_LIMIT_SQLSTATE);
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should count per user", async () => {
    await fillSketches(secondUser, SKETCH_LIMIT);

    const { error } = await insertSketch(firstUser);

    expect(error).toBeNull();
    expect(await countSketches(firstUser)).toBe(1);
  });

  it("should allow an insert after deleting one of 20 sketches", async () => {
    const removed = await insertSketchOrThrow(firstUser);
    await fillSketches(firstUser, SKETCH_LIMIT - 1);

    const { error: deleteError } = await firstUser.client
      .from("sketches")
      .delete()
      .eq("id", removed.id);
    const { error } = await insertSketch(firstUser);

    expect(deleteError).toBeNull();
    expect(error).toBeNull();
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should stop at 20 when the same user inserts concurrently", async () => {
    const concurrentCount = 25;

    const results = await Promise.all(
      Array.from({ length: concurrentCount }, () => insertSketch(firstUser)),
    );

    const failed = results.filter(({ error }) => error !== null);

    expect(results.length - failed.length).toBe(SKETCH_LIMIT);
    expect(failed).toHaveLength(concurrentCount - SKETCH_LIMIT);
    for (const { error } of failed) {
      expect(error?.code).toBe(SKETCH_LIMIT_SQLSTATE);
    }
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });

  it("should allow concurrent upserts of an existing id when the user has 20 sketches", async () => {
    const existing = await insertSketchOrThrow(firstUser);
    await fillSketches(firstUser, SKETCH_LIMIT - 1);

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        upsertSketch(firstUser, { id: existing.id, title: `title-${i}` }),
      ),
    );

    for (const { error } of results) {
      expect(error).toBeNull();
    }
    expect(await countSketches(firstUser)).toBe(SKETCH_LIMIT);
  });
});
