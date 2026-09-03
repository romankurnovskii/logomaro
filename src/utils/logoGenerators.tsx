/**
 * @file logoGenerators.tsx
 * @description Functions for creating AI-driven and procedural logos.
 *
 * @features
 * - `createAILogo` — builds a Logo from AI-generated data, auto-centered/scaled,
 *   with stroke-width hierarchy and fill support.
 * - `createRandomLogo` — delegates to the mathematical generator pool
 *   (phyllotaxis, lissajous, rose curve, golden spiral, spirograph).
 */
import { motion } from 'framer-motion';
import type { Logo, AILogoData, LogoElement } from '../types/logo';
import { SvgWrapper } from './svg';
import { THEME } from './theme';
import { createProceduralLogo, DEFI_PALETTE } from './generators';

export interface AIElementInput {
  shape: string;
  d?: string;
  cx?: number | string;
  cy?: number | string;
  r?: number | string;
  points?: string;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  strokeType?: string;
  isAnimated?: boolean;
}

export interface AIResponseInput {
  motifName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  elements?: AIElementInput[];
}

export interface ValidatedElement {
  shape: 'path' | 'circle' | 'polygon' | 'rect';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  strokeType: 'primary' | 'secondary';
  isAnimated: boolean;
}

export interface ValidatedLogo {
  motifName: string;
  primaryColor: string;
  secondaryColor: string;
  elements: ValidatedElement[];
}

export { DEFI_PALETTE };

const VIEWBOX_SIZE = 100;
const STROKE_PRIMARY = 2.4;
const STROKE_SECONDARY = 1.2;

export const buildLogoId = (prefix: string, index: number): string => {
  const seq = String(index).padStart(4, '0');
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0');
  return `${prefix}-${seq}-${stamp}${rand}`;
};

