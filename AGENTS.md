# AGENTS.md

Repository-specific notes for agents working in this repo. This is a
workshop fixture, not production code — keep changes small and legible.

## Running things

- `npm install` — install dependencies (Node 20+).
- `npm run build` — regenerate `dist/tokens/*.css` and `dist/tokens/resolved.json`
  from the token source in `tokens/`. `dist/` is generated and gitignored;
  always run this after changing anything under `tokens/`.
- `npm test` — runs `npm run build` first, then the full vitest suite.
- `npm run lint` — runs stylelint against `examples/**/*.css` only. Files
  under `lint/fixtures/` are intentionally excluded from this glob; they're
  test fixtures, not product code.
- `npm run validate` — build + test + lint in one command. Use this before
  concluding a task is done.
- When asked to create or make a baseline for an eval, or to run an eval, read
  and follow `evals/<eval-name>/run.md`. The runbook determines whether to
  write `baseline.md` or `results.md`.

## Layout

- `tokens/primitives.json` — raw color values in
  [W3C Design Tokens (DTCG) format](https://www.designtokens.org/tr/2025.10/).
- `tokens/semantic/light.json`, `tokens/semantic/dark.json` — semantic
  tokens (source of truth for the design system), one file per theme. Read
  the existing entries and how they reference primitives before adding new
  ones.
- `tokens/contrast-pairings.json` — data-driven list of foreground/background
  token pairs that must pass contrast, consumed by `scripts/contrast.mjs`
  and tested in `tests/contrast.test.mjs`.
- `mcp/approved-pairings.json` — the semantic (role-level) compatibility
  list used by `mcp/token-functions.mjs`'s `validatePairing`.

## Conventions to preserve

- Token files follow the DTCG spec (a node with a `$value` is a token,
  otherwise it's a group). Inspect the existing files to see how this repo
  uses it before adding tokens — don't invent a different value shape.
- The contrast checker in `scripts/contrast.mjs` is generic — it takes any
  hex colors and any pairing list. Don't hard-code it to specific token
  names.
- Any change to `tokens/**/*.json` should be followed by `npm run build` and
  `npm test` before considering the change complete.
- Don't add new npm dependencies unless a task genuinely requires one; this
  repo is intentionally minimal.

## Working with design tokens

For tasks that add, select, replace, or review semantic design-token usage:

1. Read node_modules/design-tokens/DESIGN_TOKENS.md before choosing a semantic role or token set.
2. Use only source-defined tokens.
3. Run the repository validation command.
4. If no approved tokens fit, stop and report the gap.