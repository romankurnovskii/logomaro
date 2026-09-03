/**
 * @file palette.ts
 * @description Shared color & motion helpers for the procedural generator pool.
 *
 * The DEFI_PALETTE is a curated 12-color set tuned for institutional / crypto
 * brand marks: warm gold + cool neon anchors, plus accent reds, violets,
 * teals, and a few neutrals. Used by every procedural generator and as the
 * allowed list we tell the LLM to pick from.
 */
import { THEME } from '../theme';

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
}

export const DEFI_PALETTE: readonly string[] = [
  THEME.accentGold, // #d4af37
  THEME.accentNeon, // #00ff9d
  THEME.accentWhite, // #ffffff
  '#ff6b35', // ember
  '#b829ff', // violet
  '#00c2ff', // cyan
  '#ff3b6b', // rose
  '#3ddc97', // mint
  '#8c7a70', // warm gray
  '#1f3a5f', // navy
  '#e8e3df', // bone
  '#f5d76e', // pale gold
] as const;

export const pickPalette = (rng: () => number): Palette => {
  const pool = DEFI_PALETTE;
  const pickFrom = (exclude: number[] = []) => {
    while (true) {
      const i = Math.floor(rng() * pool.length);
      if (!exclude.includes(i)) return i;
    }
  };
  const primaryIdx = pickFrom();
  const secondaryIdx = pickFrom([primaryIdx]);
  const accentIdx = pickFrom([primaryIdx, secondaryIdx]);
  return {
    primary: pool[primaryIdx],
    secondary: pool[secondaryIdx],
    accent: pool[accentIdx],
  };
};

export const pickAnimationDuration = (rng: () => number, base = 3) => base + rng() * 4;