const deriveSecondaryColor = (primary: string | undefined): string => {
  if (!primary || !primary.startsWith('#') || primary.length !== 7) {
    return THEME.accentNeon;
  }
  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);
  const comp = (v: number) => 255 - v;
  return `#${[comp(r), comp(g), comp(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
};

interface NormalizedElement {
  shape: 'path' | 'circle' | 'polygon' | 'rect';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: boolean;
  strokeType: 'primary' | 'secondary';
  isAnimated: boolean;
}

const normalizeElement = (el: LogoElement): NormalizedElement | null => {
  if (el.shape === 'path' && el.d) {
    return {
      shape: 'path',
      d: el.d,
      fill: false,
      strokeType: el.strokeType,
      isAnimated: el.isAnimated,
    };
  }
  if (el.shape === 'circle' && el.cx != null && el.cy != null && el.r != null) {
    return {
      shape: 'circle',
      cx: el.cx,
      cy: el.cy,
      r: el.r,
      fill: false,
      strokeType: el.strokeType,
      isAnimated: el.isAnimated,
    };
  }
  if (el.shape === 'polygon' && el.points) {
    return {
      shape: 'polygon',
      points: el.points,
      fill: false,
      strokeType: el.strokeType,
      isAnimated: el.isAnimated,
    };
  }
  if (
    el.shape === 'rect' &&
    el.x != null &&
    el.y != null &&
    el.width != null &&
    el.height != null
  ) {
    return {
      shape: 'rect',
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      fill: false,
      strokeType: el.strokeType,
      isAnimated: el.isAnimated,
    };
  }
  return null;
};

interface Bbox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const elementBbox = (el: NormalizedElement): Bbox | null => {
  if (el.shape === 'circle' && el.cx != null && el.cy != null && el.r != null) {
    return { minX: el.cx - el.r, minY: el.cy - el.r, maxX: el.cx + el.r, maxY: el.cy + el.r };
  }
  if (
    el.shape === 'rect' &&
    el.x != null &&
    el.y != null &&
    el.width != null &&
    el.height != null
  ) {
    return { minX: el.x, minY: el.y, maxX: el.x + el.width, maxY: el.y + el.height };
  }
  if (el.shape === 'polygon' && el.points) {
    const nums = el.points
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (nums.length < 4 || nums.some(isNaN)) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (let i = 0; i < nums.length; i += 2) {
      const x = nums[i];
      const y = nums[i + 1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }
  return null;
};

const pathBbox = (d: string): Bbox | null => {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const numbers = nums.map(Number);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i < numbers.length; i += 2) {
    const x = numbers[i];
    const y = numbers[i + 1];
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
};

const transformPath = (d: string, dx: number, dy: number, k: number): string => {
  return d
    .replace(/-?\d+(?:\.\d+)?/g, (match) => {
      const n = Number(match);
      return (n * k).toFixed(3);
    })
    .replace(/M/g, `M${dx.toFixed(3)} ${dy.toFixed(3)} L`);
};

const transformPoints = (points: string, dx: number, dy: number, k: number): string => {
  return points
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .map((n, i) => (i % 2 === 0 ? n * k + dx : n * k + dy))
    .reduce<string>((acc, n, i) => {
      const sep = i === 0 ? '' : i % 2 === 0 ? ' ' : ',';
      return acc + sep + n.toFixed(3);
    }, '');
};

const autoCenterAndScale = (els: NormalizedElement[]): NormalizedElement[] => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let hasShape = false;

  for (const el of els) {
    const b = el.shape === 'path' && el.d ? pathBbox(el.d) : elementBbox(el);
    if (!b) continue;
    hasShape = true;
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  if (!hasShape || !isFinite(minX) || maxX - minX === 0 || maxY - minY === 0) {
    return els;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const target = VIEWBOX_SIZE * 0.82;
  const scale = target / Math.max(w, h);
  const offsetX = (VIEWBOX_SIZE - w * scale) / 2 - minX * scale;
  const offsetY = (VIEWBOX_SIZE - h * scale) / 2 - minY * scale;

  return els.map((el) => {
    if (el.shape === 'path' && el.d) {
      return { ...el, d: transformPath(el.d, offsetX, offsetY, scale) };
    }
    if (el.shape === 'circle' && el.cx != null && el.cy != null && el.r != null) {
      return {
        ...el,
        cx: el.cx * scale + offsetX,
        cy: el.cy * scale + offsetY,
        r: el.r * scale,
      };
    }
    if (
      el.shape === 'rect' &&
      el.x != null &&
      el.y != null &&
      el.width != null &&
      el.height != null
    ) {
      return {
        ...el,
        x: el.x * scale + offsetX,
        y: el.y * scale + offsetY,
        width: el.width * scale,
        height: el.height * scale,
      };
    }
    if (el.shape === 'polygon' && el.points) {
      return { ...el, points: transformPoints(el.points, offsetX, offsetY, scale) };
    }
    return el;
  });
};

export const createAILogo = (aiData: AILogoData, index: number): Logo => {
  const { motifName, primaryColor, elements } = aiData;
  const c1 = primaryColor || THEME.accentGold;
  const c2 =
    aiData.secondaryColor && aiData.secondaryColor !== c1
      ? aiData.secondaryColor
      : deriveSecondaryColor(c1);

  const normalized = (elements || [])
    .map(normalizeElement)
    .filter((e): e is NormalizedElement => e !== null);
  const centered = autoCenterAndScale(normalized);

  const Component = ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      {centered.map((el, i) => {
        const strokeColor = el.strokeType === 'primary' ? c1 : c2;
        const strokeWidth = el.strokeType === 'primary' ? STROKE_PRIMARY : STROKE_SECONDARY;
        const animProps =
          el.isAnimated && !isPaused
            ? {
                animate: {
                  opacity: [0.6, 1, 0.6],
                  scale: el.shape === 'circle' ? [0.95, 1.05, 0.95] : 1,
                },
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                } as const,
              }
            : {};

        if (el.shape === 'path' && el.d) {
          return (
            <motion.path
              key={i}
              d={el.d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              {...animProps}
            />
          );
        }
        if (el.shape === 'circle' && el.cx != null) {
          return (
            <motion.circle
              key={i}
              cx={el.cx}
              cy={el.cy}
              r={el.r}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              {...animProps}
            />
          );
        }
        if (el.shape === 'polygon' && el.points) {
          return (
            <motion.polygon
              key={i}
              points={el.points}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              {...animProps}
            />
          );
        }
        if (el.shape === 'rect' && el.x != null) {
          return (
            <motion.rect
              key={i}
              x={el.x}
              y={el.y}
              width={el.width}
              height={el.height}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              {...animProps}
            />
          );
        }
        return null;
      })}
    </SvgWrapper>
  );

  return {
    id: buildLogoId('AI-GEN', index),
    type: 'ai-driven',
    motif: motifName || 'Neural Synthesis',
    Component,
  };
};

export const createRandomLogo = (index: number): Logo => {
  const isAnim = Math.random() > 0.3;
  return createProceduralLogo(index, isAnim);
};
