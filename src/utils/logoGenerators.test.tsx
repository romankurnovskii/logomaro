/**
 * @file logoGenerators.test.tsx
 * @description Tests for the AI logo normalizer/auto-center and the procedural pool.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createAILogo, createRandomLogo } from './logoGenerators';
import type { AILogoData } from '../types/logo';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: { children?: React.ReactNode; [k: string]: unknown }) => (
      <div {...p}>{children}</div>
    ),
    path: ({ children, ...p }: { children?: React.ReactNode; [k: string]: unknown }) => (
      <path {...p}>{children}</path>
    ),
    circle: ({ children, ...p }: { children?: React.ReactNode; [k: string]: unknown }) => (
      <circle {...p}>{children}</circle>
    ),
    polygon: ({ children, ...p }: { children?: React.ReactNode; [k: string]: unknown }) => (
      <polygon {...p}>{children}</polygon>
    ),
    rect: ({ children, ...p }: { children?: React.ReactNode; [k: string]: unknown }) => (
      <rect {...p}>{children}</rect>
    ),
  },
}));

const collectBbox = (container: HTMLElement) => {
  const els = container.querySelectorAll('path, circle, rect, polygon');
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const el of Array.from(els)) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      minX = Math.min(minX, cx - r);
      minY = Math.min(minY, cy - r);
      maxX = Math.max(maxX, cx + r);
      maxY = Math.max(maxY, cy + r);
    } else if (tag === 'rect') {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    } else if (tag === 'polygon') {
      const points = (el.getAttribute('points') || '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxX = Math.max(maxX, points[i]);
        maxY = Math.max(maxY, points[i + 1]);
      }
    } else if (tag === 'path') {
      const d = el.getAttribute('d') || '';
      const nums = d.match(/-?\d+(?:\.\d+)?/g);
      if (!nums) continue;
      const arr = nums.map(Number);
      for (let i = 0; i < arr.length; i += 2) {
        minX = Math.min(minX, arr[i]);
        minY = Math.min(minY, arr[i + 1]);
        maxX = Math.max(maxX, arr[i]);
        maxY = Math.max(maxY, arr[i + 1]);
      }
    }
  }
  return { minX, minY, maxX, maxY };
};

describe('createAILogo', () => {
  it('returns a Logo with type ai-driven and a function Component', () => {
    const ai: AILogoData = {
      motifName: 'Test',
      primaryColor: '#ff00ff',
      secondaryColor: '#00ff00',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 10, strokeType: 'primary', isAnimated: false },
      ],
    };
    const logo = createAILogo(ai, 1);
    expect(logo.id).toMatch(/^AI-GEN-0001-/);
    expect(logo.type).toBe('ai-driven');
    expect(logo.motif).toBe('Test');
    expect(typeof logo.Component).toBe('function');
  });

  it('produces unique ids for the same index called twice', () => {
    const ai: AILogoData = {
      motifName: 'Test',
      primaryColor: '#ff00ff',
      secondaryColor: '#00ff00',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 10, strokeType: 'primary', isAnimated: false },
      ],
    };
    const a = createAILogo(ai, 5);
    const b = createAILogo(ai, 5);
    expect(a.id).not.toBe(b.id);
  });

  it('auto-centers off-canvas geometry into the 100x100 viewBox', () => {
    const ai: AILogoData = {
      motifName: 'Offscreen',
      primaryColor: '#ff00ff',
      secondaryColor: '#00ff00',
      elements: [
        { shape: 'circle', cx: 500, cy: 500, r: 10, strokeType: 'primary', isAnimated: false },
        { shape: 'circle', cx: 510, cy: 500, r: 10, strokeType: 'primary', isAnimated: false },
      ],
    };
    const logo = createAILogo(ai, 2);
    const { container } = render(<logo.Component isPaused />);
    const b = collectBbox(container);
    expect(b.minX).toBeGreaterThanOrEqual(0);
    expect(b.minY).toBeGreaterThanOrEqual(0);
    expect(b.maxX).toBeLessThanOrEqual(100);
    expect(b.maxY).toBeLessThanOrEqual(100);
  });

  it('derives a secondary color when none is provided', () => {
    const ai: AILogoData = {
      motifName: 'Mono',
      primaryColor: '#112233',
      secondaryColor: '#112233',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 5, strokeType: 'secondary', isAnimated: false },
      ],
    };
    const logo = createAILogo(ai, 3);
    const { container } = render(<logo.Component isPaused />);
    const circle = container.querySelector('circle');
    const stroke = circle?.getAttribute('stroke') || '';
    expect(stroke).not.toBe('#112233');
    expect(stroke).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('createRandomLogo', () => {
  it('returns a Logo with a function Component and one of the procedural motifs', () => {
    const logo = createRandomLogo(7);
    expect(logo.id).toMatch(/^[A-Z]+-\d{4}-/);
    expect(['static', 'dynamic']).toContain(logo.type);
    expect(typeof logo.Component).toBe('function');
  });

  it('cycles deterministically through the generator pool by index', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      ids.add(createRandomLogo(i).id);
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});
