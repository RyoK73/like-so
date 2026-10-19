English | [日本語](./README.ja.md)

# Like-so - Sketch what words can't say.

A canvas for sketching an idea the moment it strikes and handing it straight to an LLM.

## Why I built this

Natural language is an excellent common language between humans and LLMs.
Still, when we put subjective things like inspiration and imagery into words, the parts that resist verbalization tend to fall away.

For example, instead of explaining in text, "there's a sidebar on the left,
and cards are lined up to its right...", sketching it in three seconds
can be faster and more accurate.

This project aims to cut that lag down to the minimum.

_Like-so_ is a tool for bringing pre-verbal ideas directly into a conversation with an LLM.

## What I value: simplicity and speed

Figma, Canva, and Excalidraw are all excellent tools.
_Like-so_ doesn't compete with them on feature count. Instead, it focuses on the simplicity and speed that tend to fade as tools grow more feature-rich.

## Intended use cases

- Draw a quick sketch of an app screen and pass it to an LLM as instructions.
- Put a mockup image into a document or presentation.
- Share the image of your idea with other people.

## Philosophy

This philosophy comes from my own experience with editors.
After moving from a feature-heavy editor to Vim, I felt what the tagline promises: _editing at the speed of thought_.
Since then, I have added only the features I need, one at a time, keeping Vim simple while making it more comfortable to use.

## Design principles

- Simplicity matters in the design as much as in the features.
- Database permissions and roles follow the principle of least privilege.
  - The smaller the scope of each permission, the less room there is
    for vulnerabilities and design mistakes.

## For developers

Setup, architecture and coding rules are in [`docs/`](./docs).

- Setup
  - [Prerequisites](./docs/setup/prerequisites.en.md)
  - [Environment variables](./docs/setup/environment.en.md)
  - [Database](./docs/setup/database.en.md)
  - [Development](./docs/setup/development.en.md)
- Architecture
  - [Overview](./docs/architecture/overview.en.md)
  - [Routing](./docs/architecture/routing.en.md)
  - [Authentication](./docs/architecture/auth.en.md)
  - [Database](./docs/architecture/database.en.md)
  - [Saving sketches](./docs/architecture/save.en.md)
  - [Navigation menu](./docs/architecture/navigation-menu.en.md)
- Rules
  - [Directory structure](./docs/rules/directory-structure.en.md)
  - [Naming](./docs/rules/naming.en.md)
  - [TypeScript](./docs/rules/typescript.en.md)
