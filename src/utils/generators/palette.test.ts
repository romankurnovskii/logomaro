import { describe, it, expect } from 'vitest';
import { mulberry32 } from './rng';
import { DEFI_PALETTE, pickPalette } from './palette';

describe('DEFI_PALETTE', () => {
  it('has at least 10 colors', () => {
    expect(DEFI_PALETTE.length).toBeGreaterThanOrEqual(10);
  });

  it('all entries are valid hex colors', () => {
    for (const c of DEFI_PALETTE) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('contains no duplicate hex values', () => {
    expect(new Set(DEFI_PALETTE).size).toBe(DEFI_PALETTE.length);
  });
});

describe('pickPalette', () => {
  it('returns three distinct colors from the palette', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 50; i++) {
      const p = pickPalette(rng);
      expect(DEFI_PALETTE).toContain(p.primary);
      expect(DEFI_PALETTE).toContain(p.secondary);
      expect(DEFI_PALETTE).toContain(p.accent);
      expect(new Set([p.primary, p.secondary, p.accent]).size).toBe(3);
    }
  });

  it('produces different palettes for the same seed across many draws', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 50; s++) {
      const p = pickPalette(mulberry32(s));
      seen.add(`${p.primary}|${p.secondary}|${p.accent}`);
    }
    expect(seen.size).toBeGreaterThan(5);
  });
});
