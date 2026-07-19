/**
 * @file Header.tsx
 * @description Top app chrome for Logomaro — brand mark, title, live-gen timer, and filter tabs.
 *
 * @features
 * - Renders the latest generated logo as the app brand mark
 * - Shows app title `Logomaro` with live generation countdown
 * - Provides filter tabs for logo categories
 *
 * @dependencies lucide-react, framer-motion, useLogoStore (Zustand)
 * @sideEffects None
 */
import { Activity, Grid, BarChart2, Sparkles, Wand2 } from 'lucide-react';
import { useLogoStore } from '../../stores/useLogoStore';
import { THEME } from '../../utils/theme';
import type { LogoType } from '../../types/logo';
import { LogoMark } from './LogoMark';

interface HeaderProps {
  timeUntilNext: number;
}

const FILTER_TABS: { id: LogoType | 'all'; label: string; icon: typeof Grid }[] = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'static', label: 'Static', icon: BarChart2 },
  { id: 'dynamic', label: 'Dynamic', icon: Sparkles },
  { id: 'ai-driven', label: 'AI Gen', icon: Wand2 },
];

export const Header = ({ timeUntilNext }: HeaderProps) => {
  const logos = useLogoStore((s) => s.logos);
  const filter = useLogoStore((s) => s.filter);
  const setFilter = useLogoStore((s) => s.setFilter);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md bg-[#110e0d]/80 border-b ${THEME.border} px-8 py-6`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8">
            <LogoMark latestLogo={logos[0]} hasLogos={logos.length > 0} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className={`text-xl font-bold tracking-[0.2em] ${THEME.textPrimary} uppercase`}
              >
                Logomaro
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] text-[9px] font-mono tracking-widest uppercase">
                <Activity size={10} /> Live Gen Engine: {timeUntilNext.toFixed(1)}s
              </span>
            </div>
            <p
              className={`font-mono text-[10px] tracking-widest ${THEME.textSecondary} uppercase mt-1`}
            >
              Brand Mark Exploration &bull; New Logo every 5 sec
            </p>
          </div>
        </div>

        <div className="flex bg-[#1a1614] rounded-lg p-1 border border-[#2f2723]">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs font-mono tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#2f2723] text-[#e8e3df] shadow-sm'
                    : 'text-[#8c7a70] hover:text-[#e8e3df] hover:bg-[#2f2723]/50'
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isActive
                      ? tab.id === 'dynamic'
                        ? 'text-[#00ff9d]'
                        : tab.id === 'ai-driven'
                          ? 'text-[#b829ff]'
                          : 'text-[#d4af37]'
                      : ''
                  }
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
