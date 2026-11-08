import { redirect } from "next/navigation";
import { startNewSketch } from "@/new-sketch/start-new-sketch";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { signInAnonymously } from "@/supabase/auth/signIn";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/supabase/utils/anonActionClient", () => ({
  createSupabaseAnonActionClient: vi.fn(),
}));
vi.mock("@/supabase/auth/getAuthState", () => ({ getAuthState: vi.fn() }));
vi.mock("@/supabase/auth/signIn", () => ({ signInAnonymously: vi.fn() }));
vi.mock("@/supabase/sketch-crud/handleDb", () => ({ upsertSketch: vi.fn() }));

const clientStub = {} as Awaited<
  ReturnType<typeof createSupabaseAnonActionClient>
>;

describe("startNewSketch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseAnonActionClient).mockResolvedValue(clientStub);
    vi.mocked(signInAnonymously).mockResolvedValue({
      ok: true,
      value: undefined,
    });
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: true,
      value: { id: "new-id" } as never,
    });
  });

  test("should sign in anonymously before creating when signed out", async () => {
    vi.mocked(getAuthState).mockResolvedValue("signedOut");

    await startNewSketch(null);

    expect(signInAnonymously).toHaveBeenCalledWith(clientStub);
    expect(upsertSketch).toHaveBeenCalledTimes(1);
  });

  test.each(["guest", "registered"] as const)(
    "should not sign in when the state is %s",
    async (state) => {
      vi.mocked(getAuthState).mockResolvedValue(state);

      await startNewSketch(null);

      expect(signInAnonymously).not.toHaveBeenCalled();
      expect(upsertSketch).toHaveBeenCalledTimes(1);
    },
  );

  test("should create a sketch without id and redirect to it", async () => {
    vi.mocked(getAuthState).mockResolvedValue("guest");

    await startNewSketch(null);

    expect(upsertSketch).toHaveBeenCalledWith(
      clientStub,
      expect.not.objectContaining({ id: expect.anything() }),
    );
    expect(redirect).toHaveBeenCalledWith("/sketches/new-id");
  });

  test("should return an error and not create when signing in fails", async () => {
    vi.mocked(getAuthState).mockResolvedValue("signedOut");
    vi.mocked(signInAnonymously).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    const state = await startNewSketch(null);

    expect(state).toEqual({ error: expect.any(String) });
    expect(upsertSketch).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  test("should return an error and not redirect when creating fails", async () => {
    vi.mocked(getAuthState).mockResolvedValue("guest");
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    const state = await startNewSketch(null);

    expect(state).toEqual({ error: expect.any(String) });
    expect(redirect).not.toHaveBeenCalled();
  });
});
