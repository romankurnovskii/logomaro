/**
 * @file index.ts
 * @description Assembles all logo data into the initial ALL_LOGOS array.
 *
 * @features
 * - Combines StaticMonkeys, StaticBananas, and DynamicLogos
 * - Assigns IDs, types, and motifs to each logo entry
 */
import type { Logo } from '../types/logo';
import { StaticMonkeys } from './staticMonkeys';
import { StaticBananas } from './staticBananas';
import { DynamicLogos } from './dynamicLogos';

export const ALL_LOGOS: Logo[] = [
  ...StaticMonkeys.map((Comp, i) => ({
    id: `S-MNK-${i + 1}`,
    type: 'static' as const,
    motif: 'Monkey',
    Component: Comp,
  })),
  ...StaticBananas.map((Comp, i) => ({
    id: `S-BAN-${i + 1}`,
    type: 'static' as const,
    motif: 'Banana',
    Component: Comp,
  })),
  ...DynamicLogos.slice(0, 5).map((Comp, i) => ({
    id: `D-MNK-${i + 1}`,
    type: 'dynamic' as const,
    motif: 'Monkey',
    Component: Comp,
  })),
  ...DynamicLogos.slice(5, 10).map((Comp, i) => ({
    id: `D-BAN-${i + 1}`,
    type: 'dynamic' as const,
    motif: 'Banana',
    Component: Comp,
  })),
];
