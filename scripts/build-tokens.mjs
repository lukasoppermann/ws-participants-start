#!/usr/bin/env node
// Resolves W3C Design Tokens (DTCG, https://www.designtokens.org/tr/2025.10/)
// source files into:
//   - dist/tokens/light.css and dist/tokens/dark.css (CSS custom properties)
//   - dist/tokens/resolved.json ({ light: { "fg.default": "#24292f", ... }, dark: {...} })
//
// Source layout:
//   tokens/primitives.json      - DTCG color tokens, referenced by aliases only
//   tokens/semantic/light.json  - DTCG semantic tokens for the light theme
//   tokens/semantic/dark.json   - DTCG semantic tokens for the dark theme
//
// The DTCG spec has no built-in concept of themes/modes, so each theme is its
// own token tree. Semantic tokens reference primitives with curly-brace
// aliases (e.g. "$value": "{blue.600}"), resolved against a tree merging
// primitives.json with that theme's semantic file (their group names never
// collide). A node is a *token* if it has a "$value" property, otherwise
// it's a *group*; groups and semantic subtrees can nest to any depth.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tokensDir = path.join(rootDir, 'tokens');
const distDir = path.join(rootDir, 'dist', 'tokens');

const THEMES = ['light', 'dark'];
const ALIAS_RE = /^\{([^{}]+)\}$/;

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(tokensDir, relPath), 'utf8'));
}

function isToken(node) {
  return (
    typeof node === 'object' &&
    node !== null &&
    !Array.isArray(node) &&
    Object.prototype.hasOwnProperty.call(node, '$value')
  );
}

function navigatePath(tree, segments) {
  let node = tree;
  for (const segment of segments) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[segment];
  }
  return node;
}

// Resolves a token's raw $value: either a literal value (e.g. a structured
// color object) or a "{group.path}" alias, following alias chains and
// detecting cycles.
function resolveValue(rawValue, mergedTree, chain = []) {
  if (typeof rawValue !== 'string') {
    return rawValue;
  }
  const match = rawValue.match(ALIAS_RE);
  if (!match) {
    throw new Error(
      `Invalid token value "${rawValue}": expected a value object or a "{group.path}" alias`
    );
  }
  const refPath = match[1];
  if (chain.includes(refPath)) {
    throw new Error(`Circular token reference: ${[...chain, refPath].join(' -> ')}`);
  }
  const target = navigatePath(mergedTree, refPath.split('.'));
  if (!isToken(target)) {
    throw new Error(`Unresolved token reference "{${refPath}}"`);
  }
  return resolveValue(target.$value, mergedTree, [...chain, refPath]);
}

// Flattens a semantic token tree into { "a.b.c": "#hex" }, resolving every
// leaf's alias against mergedTree (primitives + that theme's semantic tree).
export function flattenSemanticTokens(semanticTree, mergedTree) {
  const flat = {};

  function walk(node, pathParts, inheritedType) {
    if (isToken(node)) {
      const tokenPath = pathParts.join('.');
      const type = node.$type ?? inheritedType;
      if (type !== 'color') {
        throw new Error(`Token "${tokenPath}" has unsupported $type "${type}" (expected "color")`);
      }
      const resolved = resolveValue(node.$value, mergedTree);
      if (!resolved || typeof resolved !== 'object' || typeof resolved.hex !== 'string') {
        throw new Error(
          `Token "${tokenPath}" did not resolve to a color value with a "hex" fallback`
        );
      }
      flat[tokenPath] = resolved.hex;
      return;
    }
    const nextType = node.$type ?? inheritedType;
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      walk(child, [...pathParts, key], nextType);
    }
  }

  walk(semanticTree, [], undefined);
  return flat;
}

export function tokenPathToCssVar(tokenPath) {
  return `--color-${tokenPath.replace(/\./g, '-')}`;
}

export function buildTokens() {
  const primitives = readJSON('primitives.json');

  const resolved = { light: {}, dark: {} };
  for (const theme of THEMES) {
    const semanticTree = readJSON(`semantic/${theme}.json`);
    const mergedTree = { ...primitives, ...semanticTree };
    resolved[theme] = flattenSemanticTokens(semanticTree, mergedTree);
  }

  const [firstTheme, ...restThemes] = THEMES;
  const referenceKeys = Object.keys(resolved[firstTheme]).sort();
  for (const theme of restThemes) {
    const themeKeys = Object.keys(resolved[theme]).sort();
    if (JSON.stringify(themeKeys) !== JSON.stringify(referenceKeys)) {
      const missingInTheme = referenceKeys.filter((k) => !themeKeys.includes(k));
      const missingInFirst = themeKeys.filter((k) => !referenceKeys.includes(k));
      throw new Error(
        `Token sets differ between "${firstTheme}" and "${theme}". ` +
          `Missing in ${theme}: [${missingInTheme.join(', ')}]. ` +
          `Missing in ${firstTheme}: [${missingInFirst.join(', ')}].`
      );
    }
  }

  fs.mkdirSync(distDir, { recursive: true });

  for (const theme of THEMES) {
    const lines = [`:root[data-theme='${theme}'] {`];
    for (const tokenPath of referenceKeys) {
      lines.push(`  ${tokenPathToCssVar(tokenPath)}: ${resolved[theme][tokenPath]};`);
    }
    lines.push('}', '');
    fs.writeFileSync(path.join(distDir, `${theme}.css`), lines.join('\n'));
  }

  fs.writeFileSync(
    path.join(distDir, 'resolved.json'),
    JSON.stringify(resolved, null, 2) + '\n'
  );

  return resolved;
}

// Run when executed directly (node scripts/build-tokens.mjs)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const resolved = buildTokens();
  const count = Object.keys(resolved.light).length;
  console.log(`Built ${count} semantic tokens for themes: ${THEMES.join(', ')}`);
  console.log(`  -> dist/tokens/light.css`);
  console.log(`  -> dist/tokens/dark.css`);
  console.log(`  -> dist/tokens/resolved.json`);
}
