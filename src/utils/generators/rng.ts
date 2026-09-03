/**
 * @file rng.ts
 * @description Mulberry32 — a tiny, fast, seedable 32-bit PRNG.
 * Lets a generation be reproduced: same seed => same logo.
 */
export type Rng = () => number;

export const mulberry32 = (seed: number): Rng => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const rand = (rng: Rng, min: number, max: number) => min + rng() * (max - min);

export const randInt = (rng: Rng, min: number, max: number) =>
  Math.floor(rand(rng, min, max + 1));

export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
