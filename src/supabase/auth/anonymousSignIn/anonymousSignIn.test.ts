import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const helper = supabaseTestHelper();

// Launch the supabase DB before running this tests.
// Running this test repeatedly in a short time may fail because of the per-IP rate limit of anonymous sign-ins.
// The limit is `[auth.rate_limit] anonymous_users` in `supabase/config.toml` (currently 30 per hour).
// So call `signInAnonymously` only once per test.
let createdUserId: string | undefined;

afterEach(async () => {
  if (!createdUserId) return;

  const deleteResult = await helper.deleteTestUser(createdUserId);
  if (!deleteResult.ok) console.log(deleteResult.error);

  createdUserId = undefined;
});

describe("anonymous sign-in", () => {
  test("An anonymous user can sign in and a session is issued", async () => {
    const client = helper.createAnonClient();

    const { data, error } = await client.auth.signInAnonymously();
    // Keep the id before the assertions, so that the user is deleted even if an assertion fails.
    createdUserId = data.user?.id;

    expect(error).toBeNull();
    expect(data.user?.is_anonymous).toBe(true);
    expect(data.session?.access_token).toBeTruthy();
  });
});
