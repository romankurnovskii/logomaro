/**
 * @file roseCurve.ts
 * @description Rose curve (rhodonea) generator: r(θ) = a·cos(k·θ).
 * Odd k → k petals; even k → 2k petals. Highly symmetric, institutional feel.
 */
import { motion } from 'framer-motion';
import { SvgWrapper } from '../svg';
import { pickPalette, pickAnimationDuration } from './palette';
import type { Rng } from './rng';
import { rand, randInt } from './rng';
import { fitToViewBox, sampleCurve, ptsToSmoothPath } from './geometry';
import type { Logo } from '../../types/logo';
import { buildProceduralId } from './index';

const VIEWBOX = 100;

export const roseCurve = (rng: Rng, index: number, isAnim: boolean): Logo => {
  const k = randInt(rng, 2, 7);
  const a = rand(rng, 38, 45);
  const phase = rand(rng, 0, Math.PI);

  const raw = sampleCurve(
    (t) => {
      const r = a * Math.cos(k * t + phase);
      return { x: r * Math.cos(t), y: r * Math.sin(t) };
    },
    500,
    0,
    k % 2 === 0 ? Math.PI * 2 : Math.PI
  );

  const fitted = fitToViewBox(raw, VIEWBOX, 0.18);
  const path = ptsToSmoothPath(fitted, true);
  const palette = pickPalette(rng);
  const duration = pickAnimationDuration(rng);

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    const animate = isAnim && !isPaused;
    return (
      <SvgWrapper>
        <motion.path
          d={path}
          fill="none"
          stroke={palette.primary}
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={animate ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
        />
        <motion.circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={1.5}
          fill={palette.secondary}
          animate={animate ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: duration / 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
        />
      </SvgWrapper>
    );
  };

  return {
    id: buildProceduralId('ROSE', index),
    type: isAnim ? 'dynamic' : 'static',
    motif: 'Rose Curve',
    Component,
  };
};
