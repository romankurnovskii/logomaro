/**
 * @file theme.ts
 * @description Color palette and theme constants for the Logomaro app.
 *
 * @features
 * - Defines THEME object with all color tokens
 * - Exports DYNAMIC_SPEED constant for animation durations
 */
import type { ThemeColors } from '../types/logo';

export const THEME: ThemeColors = {
  bg: 'bg-[#110e0d]',
  surface: 'bg-[#1a1614]',
  surfaceHover: 'hover:bg-[#221c19]',
  border: 'border-[#2f2723]',
  textPrimary: 'text-[#e8e3df]',
  textSecondary: 'text-[#8c7a70]',
  accentGold: '#d4af37',
  accentNeon: '#00ff9d',
  accentWhite: '#ffffff',
};

export const DYNAMIC_SPEED = 3;
