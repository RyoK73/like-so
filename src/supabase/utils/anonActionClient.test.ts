import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

describe("createSupabaseAnonActionClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");
    vi.mocked(cookies).mockResolvedValue({
      getAll: vi.fn(),
      set: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should create the client with the anon key and never with the secret key", async () => {
    await createSupabaseAnonActionClient();

    const [url, key] = vi.mocked(createServerClient).mock.calls[0];
    expect(url).toBe("http://localhost:54321");
    expect(key).toBe("test-anon-key");
    expect(
      JSON.stringify(vi.mocked(createServerClient).mock.calls),
    ).not.toContain("test-secret-key");
  });
});
