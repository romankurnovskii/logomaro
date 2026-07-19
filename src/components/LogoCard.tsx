/**
 * @file LogoCard.tsx
 * @description Presentational card component for displaying a single logo.
 *
 * @features
 * - Renders logo SVG with ID badge and type label
 * - Hover overlay with Copy SVG and Pause/Play controls
 * - Animated entrance/exit via framer-motion
 */
import { useState, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Pause, Play, Check } from 'lucide-react';
import type { Logo } from '../types/logo';
import { THEME } from '../utils/theme';

interface LogoCardProps {
  logo: Logo;
}

export const LogoCard = forwardRef<HTMLDivElement, LogoCardProps>(({ logo }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (svgRef.current) {
      const svgHTML = svgRef.current.querySelector('svg')?.outerHTML;
      if (svgHTML) {
        navigator.clipboard.writeText(svgHTML);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group flex flex-col items-center p-6 rounded-2xl ${THEME.surface} ${THEME.border} border transition-colors duration-300 ${THEME.surfaceHover}`}
    >
      {/* Top Metrics Row */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="font-mono text-[10px] tracking-widest text-[#8c7a70] uppercase">
          {logo.id}
        </span>
        <span
          className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-sm border ${
            logo.type === 'dynamic'
              ? 'border-[#00ff9d]/30 text-[#00ff9d]'
              : logo.type === 'ai-driven'
                ? 'border-[#b829ff]/50 text-[#b829ff]'
                : 'border-[#d4af37]/30 text-[#d4af37]'
          }`}
        >
          {logo.type}
        </span>
      </div>

      {/* SVG Container */}
      <div className="w-24 h-24 mb-6 relative" ref={svgRef}>
        <logo.Component isPaused={isPaused} />
      </div>

      {/* Bottom Label */}
      <div className="w-full flex justify-center border-t border-[#2f2723] pt-4">
        <span className={`font-mono text-xs tracking-wider uppercase ${THEME.textPrimary}`}>
          {logo.motif} Concept
        </span>
      </div>

      {/* Hover Actions Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#110e0d]/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center gap-4 border border-[#4a403a]/50"
          >
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-3 rounded-full hover:bg-[#2f2723] transition-colors text-[#e8e3df]"
              title="Copy SVG"
            >
              {copied ? <Check size={18} className="text-[#00ff9d]" /> : <Copy size={18} />}
              <span className="font-mono text-[9px] mt-1 tracking-wider uppercase">Copy</span>
            </button>

            {logo.type === 'dynamic' && (
              <button
                onClick={togglePause}
                className="flex flex-col items-center justify-center p-3 rounded-full hover:bg-[#2f2723] transition-colors text-[#e8e3df]"
                title={isPaused ? 'Play Animation' : 'Pause Animation'}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                <span className="font-mono text-[9px] mt-1 tracking-wider uppercase">
                  {isPaused ? 'Play' : 'Pause'}
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
LogoCard.displayName = 'LogoCard';
