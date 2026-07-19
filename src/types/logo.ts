/**
 * @file logo.ts
 * @description Shared TypeScript interfaces for the Logo domain.
 *
 * @features
 * - `Logo` — full logo object with id, type, motif, and component
 * - `LogoType` — union type for logo categories (static, dynamic, ai-driven)
 * - `LogoElement` — SVG element descriptor for AI-generated logos
 * - `AILogoData` — AI generation response shape
 * - `ThemeColors` — color palette constants shape
 */
export type LogoType = 'static' | 'dynamic' | 'ai-driven';

export interface Logo {
  id: string;
  type: LogoType;
  motif: string;
  Component: React.ComponentType<{ isPaused: boolean }>;
}

export interface LogoElement {
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

export interface AILogoData {
  motifName: string;
  primaryColor: string;
  secondaryColor: string;
  elements: LogoElement[];
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accentGold: string;
  accentNeon: string;
  accentWhite: string;
}
