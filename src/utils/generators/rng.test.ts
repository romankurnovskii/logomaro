import { describe, it, expect } from 'vitest';
import { mulberry32, rand, randInt, pick } from './rng';

describe('mulberry32', () => {
  it('returns a function', () => {
    expect(typeof mulberry32(1)).toBe('function');
  });

  it('produces deterministic sequences for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 5; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let same = 0;
    for (let i = 0; i < 10; i++) {
      if (a() === b()) same++;
    }
    expect(same).toBeLessThan(10);
  });

  it('outputs values in [0, 1)', () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 200; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('rand', () => {
  it('returns values within [min, max]', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const v = rand(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe('randInt', () => {
  it('returns integers within [min, max]', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 100; i++) {
      const v = randInt(rng, 3, 7);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
});

describe('pick', () => {
  it('returns an element from the array', () => {
    const rng = mulberry32(11);
    const arr = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(pick(rng, arr));
    }
  });
});
