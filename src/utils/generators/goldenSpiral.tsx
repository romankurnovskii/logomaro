/**
 * @file goldenSpiral.ts
 * @description Golden spiral composed of nested Fibonacci squares
 * with a single arc cutting through their corners.
 */
import { motion } from 'framer-motion';
import { SvgWrapper } from '../svg';
import { pickPalette, pickAnimationDuration } from './palette';
import type { Rng } from './rng';
import { randInt } from './rng';
import type { Logo } from '../../types/logo';
import { buildProceduralId } from './index';

const VIEWBOX = 100;
const PHI = (1 + Math.sqrt(5)) / 2;

interface SpiralPiece {
  x: number;
  y: number;
  size: number;
  arcCenterX: number;
  arcCenterY: number;
  arcStart: number;
  arcEnd: number;
}

const buildSpiral = (squares: number, startSize: number): SpiralPiece[] => {
  const pieces: SpiralPiece[] = [];
  let size = startSize;
  let x = 0;
  let y = 0;
  let orientation: 0 | 1 | 2 | 3 = 0;

  for (let i = 0; i < squares; i++) {
    let cx: number, cy: number, startAng: number, sqX: number, sqY: number;
    switch (orientation) {
      case 0:
        sqX = x;
        sqY = y;
        cx = x;
        cy = y + size;
        startAng = 0;
        x = x + size;
        y = y + size - size / PHI;
        break;
      case 1:
        sqX = x - size;
        sqY = y;
        cx = x - size;
        cy = y + size;
        startAng = Math.PI / 2;
        x = x - size + size / PHI;
        y = y + size;
        break;
      case 2:
        sqX = x - size;
        sqY = y - size;
        cx = x;
        cy = y - size;
        startAng = Math.PI;
        x = x - size;
        y = y - size + size / PHI;
        break;
      default:
        sqX = x;
        sqY = y - size;
        cx = x + size;
        cy = y;
        startAng = -Math.PI / 2;
        x = x + size / PHI;
        y = y - size;
        break;
    }
    pieces.push({
      x: sqX,
      y: sqY,
      size,
      arcCenterX: cx,
      arcCenterY: cy,
      arcStart: startAng,
      arcEnd: startAng + Math.PI / 2,
    });
    size = size / PHI;
    orientation = ((orientation + 1) % 4) as 0 | 1 | 2 | 3;
  }
  return pieces;
};

const sampleArc = (cx: number, cy: number, r: number, a0: number, a1: number, steps = 10) => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
};

const fitPieces = (pieces: SpiralPiece[]): { pieces: SpiralPiece[]; arcPath: string } => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pieces) {
    minX = Math.min(minX, p.x, p.x + p.size);
    minY = Math.min(minY, p.y, p.y + p.size);
    maxX = Math.max(maxX, p.x, p.x + p.size);
    maxY = Math.max(maxY, p.y, p.y + p.size);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = (VIEWBOX * 0.84) / Math.max(w, h);
  const offsetX = (VIEWBOX - w * scale) / 2 - minX * scale;
  const offsetY = (VIEWBOX - h * scale) / 2 - minY * scale;

  const scalePiece = (p: SpiralPiece): SpiralPiece => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY,
    size: p.size * scale,
    arcCenterX: p.arcCenterX * scale + offsetX,
    arcCenterY: p.arcCenterY * scale + offsetY,
    arcStart: p.arcStart,
    arcEnd: p.arcEnd,
  });

  const scaled = pieces.map(scalePiece);
  const arcSamples: { x: number; y: number }[] = [];
  for (const p of scaled) {
    const pts = sampleArc(p.arcCenterX, p.arcCenterY, p.size, p.arcStart, p.arcEnd);
    arcSamples.push(...pts);
  }
  const arcPath =
    'M ' + arcSamples.map((p) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' L ');
  return { pieces: scaled, arcPath };
};

export const goldenSpiral = (rng: Rng, index: number, isAnim: boolean): Logo => {
  const squares = randInt(rng, 6, 9);
  const startSize = randInt(rng, 55, 75);
  const built = fitPieces(buildSpiral(squares, startSize));
  const palette = pickPalette(rng);
  const duration = pickAnimationDuration(rng);

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    const animate = isAnim && !isPaused;
    return (
      <SvgWrapper>
        {built.pieces.map((sq, i) => (
          <rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={sq.size}
            height={sq.size}
            fill="none"
            stroke={palette.secondary}
            strokeWidth={0.6}
            opacity={0.5}
          />
        ))}
        <motion.path
          d={built.arcPath}
          fill="none"
          stroke={palette.primary}
          strokeWidth="1.6"
          strokeLinecap="round"
          animate={animate ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      </SvgWrapper>
    );
  };

  return {
    id: buildProceduralId('GOLD', index),
    type: isAnim ? 'dynamic' : 'static',
    motif: 'Golden Spiral',
    Component,
  };
};
