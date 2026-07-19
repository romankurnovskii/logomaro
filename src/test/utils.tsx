/**
 * @file utils.tsx
 * @description Custom render helpers and mock utilities for Vitest.
 *
 * @features
 * - Custom `render` wrapper around React Testing Library
 * - `createMockFunction` helper for vi.fn() factories
 */
import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render function that includes providers if needed
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, {
    ...options,
  });
};

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };

// Helper to create mock functions
export const createMockFunction = <T extends (...args: unknown[]) => unknown>(
  returnValue?: ReturnType<T>
) => {
  return vi.fn(() => returnValue) as unknown as T;
};
