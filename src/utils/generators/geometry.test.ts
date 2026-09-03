import { describe, it, expect } from 'vitest';
import {
  bbox,
  fitToViewBox,
  ptsToPath,
  ptsToSmoothPath,
  sampleCurve,
  rotate,
} from './geometry';

describe('bbox', () => {
  it('returns min/max over the point set', () => {
    expect(
      bbox([
        { x: 1, y: 2 },
        { x: 5, y: -1 },
        { x: 0, y: 4 },
      ])
    ).toEqual({
      minX: 0,
      minY: -1,
      maxX: 5,
      maxY: 4,
      w: 5,
      h: 5,
    });
  });

  it('handles a single point', () => {
    expect(bbox([{ x: 3, y: 7 }])).toEqual({
      minX: 3,
      minY: 7,
      maxX: 3,
      maxY: 7,
      w: 0,
      h: 0,
    });
  });
});

describe('fitToViewBox', () => {
  it('centers and scales points into a 100x100 viewBox', () => {
    const pts = [
      { x: -10, y: -10 },
      { x: 10, y: 10 },
    ];
    const fitted = fitToViewBox(pts, 100, 0);
    const b = bbox(fitted);
    expect(b.w).toBeCloseTo(100, 5);
    expect(b.h).toBeCloseTo(100, 5);
    expect((b.minX + b.maxX) / 2).toBeCloseTo(50, 5);
    expect((b.minY + b.maxY) / 2).toBeCloseTo(50, 5);
  });

  it('preserves aspect ratio with padding', () => {
    const pts = [
      { x: -20, y: -5 },
      { x: 20, y: 5 },
    ];
    const fitted = fitToViewBox(pts, 100, 0.1);
    const b = bbox(fitted);
    const ratioW = b.w / b.h;
    expect(ratioW).toBeCloseTo(4, 1);
  });

  it('returns input unchanged for a degenerate point set', () => {
    const pts = [{ x: 5, y: 5 }];
    expect(fitToViewBox(pts, 100, 0.1)).toBe(pts);
  });
});

describe('ptsToPath', () => {
  it('produces an M-L path', () => {
    const d = ptsToPath(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      false
    );
    expect(d).toBe('M 0.000 0.000 L 1.000 1.000');
  });

  it('closes with Z when requested', () => {
    const d = ptsToPath(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      true
    );
    expect(d.endsWith('Z')).toBe(true);
  });
});

describe('ptsToSmoothPath', () => {
  it('produces a cubic Bezier path', () => {
    const d = ptsToSmoothPath(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
      true
    );
    expect(d.startsWith('M ')).toBe(true);
    expect(d).toMatch(/C /);
    expect(d.endsWith('Z')).toBe(true);
  });
});

describe('sampleCurve', () => {
  it('returns steps + 1 points', () => {
    const pts = sampleCurve(() => ({ x: 0, y: 0 }), 10);
    expect(pts.length).toBe(11);
  });

  it('evaluates the function on the requested interval', () => {
    const pts = sampleCurve((t) => ({ x: t, y: 0 }), 4, 0, 4);
    expect(pts[0].x).toBe(0);
    expect(pts[pts.length - 1].x).toBe(4);
  });
});

describe('rotate', () => {
  it('rotates 90° about the origin', () => {
    const p = rotate({ x: 1, y: 0 }, 0, 0, Math.PI / 2);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(1, 5);
  });

  it('is a no-op at angle 0', () => {
    const p = rotate({ x: 5, y: 7 }, 0, 0, 0);
    expect(p).toEqual({ x: 5, y: 7 });
  });
});
