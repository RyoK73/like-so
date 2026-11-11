import { redirect } from "next/navigation";
import { startNewSketch } from "@/new-sketch/start-new-sketch";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { signInAnonymouslyWithForwardedIp } from "@/supabase/auth/anonymousSignIn/signInAnonymouslyWithForwardedIp";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/supabase/utils/anonActionClient", () => ({
  createSupabaseAnonActionClient: vi.fn(),
}));
vi.mock("@/supabase/auth/getAuthState", () => ({ getAuthState: vi.fn() }));
vi.mock(
  "@/supabase/auth/anonymousSignIn/signInAnonymouslyWithForwardedIp",
  () => ({ signInAnonymouslyWithForwardedIp: vi.fn() }),
);
vi.mock("@/supabase/sketch-crud/handleDb", () => ({ upsertSketch: vi.fn() }));

type AnonActionClient = Awaited<
  ReturnType<typeof createSupabaseAnonActionClient>
>;

// Two distinct stubs, so that the test can tell which client `upsertSketch` received.
const clientBeforeSignIn = { name: "before" } as unknown as AnonActionClient;
const clientAfterSignIn = { name: "after" } as unknown as AnonActionClient;

describe("startNewSketch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseAnonActionClient)
      .mockResolvedValueOnce(clientBeforeSignIn)
      .mockResolvedValueOnce(clientAfterSignIn);
    vi.mocked(signInAnonymouslyWithForwardedIp).mockResolvedValue({
      ok: true,
      value: undefined,
    });
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: true,
      value: { id: "new-id" } as never,
    });
  });

  test("should sign in anonymously and recreate the client before creating when signed out", async () => {
    vi.mocked(getAuthState).mockResolvedValue("signedOut");

    await startNewSketch(null);

    expect(signInAnonymouslyWithForwardedIp).toHaveBeenCalledTimes(1);
    expect(signInAnonymouslyWithForwardedIp).toHaveBeenCalledWith();
    expect(createSupabaseAnonActionClient).toHaveBeenCalledTimes(2);
    expect(upsertSketch).toHaveBeenCalledTimes(1);
    expect(upsertSketch).toHaveBeenCalledWith(
      clientAfterSignIn,
      expect.anything(),
    );
  });

  test.each(["guest", "registered"] as const)(
    "should not sign in anonymously and keep the first client when the state is %s",
    async (state) => {
      vi.mocked(getAuthState).mockResolvedValue(state);

      await startNewSketch(null);

      expect(signInAnonymouslyWithForwardedIp).not.toHaveBeenCalled();
      expect(createSupabaseAnonActionClient).toHaveBeenCalledTimes(1);
      expect(upsertSketch).toHaveBeenCalledTimes(1);
      expect(upsertSketch).toHaveBeenCalledWith(
        clientBeforeSignIn,
        expect.anything(),
      );
    },
  );

  test("should create a sketch without id and redirect to it", async () => {
    vi.mocked(getAuthState).mockResolvedValue("guest");

    await startNewSketch(null);

    expect(upsertSketch).toHaveBeenCalledWith(
      clientBeforeSignIn,
      expect.not.objectContaining({ id: expect.anything() }),
    );
    expect(redirect).toHaveBeenCalledWith("/sketches/new-id");
  });

  test("should return an error and not create when signing in fails", async () => {
    vi.mocked(getAuthState).mockResolvedValue("signedOut");
    vi.mocked(signInAnonymouslyWithForwardedIp).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    const state = await startNewSketch(null);

    expect(state).toEqual({ error: expect.any(String) });
    expect(upsertSketch).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  test("should return the limit message and not redirect when the sketch limit is reached", async () => {
    vi.mocked(getAuthState).mockResolvedValue("guest");
    vi.mocked(upsertSketch).mockResolvedValue({
      ok: false,
      error: Object.assign(new Error("sketch count limit reached"), {
        code: "SK001",
      }),
    });

    const state = await startNewSketch(null);

    expect(state).toEqual({ error: "スケッチの作成上限に達しました" });
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
