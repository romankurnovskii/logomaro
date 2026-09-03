/**
 * @file DownloadModal.tsx
 * @description Dumb, animated modal component for previewing and downloading a logo as a 2048x2048 PNG.
 *
 * @features
 * - Modal overlay with click-to-close backdrop and escape-stops-propagation content
 * - SVG preview rendered into a configurable background canvas
 * - Toggle between transparent and solid background colors
 * - Color swatch palette for quick background selection
 * - Download button with preparing/disabled states
 * - No store access — logo state and callbacks received via props
 *
 * @dependencies framer-motion, lucide-react
 */
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalLogo {
  svg: string;
  motif: string;
  id: string;
}

const BG_COLOR_PRESETS = [
  '#ffffff',
  '#110e0d',
  '#000000',
  '#00ff9d',
  '#b829ff',
  '#d4af37',
  '#ff6b35',
];

interface DownloadModalProps {
  logo: ModalLogo | null;
  bgColor: string;
  isTransparent: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
  onBgColorChange: (color: string) => void;
  onTransparentChange: (checked: boolean) => void;
}

export const DownloadModal = ({
  logo,
  bgColor,
  isTransparent,
  isDownloading,
  onClose,
  onDownload,
  onBgColorChange,
  onTransparentChange,
}: DownloadModalProps) => {
  if (!logo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#1a1512] rounded-2xl border border-[#4a403a] p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-[#2f2723] text-[#e8e3df]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2
          id="modal-title"
          className="font-mono text-sm tracking-wider uppercase text-[#e8e3df] mb-4 text-center"
        >
          Download PNG
        </h2>

        {/* Preview */}
        <div
          className="w-48 h-48 mb-6 relative mx-auto"
          style={{ backgroundColor: isTransparent ? 'transparent' : bgColor }}
        >
          {isTransparent && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'repeating-conic-gradient(#3a302c 0 25%, transparent 0 50%) 50% / 8px 8px',
              }}
            />
          )}
          <div className="relative w-full h-full flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: logo.svg }} />
          </div>
        </div>

        {/* Color Controls */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 font-mono text-[11px] uppercase text-[#e8e3df] cursor-pointer">
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => onTransparentChange(e.target.checked)}
              className="w-4 h-4 border border-[#4a403a] rounded bg-[#110e0d] text-[#00ff9d] focus:ring-2 focus:ring-[#00ff9d]"
            />
            Transparent background
          </label>

          {!isTransparent && (
            <div>
              <label className="block font-mono text-[11px] uppercase text-[#8c7a70] mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => onBgColorChange(e.target.value)}
                className="w-full h-10 p-0 border border-[#4a403a] rounded bg-transparent cursor-pointer"
                style={{ padding: 0 }}
              />
              <div className="flex gap-2 mt-2">
                {BG_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onBgColorChange(color)}
                    className="w-8 h-8 rounded border-2 border-transparent hover:border-white transition-colors"
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full py-3 px-4 rounded-lg font-mono text-sm uppercase tracking-wider text-[#110e0d] bg-[#e8e3df] hover:bg-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? 'Preparing...' : 'Download PNG (2048×2048)'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
