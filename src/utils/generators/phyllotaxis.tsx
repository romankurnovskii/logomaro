/**
 * @file phyllotaxis.ts
 * @description Sunflower / Fermat spiral generator.
 * r(n) = c · √n, θ(n) = n · GOLDEN_ANGLE.
 * Dots placed along the spiral; one or two optional arcs through them.
 */
import { motion } from 'framer-motion';
import { SvgWrapper } from '../svg';
import { pickPalette, pickAnimationDuration } from './palette';
import type { Rng } from './rng';
import { rand, randInt, pick } from './rng';
import { fitToViewBox, rotate, sampleCurve } from './geometry';
import type { Pt } from './geometry';
import type { Logo } from '../../types/logo';
import { buildProceduralId } from './index';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const VIEWBOX = 100;

const buildSpiral = (n: number, scale: number): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const r = scale * Math.sqrt(i + 1);
    const theta = i * GOLDEN_ANGLE;
    pts.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
  }
  return pts;
};

export const phyllotaxis = (rng: Rng, index: number, isAnim: boolean): Logo => {
  const dotCount = randInt(rng, 40, 110);
  const scale = rand(rng, 35, 45);
  const rotation = rand(rng, 0, Math.PI * 2);
  const layout = pick(rng, ['dots-only', 'dots-and-arc', 'spiral-curve'] as const);

  const raw = buildSpiral(dotCount, scale).map((p) => rotate(p, 0, 0, rotation));
  const placed = fitToViewBox(raw, VIEWBOX, 0.18);
  const palette = pickPalette(rng);
  const duration = pickAnimationDuration(rng);

  const dotRMax = 1.6;
  const dotRMin = 0.3;

  const spiralPath = (() => {
    if (layout !== 'spiral-curve') return '';
    const curve = sampleCurve((t) => {
      const i = (t / (Math.PI * 2)) * dotCount;
      const r = scale * Math.sqrt(i + 1);
      const theta = i * GOLDEN_ANGLE + rotation;
      return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
    }, 320);
    const fitted = fitToViewBox(curve, VIEWBOX, 0.18);
    return 'M ' + fitted.map((p) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' L ');
  })();

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    const animate = isAnim && !isPaused;
    return (
      <SvgWrapper>
        {layout === 'spiral-curve' && (
          <motion.path
            d={spiralPath}
            fill="none"
            stroke={palette.primary}
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={animate ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {layout === 'dots-and-arc' && (
          <motion.circle
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={VIEWBOX * 0.42}
            fill="none"
            stroke={palette.accent}
            strokeWidth="0.6"
            strokeDasharray="2 4"
            opacity={0.45}
            animate={animate ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: duration * 2, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${VIEWBOX / 2}px ${VIEWBOX / 2}px` }}
          />
        )}

        {placed.map((p, i) => {
          const t = i / dotCount;
          const radius = dotRMax - t * (dotRMax - dotRMin);
          const color =
            i % 5 === 0 ? palette.primary : i % 7 === 0 ? palette.secondary : palette.accent;
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={radius}
              fill={color}
              animate={
                animate
                  ? { opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }
                  : { opacity: 1, scale: 1 }
              }
              transition={{
                duration,
                repeat: Infinity,
                delay: i * 0.02,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          );
        })}
      </SvgWrapper>
    );
  };

  return {
    id: buildProceduralId('PHYL', index),
    type: isAnim ? 'dynamic' : 'static',
    motif: 'Phyllotaxis',
    Component,
  };
};
