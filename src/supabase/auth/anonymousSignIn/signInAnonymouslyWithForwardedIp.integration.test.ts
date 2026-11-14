import { version } from "fabric";
import { signInAnonymouslyWithForwardedIp } from "@/supabase/auth/anonymousSignIn/signInAnonymouslyWithForwardedIp";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { upsertSketch } from "@/supabase/sketch-crud/handleDb";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";
import { createSupabaseAnonActionClient } from "@/supabase/utils/anonActionClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

// An in-memory replacement of the request. The sign-in function and the anon action client created afterwards share it, so the test can check that the session crosses from one to the other through the cookies.
const request = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  headers: new Headers(),
}));

vi.mock("next/headers", () => ({
  headers: async () => request.headers,
  cookies: async () => ({
    getAll: () =>
      [...request.cookies].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      request.cookies.set(name, value);
    },
  }),
}));

// `checkBotId` needs the Vercel runtime, so replace it with a human result.
vi.mock("botid/server", () => ({
  checkBotId: async () => ({ isBot: false }),
}));

const helper = supabaseTestHelper();

// Launch the supabase DB before running this tests.
// Set `SUPABASE_SECRET_KEY` in `.env.local` (the `sb_secret_...` value of `pnpm db:status`).
// Running this test repeatedly in a short time may fail because of the per-IP rate limit of anonymous sign-ins.
// So sign in only once per test.
let createdUserId: string | undefined;

// Signs in once, then keeps the user id before any assertion, so that the user is deleted even if an assertion fails.
const signInAndKeepUserId = async (requestHeaders: Record<string, string>) => {
  request.headers = new Headers(requestHeaders);

  const result = await signInAnonymouslyWithForwardedIp();

  const anonActionClient = await createSupabaseAnonActionClient();
  const { data } = await anonActionClient.auth.getSession();
  createdUserId = data.session?.user.id;

  return { result, anonActionClient };
};

beforeEach(() => {
  request.cookies.clear();
  request.headers = new Headers();
});

afterEach(async () => {
  if (!createdUserId) return;

  const deleteResult = await helper.deleteTestUser(createdUserId);
  if (!deleteResult.ok) console.log(deleteResult.error);

  createdUserId = undefined;
});

// The session is created with the secret key and the sb-forwarded-for header, and handed over to the anon action client through the cookies.
// Without the handover, the anon action client would be signed out and the upsert would be rejected,
// because the anon role has no privilege on the table.
test("should hand over the session to the anon action client created after signing in", async () => {
  const { result, anonActionClient } = await signInAndKeepUserId({
    "x-forwarded-for": "203.0.113.1",
  });

  const authState = await getAuthState(anonActionClient);
  const upsertResult = await upsertSketch(anonActionClient, {
    fabric_version: version,
  } as InsertSketch);

  expect(result).toEqual({ ok: true, value: undefined });
  expect(authState).toBe("guest");
  expect(upsertResult.ok).toBe(true);
});
