/**
 * @file index.ts
 * @description Public entry for the procedural generator pool.
 * Dispatch by hash(seed) over phyllotaxis, lissajous, rose, golden, spirograph.
 */
import type { Logo } from '../../types/logo';
import { mulberry32 } from './rng';
import { phyllotaxis } from './phyllotaxis';
import { lissajous } from './lissajous';
import { roseCurve } from './roseCurve';
import { goldenSpiral } from './goldenSpiral';
import { spirograph } from './spirograph';

export { DEFI_PALETTE } from './palette';

type Generator = (rng: () => number, index: number, isAnim: boolean) => Logo;

const POOL: Generator[] = [phyllotaxis, lissajous, roseCurve, goldenSpiral, spirograph];

export const buildProceduralId = (prefix: string, index: number): string => {
  const seq = String(index).padStart(4, '0');
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0');
  return `${prefix}-${seq}-${stamp}${rand}`;
};

export const createProceduralLogo = (index: number, isAnim: boolean): Logo => {
  const seed = (index * 2654435761) >>> 0;
  const rng = mulberry32(seed);
  const choice = POOL[seed % POOL.length];
  return choice(rng, index, isAnim);
};
