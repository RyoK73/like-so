# Authentication

Authentication uses Supabase Auth.
Anonymous sign-in is enabled (`enable_anonymous_sign_ins = true` in `supabase/config.toml`).

## Session refresh

- `src/proxy.ts` runs `updateSession` (`src/supabase/auth/proxy.ts`) on each request.
  - Static files and images are excluded by the `matcher`.
- `updateSession` creates a Supabase server client and syncs the cookies.
  Then it passes the same client to `getAuthState` to determine the auth state.
- It redirects according to the auth state and the path as follows.
  Paths are matched by prefix.
  The redirect also carries over the refreshed cookies.

| Auth state   | Path                    | Behavior                 |
| ------------ | ----------------------- | ------------------------ |
| `signedOut`  | Starts with `/sketches` | Redirects to `/`         |
| `registered` | Starts with `/signin`   | Redirects to `/sketches` |
| `registered` | Starts with `/signup`   | Redirects to `/sketches` |
| `guest`      | Any                     | Does not redirect        |

- Any other combination is not redirected.

## Auth state

`getAuthState` (`src/supabase/auth/getAuthState.ts`) returns one of three states.

| State        | Condition                         |
| ------------ | --------------------------------- |
| `signedOut`  | There are no claims               |
| `guest`      | The `is_anonymous` claim is true  |
| `registered` | A non-anonymous user is signed in |

- It receives a Supabase client as an argument.
  This is to use the client with cookie syncing that `updateSession` creates, as it is.
- It throws when `getClaims` returns an error, and leaves the handling to Next.js.
- It imports `server-only`, so it can only be used on the server.

## Sign-in functions

Defined in `src/supabase/auth/`.
Each returns `Result<void>`.
Each takes a Supabase client as the first argument.
The caller creates and passes the client.
The `/signin` and `/signup` form passes the browser client (`createSupabaseBrowserClient`).

| Function                              | What it does                                            |
| ------------------------------------- | ------------------------------------------------------- |
| `signInWithOTP`                       | Sends a one-time password to the email address          |
| `verifyOTP`                           | Verifies the one-time password. Takes a `type`          |
| `convertAnonymousUserToPermanentUser` | Adds an email to an anonymous user to make it permanent |
| `signOut`                             | Signs out. Called from `signOutAction` (Server Action)  |

- The `type` of `verifyOTP` defaults to `email`.
  Verify a code sent by `convertAnonymousUserToPermanentUser` with `email_change`.
- `signInWithOTP` uses `shouldCreateUser: true`.
  It creates an account if there is none.

## Sign-in and guest registration

`/signin` and `/signup` render `AuthPage` from `src/auth-form/`.
`AuthPage` is a Server Component.
It gets the auth state with `getAuthState` and passes whether it is a `guest` to `AuthForm`.
`AuthForm` is a Client Component.

- The form switches between entering the email and entering the code on the same page.
  After sending the code, it keeps the email read-only and shows the code field.
  "Change the email address" goes back to the input.
- When signed out, both `/signin` and `/signup` send the code with `signInWithOTP`.
  Only the wording differs.
  The code is verified with `verifyOTP` (`type: "email"`).
- When a guest opens `/signup`, the code is sent with `convertAnonymousUserToPermanentUser`.
  The email is attached with the same `user.id`.
  The code is verified with `verifyOTP` (`type: "email_change"`).
- When a guest opens `/signin`, it is a normal sign-in.
  Signing in with another account switches the `user.id`.
  The guest's sketches stay in the DB but are no longer shown.
  So the form shows a notice.
- Resending calls the same function as sending the code again.
  On success it shows a toast.
  There is no cooldown for resending.
  The buttons are disabled while sending.
- On successful verification, it goes to `/sketches` (`router.push` and then `router.refresh`).
- Errors are shown inside the form with `role="alert"` (`src/auth-form/auth-error.ts`).

| Error code                   | Meaning                                            | Shown                                          |
| ---------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `email_exists`               | A guest registers with an already registered email | That it is registered, and a link to `/signin` |
| `over_email_send_rate_limit` | The code was sent too often in a short time        | Asks to wait for a while                       |
| `otp_expired`                | The code is wrong or expired                       | That the code is wrong or expired              |
| `validation_failed`, etc.    | The email format is invalid                        | Asks to check the format                       |
| Others                       | Such as a network failure                          | Asks to try again later                        |

