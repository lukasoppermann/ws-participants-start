import { describe, it, expect } from 'vitest';
import path from 'node:path';
import stylelint from 'stylelint';

// This demonstrates the token-usage lint rule (see .stylelintrc.json):
// raw color literals must fail, and CSS custom properties (tokens) must
// pass. Note what this rule does NOT do: it can't tell whether a var()
// reference is an approved token or whether it's used in the right
// semantic role — it only enforces that no raw color literal was written.
const rootDir = path.resolve(import.meta.dirname, '..');
const configFile = path.join(rootDir, '.stylelintrc.json');

describe('token-usage lint rule', () => {
  it('fails a stylesheet that uses raw hex/rgb/named color values', async () => {
    const result = await stylelint.lint({
      files: path.join(rootDir, 'lint/fixtures/raw-color-violation.css'),
      configFile,
    });
    expect(result.errored).toBe(true);
    const warnings = result.results[0].warnings;
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('passes a stylesheet that only uses CSS custom property tokens', async () => {
    const result = await stylelint.lint({
      files: path.join(rootDir, 'lint/fixtures/tokens-only.css'),
      configFile,
    });
    expect(result.errored).toBe(false);
  });

  it('passes the real account-settings product CSS', async () => {
    const result = await stylelint.lint({
      files: path.join(rootDir, 'examples/account-settings/styles.css'),
      configFile,
    });
    expect(result.errored).toBe(false);
  });
});
