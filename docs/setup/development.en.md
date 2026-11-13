# Development

## Start the dev server

```bash
pnpm dev
```

- It runs `src/dev-scripts/open-localhost.ts`.
- The script starts `next dev`, and opens `http://localhost:3000` in the browser once the server prints "Ready".
- The script exits when the dev server exits.

## Scripts

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `pnpm build`       | Builds the app with `next build`                                |
| `pnpm start`       | Starts the built app                                            |
| `pnpm lint`        | Runs ESLint                                                     |
| `pnpm check`       | Runs ESLint and `tsc --noEmit`                                  |
| `pnpm test`        | Runs vitest in watch mode (excludes `*.remote.test.ts`)         |
| `pnpm test:here`   | Runs vitest once for the directory you ran the command from     |
| `pnpm test:remote` | Runs only `*.remote.test.ts` against the remote project         |
| `pnpm prtc <path>` | Checks that the path is formatted with Prettier (`prettier -c`) |
| `pnpm prtw <path>` | Formats the path with Prettier and writes it (`prettier -w`)    |

## Tests

- Run `pnpm db:start` first. Many tests connect to the local Supabase.
- `.env.local` is required. See [Environment variables](./environment.en.md).
- `pnpm test:remote` checks the settings of the remote project through the Supabase Management API.
  - It needs `PROJECTID` and `SUPABASE_ACCESS_TOKEN`.
  - Currently it checks that anonymous sign-in is enabled.
- `server-only` is replaced with `src/test/emptyModule.ts` in vitest, because importing it outside Next.js throws an error.

## Coding rules

- [Directory structure](../rules/directory-structure.en.md)
- [Naming](../rules/naming.en.md)
- [TypeScript](../rules/typescript.en.md)
- [UI text notation](../rules/ui-text.en.md)
