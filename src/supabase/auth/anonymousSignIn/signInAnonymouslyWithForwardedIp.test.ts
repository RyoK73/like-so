import { createServerClient } from "@supabase/ssr";
import { headers, cookies } from "next/headers";
import { signInAnonymouslyWithForwardedIp } from "@/supabase/auth/anonymousSignIn/signInAnonymouslyWithForwardedIp";

vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

const SECRET_KEY = "test-secret-key";
const ANON_KEY = "test-anon-key";

const signInAnonymouslyMock = vi.fn();
const cookieStoreMock = { getAll: vi.fn(), set: vi.fn() };

const setRequestHeaders = (init: Record<string, string>) => {
  vi.mocked(headers).mockResolvedValue(new Headers(init) as never);
};

// Returns the options (third argument) that the sign-in client was created with.
const getClientOptions = () => {
  const options = vi.mocked(createServerClient).mock.calls[0][2];
  return options as {
    cookies: {
      getAll: () => unknown;
      setAll: (
        cookiesToSet: { name: string; value: string; options: object }[],
      ) => void;
    };
    global?: { headers?: Record<string, string> };
  };
};

describe("signInAnonymouslyWithForwardedIp", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ANON_KEY);
    vi.stubEnv("SUPABASE_SECRET_KEY", SECRET_KEY);
    vi.stubEnv("NODE_ENV", "test");
    vi.mocked(cookies).mockResolvedValue(cookieStoreMock as never);
    signInAnonymouslyMock.mockResolvedValue({ error: null });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { signInAnonymously: signInAnonymouslyMock },
    } as ReturnType<typeof createServerClient>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should put the first IP of x-forwarded-for on the sb-forwarded-for header", async () => {
    setRequestHeaders({ "x-forwarded-for": "203.0.113.1, 198.51.100.2" });

    await signInAnonymouslyWithForwardedIp();

    expect(getClientOptions().global?.headers).toEqual({
      "sb-forwarded-for": "203.0.113.1",
    });
  });

  test.each([
    ["has no x-forwarded-for", {}],
    ["has only spaces in x-forwarded-for", { "x-forwarded-for": "   " }],
  ])(
    "should sign in without the sb-forwarded-for header when the request %s outside production",
    async (_name, requestHeaders) => {
      setRequestHeaders(requestHeaders);

      const result = await signInAnonymouslyWithForwardedIp();

      expect(result).toEqual({ ok: true, value: undefined });
      expect(signInAnonymouslyMock).toHaveBeenCalledTimes(1);
      expect(getClientOptions().global?.headers ?? {}).not.toHaveProperty(
        "sb-forwarded-for",
      );
    },
  );

  test.each([
    ["has no x-forwarded-for", {}],
    ["has only spaces in x-forwarded-for", { "x-forwarded-for": "   " }],
  ])(
    "should return an error and not sign in when the request %s in production",
    async (_name, requestHeaders) => {
      vi.stubEnv("NODE_ENV", "production");
      setRequestHeaders(requestHeaders);

      const result = await signInAnonymouslyWithForwardedIp();

      expect(result).toEqual({ ok: false, error: expect.any(Error) });
      expect(signInAnonymouslyMock).not.toHaveBeenCalled();
    },
  );

  test("should create the client with the secret key, not the anon key, with x-forwarded-for", async () => {
    setRequestHeaders({ "x-forwarded-for": "203.0.113.1" });

    await signInAnonymouslyWithForwardedIp();

    const [url, key] = vi.mocked(createServerClient).mock.calls[0];
    expect(url).toBe("http://localhost:54321");
    expect(key).toBe(SECRET_KEY);
    expect(key).not.toBe(ANON_KEY);
  });

  test("should return ok when signing in succeeds", async () => {
    setRequestHeaders({ "x-forwarded-for": "203.0.113.1" });

    const result = await signInAnonymouslyWithForwardedIp();

    expect(result).toEqual({ ok: true, value: undefined });
  });

  test("should return the error when Supabase returns an error", async () => {
    setRequestHeaders({ "x-forwarded-for": "203.0.113.1" });
    const supabaseError = new Error("rate limit");
    signInAnonymouslyMock.mockResolvedValue({ error: supabaseError });

    const result = await signInAnonymouslyWithForwardedIp();

    expect(result).toEqual({ ok: false, error: supabaseError });
  });
});