- `email_exists` reveals whether an email is registered.
  Only the guest registration path can tell whether an email is registered.
  This is accepted.
- There is no feature to merge a guest with an existing account.

### Email settings

The app authenticates with an OTP (a 6-digit code), so the emails contain the code.

- `supabase/templates/` has the templates that show the code.
  `[auth.email.template.*]` in `supabase/config.toml` refers to them.

| Template       | When it is sent                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `magic_link`   | `signInWithOTP` for an existing account (sign-in,sign-up),sign-in for a guest user ( sign-in for another account) |
| `email_change` | `convertAnonymousUserToPermanentUser` of a guest                                                                  |

- `[auth.email]` in `supabase/config.toml` has `enable_confirmations = false` and `double_confirm_changes = true`.
- Only `magic_link` and `email_change` are defined as templates in `config.toml`.
- This setting applies to the local Supabase.
  And it is applied by `pnpm exec supabase config push`.

## Anonymous sign-in in a Server Action

`startNewSketch` for creating a sketch signs in anonymously inside a Server Action when the state is `signedOut`.
See [Routing](./routing.en.md).

- Anonymous sign-in is done only by `signInAnonymouslyWithForwardedIp` (`src/supabase/auth/anonymousSignIn/`).
  It is server only and returns `Result<void>`.
- If a Server Action signs in as is, the rate limit of anonymous sign-ins in Supabase Auth is counted by the IP of the server, not of the user.
  To prevent this, it passes the IP of the user with the [IP address forwarding](https://supabase.com/docs/guides/auth/rate-limits#ip-address-forwarding) of Supabase.
  1. It reads `x-forwarded-for` from `headers()`.
     On Vercel, this value is always overwritten with the single IP of the client.
     This was checked by sending 25 patterns of the header (multiple IPs, an empty string, a string that is not an IP and so on) to a deployed Vercel project (Hobby plan, Node.js runtime).
  2. It uses the value only when it is a single valid IP (IPv4 or IPv6), ignoring surrounding spaces (`parseForwardedIp`, `forwardedIpSchema`).
     Multiple IPs (`a, b`), an IP with a port, and a string that is not an IP are treated the same as a missing header.
  3. It creates the client only for sign-in (`createSupabaseSecretActionClient`, `secretActionClient.ts`).
     This client uses the secret key (`SUPABASE_SECRET_KEY`) and puts the IP on the `sb-forwarded-for` header.
     Without the secret key, Supabase does not accept this header.
  4. It calls `signInAnonymously` with that client.
- When `x-forwarded-for` is missing or is not a single valid IP, the behavior depends on the environment.
  - Production (`NODE_ENV` is `production`): On Vercel the header is always a single valid IP, so anything else is abnormal.
    To not silently go back to counting by the IP of the server, it returns `ok: false` and does not sign in.
  - Outside production (local development and tests): It signs in without `sb-forwarded-for`.
- When `SUPABASE_SECRET_KEY` is not set, the zod validation throws.
- Only this sign-in client uses the secret key.
  The secret key bypasses RLS, so it is not used for DB operations after signing in.
- For DB operations after signing in, it uses `createSupabaseAnonActionClient` (`src/supabase/utils/anonActionClient.ts`).
  It uses the anon key, so RLS is enabled.
  This client can read and write cookies.
  The sign-in is done by another client, so a client created before signing in does not know the new session.
  So when it signs in, it creates `createSupabaseAnonActionClient` again after signing in.
- `createSupabaseServerClient` (`src/supabase/utils/serverClient.ts`) only reads cookies.
  Use it in Server Components.
  `proxy.ts` refreshes the tokens.

## Test setup

- `server-only` throws an error when imported outside Next.js.
- `vitest.config.mts` replaces it with `src/test/emptyModule.ts`, an empty module.

## Authorization

- Anonymous users also use the `authenticated` role in the DB.
- Access to data is limited by RLS. See [Database](./database.en.md).
