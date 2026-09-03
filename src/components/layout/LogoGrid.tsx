/**
 * @file LogoGrid.tsx
 * @description Dumb, animated presentational component rendering a grid of LogoCards.
 *
 * @features
 * - Responsive grid layout (1–5 columns based on viewport)
 * - Layout animations via framer-motion `motion.div` + `AnimatePresence`
 * - Maps over `logos` and renders each as a `LogoCard`
 * - No store access — logos and callbacks received via props
 *
 * @dependencies framer-motion, LogoCard
 */
import { motion, AnimatePresence } from 'framer-motion';
import type { Logo } from '../../types/logo';
import { LogoCard } from '../LogoCard';

interface LogoGridProps {
  logos: Logo[];
  onDownloadPNG: (svg: string, motif: string, id: string) => void;
}

export const LogoGrid = ({ logos, onDownloadPNG }: LogoGridProps) => (
  <motion.div
    layout
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  >
    <AnimatePresence mode="popLayout">
      {logos.map((logo) => (
        <LogoCard key={logo.id} logo={logo} onDownloadPNG={onDownloadPNG} />
      ))}
    </AnimatePresence>
  </motion.div>
);
