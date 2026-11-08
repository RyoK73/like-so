# Environment variables

## Where to put them

- Create `.env.local` in the repository root.
- Copy `.env.example` as a starting point.
- `.env*` files are ignored by git, except `.env.example`.
- `src/setupTests.ts` loads `.env.local` for every test run, so the file is required even to run `pnpm test`.

## Variables

| Variable                        | Used by                                  | Purpose                                      |
| ------------------------------- | ---------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | App (browser and server)                 | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App (browser and server)                 | Supabase anon key                            |
| `SUPABASE_SECRET_KEY`           | App (server only)                        | Supabase secret key (for anonymous sign-in)  |
| `SUPABASE_LOCAL_URL`            | Tests against the local DB               | API URL of the local Supabase                |
| `SUPABASE_LOCAL_ANON_KEY`       | Tests against the local DB               | anon key of the local Supabase               |
| `SUPABASE_LOCAL_ADMIN_KEY`      | Tests against the local DB               | Admin key of the local Supabase              |
| `SUPABASE_LOCAL_DB_URL`         | Tests that connect to Postgres with `pg` | Connection string of the local DB            |
| `PROJECTID`                     | `pnpm type:gen`, `pnpm test:remote`      | Project ID of the remote Supabase            |
| `SUPABASE_ACCESS_TOKEN`         | `pnpm test:remote`                       | Access token for the Supabase Management API |

- The app validates `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SECRET_KEY` with zod (`src/supabase/utils/env.ts`).
- `SUPABASE_SECRET_KEY` bypasses RLS.
  Do not add `NEXT_PUBLIC_`, and do not expose it to the browser.
  Only the client for anonymous sign-in uses it. See [Authentication](../architecture/auth.en.md).
- In production, register `SUPABASE_SECRET_KEY` in the Environment Variables of Vercel.
  Also enable IP address forwarding in Authentication > Rate Limits of the Supabase dashboard.
- The local values are printed by `pnpm db:status` after `pnpm db:start`.
  The local value of `SUPABASE_SECRET_KEY` is the key that starts with `sb_secret_`.
  It is also required by the tests that sign in anonymously against the real local Supabase.
- Never commit real values.

## Next

- [Database](./database.en.md)
