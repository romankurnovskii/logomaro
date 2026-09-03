/**
 * @file lissajous.ts
 * @description Lissajous curve generator: x = A·sin(a·t+δ), y = B·sin(b·t).
 * Small integer ratios (3:2, 4:3, 5:4) give closed, elegant figures.
 * Harmonograph adds decaying sin terms (mechanical, organic).
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

const COUPLED_RATIOS: ReadonlyArray<readonly [number, number]> = [
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 5],
  [5, 6],
];

const sampleLissajous = (
  a: number,
  b: number,
  delta: number,
  decay: number,
  harmonograph: boolean
): Pt[] => {
  const fn = harmonograph
    ? (t: number): Pt => {
        const decayFactor = Math.exp(-decay * t);
        return {
          x: 40 * decayFactor * (Math.sin(a * t) + 0.3 * Math.sin(3 * a * t + 1.2)),
          y:
            40 *
            decayFactor *
            (Math.sin(b * t + delta) + 0.3 * Math.sin(2 * b * t + 0.5 + delta)),
        };
      }
    : (t: number): Pt => ({
        x: 40 * Math.sin(a * t + delta),
        y: 40 * Math.sin(b * t),
      });

  return sampleCurve(fn, 600, 0, Math.PI * 2);
};

export const lissajous = (rng: Rng, index: number, isAnim: boolean): Logo => {
  const ratio = pick(rng, COUPLED_RATIOS);
  const delta = rand(rng, 0, Math.PI / 2);
  const decay = rand(rng, 0.0, isAnim ? 0.15 : 0.05);
  const harmonograph = rng() < 0.45;

  const raw = sampleLissajous(ratio[0], ratio[1], delta, decay, harmonograph);
  const fitted = fitToViewBox(raw, VIEWBOX, 0.15);
  const path = ptsToSmoothPath(fitted, true);
  const palette = pickPalette(rng);
  const duration = pickAnimationDuration(rng, 4);

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    const animate = isAnim && !isPaused;
    return (
      <SvgWrapper>
        <motion.path
          d={path}
          fill="none"
          stroke={palette.primary}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={animate ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
        />
        <motion.circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={1.5}
          fill={palette.accent}
          animate={animate ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: duration / 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
        />
        <circle cx={fitted[0].x} cy={fitted[0].y} r={1.2} fill={palette.secondary} />
      </SvgWrapper>
    );
  };

  return {
    id: buildProceduralId('LISS', index),
    type: isAnim ? 'dynamic' : 'static',
    motif: 'Lissajous',
    Component,
  };
};
