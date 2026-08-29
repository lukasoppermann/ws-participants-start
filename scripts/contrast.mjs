#!/usr/bin/env node
// Generic WCAG contrast utilities. Works on any two hex colors and any list
// of { fg, bg, minRatio } token pairings — nothing here is hard-coded to a
// specific token name, so it stays valid as new tokens are added.

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function srgbChannelToLinear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbChannelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks a list of { fg, bg, minRatio, themes? } token pairings against a
 * resolved token map ({ light: { "token.path": "#hex" }, dark: {...} }).
 *
 * Returns an array of results, one per (pairing, theme) combination, each
 * carrying enough detail to build a precise failure message:
 *   { fg, bg, theme, ratio, minRatio, pass }
 */
export function checkPairings(resolvedTokens, pairings, themes = Object.keys(resolvedTokens)) {
  const results = [];
  for (const pairing of pairings) {
    const pairingThemes = pairing.themes ?? themes;
    for (const theme of pairingThemes) {
      const themeTokens = resolvedTokens[theme];
      if (!themeTokens) {
        throw new Error(`Unknown theme "${theme}"`);
      }
      const fgHex = themeTokens[pairing.fg];
      const bgHex = themeTokens[pairing.bg];
      if (!fgHex) throw new Error(`Unknown token "${pairing.fg}" (theme: ${theme})`);
      if (!bgHex) throw new Error(`Unknown token "${pairing.bg}" (theme: ${theme})`);

      const ratio = contrastRatio(fgHex, bgHex);
      results.push({
        fg: pairing.fg,
        bg: pairing.bg,
        theme,
        ratio,
        minRatio: pairing.minRatio,
        pass: ratio >= pairing.minRatio,
      });
    }
  }
  return results;
}

export function formatFailure(result) {
  return (
    `Contrast check failed: "${result.fg}" on "${result.bg}" in ${result.theme} theme ` +
    `measured ${result.ratio.toFixed(2)}:1, required at least ${result.minRatio}:1`
  );
}
