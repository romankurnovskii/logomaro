/**
 * @file spirograph.ts
 * @description Epitrochoid / hypotrochoid (spirograph) generator.
 * x = (R-r)·cos(t) + d·cos((R-r)/r · t)
 * y = (R-r)·sin(t) - d·sin((R-r)/r · t)
 * Hypnotic, mechanical, ideal for "DeFi / protocol" branding.
 */
import { motion } from 'framer-motion';
import { SvgWrapper } from '../svg';
import { pickPalette, pickAnimationDuration } from './palette';
import type { Rng } from './rng';
import { rand, pick } from './rng';
import { fitToViewBox, sampleCurve, ptsToSmoothPath } from './geometry';
import type { Pt } from './geometry';
import type { Logo } from '../../types/logo';
import { buildProceduralId } from './index';

const VIEWBOX = 100;
const TWO_PI = Math.PI * 2;

const sampleEpitrochoid = (R: number, r: number, d: number, hyp: boolean): Pt[] => {
  const lcmDenom = gcdInt(R, r);
  const turns = (hyp ? r : R) / lcmDenom;
  const tMax = TWO_PI * Math.max(turns, 5);
  return sampleCurve(
    (t) => {
      if (hyp) {
        return {
          x: (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
          y: (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t),
        };
      }
      return {
        x: (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t),
        y: (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t),
      };
    },
    900,
    0,
    tMax
  );
};

const gcdInt = (a: number, b: number): number => {
  let x = Math.round(a);
  let y = Math.round(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return Math.abs(x);
};

export const spirograph = (rng: Rng, index: number, isAnim: boolean): Logo => {
  const hyp = rng() < 0.5;
  const ratios: ReadonlyArray<readonly [number, number]> = hyp
    ? [
        [5, 3],
        [7, 4],
        [8, 3],
        [9, 4],
        [7, 5],
        [6, 5],
      ]
    : [
        [6, 1],
        [7, 2],
        [5, 2],
        [8, 3],
        [9, 2],
        [7, 3],
      ];
  const [R, r] = pick(rng, ratios);
  const d = rand(rng, 1, r * 0.95);

  const raw = sampleEpitrochoid(R, r, d, hyp);
  const fitted = fitToViewBox(raw, VIEWBOX, 0.12);
  const path = ptsToSmoothPath(fitted, true);
  const palette = pickPalette(rng);
  const duration = pickAnimationDuration(rng, 6);

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    const animate = isAnim && !isPaused;
    return (
      <SvgWrapper>
        <motion.path
          d={path}
          fill="none"
          stroke={palette.primary}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={animate ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
        />
        <motion.circle
          cx={fitted[0].x}
          cy={fitted[0].y}
          r={1.4}
          fill={palette.accent}
          animate={animate ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: duration / 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${fitted[0].x}px ${fitted[0].y}px` }}
        />
      </SvgWrapper>
    );
  };

  return {
    id: buildProceduralId('SPIR', index),
    type: isAnim ? 'dynamic' : 'static',
    motif: hyp ? 'Hypotrochoid' : 'Epitrochoid',
    Component,
  };
};
