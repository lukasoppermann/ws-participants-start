# AI-Ready Design System — workshop repo

This is the fixture repository for the "AI-Ready Design System" workshop.
It's a small, hand-built design token system (not a production library) used
to practice working with an AI agent on design-system tasks: extending
tokens, validating contrast, and enforcing token usage with lint.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run build   # generates dist/tokens/{light,dark}.css from tokens/*.json
npm test        # builds tokens, then runs the full test suite
```

## Token format

Tokens are written in the [W3C Design Tokens (DTCG) format](https://www.designtokens.org/tr/2025.10/).
A node with a `$value` is a token; anything else is a group. Color values
are structured (`colorSpace`, `components`, and a `hex` fallback), and
aliases use `{group.path}` curly-brace references. The spec has no built-in
light/dark concept, so semantic tokens live in one file per theme.

## What's in here

```
tokens/
  primitives.json           # raw color scale (grays, blue, green, yellow, red), DTCG color tokens
  semantic/
    light.json               # semantic tokens for the light theme, aliasing primitives
    dark.json                # semantic tokens for the dark theme, aliasing primitives
  contrast-pairings.json    # which fg/bg token pairs must pass contrast, and at what ratio
scripts/
  build-tokens.mjs          # resolves the DTCG token tree into CSS custom properties
  contrast.mjs              # generic WCAG contrast checker (works on any hex colors / token pairs)
  reset-checkpoint.sh       # resets the working tree to a named workshop checkpoint (see below)
tests/                      # contrast, lint, and MCP-adapter tests (vitest)
examples/account-settings/  # a small example page built from existing tokens
lint/                       # stylelint config + fixtures proving raw colors fail, tokens pass
mcp/                        # deterministic token functions + a minimal local MCP adapter
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run build` | Regenerate `dist/tokens/*.css` from the token source |
| `npm test` | Build, then run all tests (contrast, lint, MCP) |
| `npm run lint` | Run stylelint against the example CSS |
| `npm run validate` | Build + test + lint in one go |
| `npm run reset -- <checkpoint>` | Hard-reset the working tree to a workshop checkpoint |

## Workshop checkpoints

The repo history is tagged at each stage of the workshop so you can jump to
(or recover) any point without redoing earlier exercises:

- `checkpoint-00-start` — primitives + a limited set of existing semantic tokens. No focus tokens, no message tokens.
- `checkpoint-01-focus-tokens` — semantic focus tokens added.
- `checkpoint-02-message-tokens` — semantic success/attention/danger message tokens added.
- `checkpoint-03-account-example` — account-settings example using those tokens.
- `checkpoint-04-lint` — raw-color lint enforcement added.
- `checkpoint-05-mcp` — deterministic MCP token functions + adapter added.

To reset to any of these (this **discards uncommitted local changes**):

```bash
npm run reset -- 01-focus-tokens
```

If you get stuck mid-exercise, resetting to the checkpoint before it is the
fastest way back to a known-good state.

See `FACILITATOR.md` for exercise prompts, expected results, and setup notes
if you're running the workshop rather than attending it.
