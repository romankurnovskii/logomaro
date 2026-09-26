/**
 * @file blobMark.test.tsx
 * @description Blob marks stay deterministic for a seed and render real SVG.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { blobMark, createBlobLogo, createBlobSet, randomBlobName } from './blobMark';
import { mulberry32 } from './rng';

const svgOf = (logo: ReturnType<typeof createBlobLogo>): string => {
  const { container } = render(<logo.Component isPaused />);
  return container.querySelector('svg')?.outerHTML ?? '';
};

describe('blob marks', () => {
  it('renders an svg creature for a seed', () => {
    const logo = createBlobLogo('Velkora', 1, 0);
    expect(logo.type).toBe('blob');
    expect(logo.motif).toBe('Velkora');
    const svg = svgOf(logo);
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 100 100"');
  });

  it('draws the same body for the same seed and a different one for another', () => {
    const a = svgOf(createBlobLogo('acme', 2, 0));
    const b = svgOf(createBlobLogo('acme', 3, 0));
    const c = svgOf(createBlobLogo('other', 4, 0));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('returns five creatures with distinct random names and ids', () => {
    const set = createBlobSet(10, mulberry32(42));
    expect(set).toHaveLength(5);
    expect(new Set(set.map((logo) => logo.motif)).size).toBe(5);
    expect(new Set(set.map((logo) => logo.id)).size).toBe(5);
    expect(set.every((logo) => logo.type === 'blob')).toBe(true);
    expect(set.every((logo) => logo.id.startsWith('BLOB-'))).toBe(true);
  });

  it('skips names already in use', () => {
    const rng = mulberry32(7);
    const first = randomBlobName(rng, new Set());
    const used = new Set([first.toLowerCase()]);
    const next = randomBlobName(mulberry32(7), used);
    expect(next.toLowerCase()).not.toBe(first.toLowerCase());
  });

  it('joins the procedural pool as a blob logo', () => {
    const logo = blobMark(mulberry32(1), 8);
    expect(logo.type).toBe('blob');
    expect(logo.id.startsWith('BLOB-')).toBe(true);
    expect(svgOf(logo)).toContain('<svg');
  });
});
