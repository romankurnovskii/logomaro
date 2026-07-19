/**
 * @file useLogoStore.ts
 * @description Zustand store managing logo state, auto-generation timer, and AI generation.
 *
 * @features
 * - Holds `logos`, `filter`, `aiInput`, `isGeneratingAI`, `timeUntilNext` state
 * - Exposes `addLogo`, `setFilter`, `setAiInput`, `setIsGeneratingAI`, `tickTimer` actions
 * - Manages auto-generation counter via `totalGeneratedCount`
 *
 * @dependencies Zustand
 */
import { create } from 'zustand';
import type { Logo, LogoType } from '../types/logo';
import { ALL_LOGOS } from '../data';
import { createRandomLogo } from '../utils/logoGenerators';

interface LogoStore {
  logos: Logo[];
  filter: LogoType | 'all';
  aiInput: string;
  isGeneratingAI: boolean;
  timeUntilNext: number;
  totalGeneratedCount: number;
  addLogo: (logo: Logo) => void;
  setFilter: (filter: LogoType | 'all') => void;
  setAiInput: (input: string) => void;
  setIsGeneratingAI: (val: boolean) => void;
  tickTimer: (delta: number) => void;
  generateRandomLogo: () => void;
}

export const useLogoStore = create<LogoStore>((set, get) => ({
  logos: ALL_LOGOS,
  filter: 'all',
  aiInput: '',
  isGeneratingAI: false,
  timeUntilNext: 5.0,
  totalGeneratedCount: ALL_LOGOS.length,

  addLogo: (logo) =>
    set((state) => {
      const updated = [logo, ...state.logos];
      return { logos: updated.length > 500 ? updated.slice(0, 500) : updated };
    }),

  setFilter: (filter) => set({ filter }),

  setAiInput: (aiInput) => set({ aiInput }),

  setIsGeneratingAI: (isGeneratingAI) => set({ isGeneratingAI }),

  tickTimer: (delta) =>
    set((state) => {
      const newTime = state.timeUntilNext - delta;
      if (newTime <= 0) {
        const count = state.totalGeneratedCount + 1;
        const newLogo = createRandomLogo(count);
        const updated = [newLogo, ...state.logos];
        return {
          timeUntilNext: 5.0,
          totalGeneratedCount: count,
          logos: updated.length > 500 ? updated.slice(0, 500) : updated,
        };
      }
      return { timeUntilNext: newTime };
    }),

  generateRandomLogo: () => {
    const state = get();
    const count = state.totalGeneratedCount + 1;
    const newLogo = createRandomLogo(count);
    const updated = [newLogo, ...state.logos];
    set({
      totalGeneratedCount: count,
      logos: updated.length > 500 ? updated.slice(0, 500) : updated,
      timeUntilNext: 5.0,
    });
  },
}));
