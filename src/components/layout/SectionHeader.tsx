/**
 * @file SectionHeader.tsx
 * @description Dumb UI component rendering the logo-matrix section header and metadata strip.
 *
 * @features
 * - Displays a section title derived from the active `filter`
 * - Shows a padded count of displayed logos and the memory buffer usage
 * - Renders a color-spec strip (T-SPACE, GOLD, NEON) for terminal aesthetics
 * - No store access — all values received via props
 */
import type { LogoType } from '../../types/logo';
import { THEME } from '../../utils/theme';

interface SectionHeaderProps {
  filter: LogoType | 'all';
  displayedCount: number;
  totalCount: number;
}

const SECTION_TITLES: Record<LogoType | 'all', string> = {
  all: 'Complete Matrix',
  static: 'Static Iterations',
  dynamic: 'Dynamic Iterations',
  'ai-driven': 'AI-Synthesized',
};

export const SectionHeader = ({ filter, displayedCount, totalCount }: SectionHeaderProps) => (
  <div className="mb-8 flex justify-between items-end border-b border-[#2f2723] pb-4">
    <div>
      <h2 className={`text-2xl font-light tracking-wide ${THEME.textPrimary}`}>
        {SECTION_TITLES[filter]}
      </h2>
      <p
        className={`font-mono text-[11px] ${THEME.textSecondary} mt-2 flex flex-wrap items-center gap-2`}
      >
        <span>DISPLAYING {String(displayedCount).padStart(3, '0')} HIGH-FIDELITY PATHS</span>
        <span className="hidden sm:inline text-[#4a403a]">|</span>
        <span className="text-[#00ff9d]">MEMORY BUFFER: {totalCount}/500</span>
      </p>
    </div>
    <div className={`font-mono text-[10px] ${THEME.textSecondary} flex gap-4 hidden sm:flex`}>
      <span>T-SPACE: #1A1614</span>
      <span>GOLD: #D4AF37</span>
      <span>NEON: #00FF9D</span>
    </div>
  </div>
);
