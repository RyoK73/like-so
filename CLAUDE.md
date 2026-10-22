# draw-for-llm

A tool for quickly sketching application UI mockups and sharing them with LLMs and other people.

## Documentation index

All documents are managed as pairs of Japanese (`*.ja.md`) and English (`*.en.md`) files.
Only the README is different: the English one is `README.md` and the Japanese one is `README.ja.md`.
`DESIGN.md` at the repository root is also an exception: it is written in Japanese only, and there is no English version.
When you implement UI, read `DESIGN.md` and follow its colors, typography, spacing, and components.

| Category     | Path                                     | Contents                                                    |
| ------------ | ---------------------------------------- | ----------------------------------------------------------- |
| README       | `README.md` / `README.ja.md`             | For users. Purpose, differences from other tools, use cases |
| Design       | `DESIGN.md`                              | UI design: colors, typography, spacing, components          |
| Setup        | `docs/setup/prerequisites.*.md`          | Required tools, installing dependencies                     |
|              | `docs/setup/environment.*.md`            | List and purpose of environment variables                   |
|              | `docs/setup/database.*.md`               | Local DB, migrations, type generation                       |
|              | `docs/setup/development.*.md`            | Dev server, scripts, tests                                  |
| Architecture | `docs/architecture/overview.*.md`        | Tech stack, directory structure, drawing                    |
|              | `docs/architecture/routing.*.md`         | Routes, sketch list page                                    |
|              | `docs/architecture/auth.*.md`            | Authentication, anonymous sign-in, auth state               |
|              | `docs/architecture/database.*.md`        | Tables, RLS, privileges, triggers                           |
|              | `docs/architecture/save.*.md`            | Flow of saving a sketch                                     |
|              | `docs/architecture/navigation-menu.*.md` | Navigation menu, visibility by auth state, tooltip          |
| Rules        | `docs/rules/directory-structure.*.md`    | Directory structure (Vertical Codebase)                     |
|              | `docs/rules/naming.*.md`                 | Naming                                                      |
|              | `docs/rules/typescript.*.md`             | TypeScript                                                  |

## Documentation update rules

When you change code, update the corresponding documents in the same PR.

| Change                                                     | Documents to update                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `package.json` scripts, required tools                     | `docs/setup/prerequisites`, `docs/setup/development`, `docs/setup/database` |
| Adding, changing, or removing environment variables        | `docs/setup/environment`                                                    |
| `supabase/migrations/`, `supabase/seed.sql`                | `docs/architecture/database`, and `docs/setup/database` if necessary        |
| Authentication (`src/supabase/auth/`, `src/proxy.ts`)      | `docs/architecture/auth`                                                    |
| Saving sketches (`src/sketch-detail/save/`, `sketch-crud`) | `docs/architecture/save`                                                    |
| Routes, sketch list (`src/app/`, `src/sketch-list/`)       | `docs/architecture/routing`, and `docs/architecture/overview` if necessary  |
| Directory structure, tech stack                            | `docs/architecture/overview`                                                |
| Coding rules                                               | `docs/rules/`                                                               |

- Always update both the Japanese and English versions in the same PR. Keep the heading structure aligned.
- When you add, remove, or rename a document, also update the index in this file and the links in the README.
- Do not write feature ideas or improvements in the documents. Manage them as GitHub Issues.
- Keep the README for users only. Write developer details in `docs/` and link to them from the README.
- Do not describe unimplemented features as if they were implemented. Check the code and configuration, and write only facts.
- In Japanese documents, start a new line after each full stop (`。`).

## Development

- Use pnpm as the only package manager. Do not create `package-lock.json`.
- See `docs/setup/` for details.
