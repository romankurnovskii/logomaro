/**
 * @file geometry.ts
 * @description Pure helpers used by every mathematical generator:
 * coordinate transforms, sampling, and SVG path builders.
 */
import type { Rng } from './rng';

export interface Pt {
  x: number;
  y: number;
}

/** Sample a parametric curve `fn(t)` for `t in [0, 2π]` (or any closed interval). */
export const sampleCurve = (
  fn: (t: number) => Pt,
  steps = 240,
  tMin = 0,
  tMax = Math.PI * 2
): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = tMin + ((tMax - tMin) * i) / steps;
    pts.push(fn(t));
  }
  return pts;
};

/** Convert a list of points to an SVG `M ... L ...` path string. */
export const ptsToPath = (pts: Pt[], closed = true): string => {
  if (pts.length === 0) return '';
  let d = `M ${pts[0].x.toFixed(3)} ${pts[0].y.toFixed(3)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x.toFixed(3)} ${pts[i].y.toFixed(3)}`;
  }
  if (closed) d += ' Z';
  return d;
};

/** Convert points to a smooth Catmull-Rom-style cubic Bezier path. */
export const ptsToSmoothPath = (pts: Pt[], closed = true): string => {
  if (pts.length < 2) return ptsToPath(pts, closed);
  const n = pts.length;
  const get = (i: number): Pt => pts[((i % n) + n) % n];

  let d = `M ${pts[0].x.toFixed(3)} ${pts[0].y.toFixed(3)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(3)} ${cp1y.toFixed(3)} ${cp2x.toFixed(
      3
    )} ${cp2y.toFixed(3)} ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`;
  }
  if (closed) d += ' Z';
  return d;
};

/** Bounding box of a point set. */
export const bbox = (pts: Pt[]) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
};

/** Normalize a point set so its bbox fits inside [0, target]² centered at target/2. */
export const fitToViewBox = (pts: Pt[], target = 100, padding = 0.12): Pt[] => {
  const b = bbox(pts);
  if (!isFinite(b.minX) || b.w === 0 || b.h === 0) return pts;
  const size = target * (1 - padding * 2);
  const scale = size / Math.max(b.w, b.h);
  const offsetX = (target - b.w * scale) / 2 - b.minX * scale;
  const offsetY = (target - b.h * scale) / 2 - b.minY * scale;
  return pts.map((p) => ({ x: p.x * scale + offsetX, y: p.y * scale + offsetY }));
};

export const chooseSteps = (rng: Rng, lo: number, hi: number) =>
  Math.floor(lo + rng() * (hi - lo + 1));

/** Rotate a point around (cx, cy) by `angle` radians. */
export const rotate = (p: Pt, cx: number, cy: number, angle: number): Pt => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = p.x - cx;
  const dy = p.y - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
};
