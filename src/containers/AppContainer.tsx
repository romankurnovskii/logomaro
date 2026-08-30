/**
 * @file AppContainer.tsx
 * @description Smart container that wires logo store state and AI generation to the App UI.
 *
 * @features
 * - Subscribes to useLogoStore for logos, filter, timer, AI state
 * - Manages auto-generation timer via requestAnimationFrame
 * - Handles AI generation via Puter.js
 * - Renders header, filter tabs, AI input, logo grid, and footer
 *
 * @dependencies useLogoStore (Zustand), LogoCard, framer-motion, lucide-react
 * @sideEffects Injects Puter.js script on mount; calls Puter AI API on generate
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2, X } from 'lucide-react';
import { useLogoStore } from '../stores/useLogoStore';
import { LogoCard } from '../components/LogoCard';
import { THEME } from '../utils/theme';
import { createAILogo } from '../utils/logoGenerators';
import { renderToString } from 'react-dom/server';
import { Header } from '../components/layout/Header';
import { svgStringToPngBlob } from '../utils/svgToPng';

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string) => Promise<{ message?: { content: string } } | string>;
      };
    };
  }
}

export const AppContainer = () => {
  const {
    logos,
    filter,
    aiInput,
    isGeneratingAI,
    timeUntilNext,
    addLogo,
    setFilter,
    setAiInput,
    setIsGeneratingAI,
    tickTimer,
    totalGeneratedCount,
  } = useLogoStore();

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const totalCountRef = useRef(totalGeneratedCount);

  const [modalLogo, setModalLogo] = useState<{
    svg: string;
    motif: string;
    id: string;
  } | null>(null);
  const [modalBgColor, setModalBgColor] = useState<string>('#ffffff');
  const [modalIsTransparent, setModalIsTransparent] = useState<boolean>(true);
  const [modalDownloading, setModalDownloading] = useState(false);

  // Sync ref with store
  useEffect(() => {
    totalCountRef.current = totalGeneratedCount;
  }, [totalGeneratedCount]);

  // Auto-generation timer
  useEffect(() => {
    const animateTimer = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = (time - previousTimeRef.current) / 1000;
        tickTimer(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateTimer);
    };

    requestRef.current = requestAnimationFrame(animateTimer);
    return () => cancelAnimationFrame(requestRef.current);
  }, [tickTimer]);

  // Inject Puter.js script
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('puter-script')) {
      const script = document.createElement('script');
      script.id = 'puter-script';
      script.src = 'https://js.puter.com/v2/';
      document.head.appendChild(script);
    }
  }, []);

  const handleAIGenerate = useCallback(async () => {
    if (!aiInput.trim() || isGeneratingAI) return;
    setIsGeneratingAI(true);

    try {
      if (!window.puter) {
        throw new Error(
          'Puter.js is not fully loaded yet. Please try again in a few seconds.'
        );
      }

      const prompt = `You are a strict JSON-only API. Generate a minimalist, institutional-grade DeFi logo consisting of simple SVG paths/shapes fitting strictly inside a 100x100 viewBox. 
      User Prompt: "${aiInput}". 
      
      Guidelines:
      - Keep it abstract, highly geometric, and sleek.
      - Use ONLY coordinates between 0 and 100.
      - Output strictly a JSON object. NO Markdown, NO backticks, NO conversational text.

      Required JSON Schema:
      {
        "motifName": "String (1-2 words)",
        "primaryColor": "String (e.g. #D4AF37, #00FF9D, #FFFFFF)",
        "secondaryColor": "String (e.g. #8c7a70)",
        "elements": [
          {
            "shape": "path | circle | polygon | rect",
            "d": "String (Required for path, e.g. M10 10 L50 90 L90 10)",
            "cx": Number (Required for circle),
            "cy": Number (Required for circle),
            "r": Number (Required for circle),
            "points": "String (Required for polygon, e.g. 10,10 50,90 90,10)",
            "x": Number (Required for rect),
            "y": Number (Required for rect),
            "width": Number (Required for rect),
            "height": Number (Required for rect),
            "strokeType": "primary | secondary",
            "isAnimated": Boolean
          }
        ]
      }`;

      const response = await window.puter.ai.chat(prompt);
      const jsonText =
        typeof response === 'string'
          ? response
          : (response as { message?: { content: string } })?.message?.content ||
            String(response);

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return a valid JSON structure.');
      }

      const aiData = JSON.parse(jsonMatch[0]);
      totalCountRef.current += 1;
      const newAILogo = createAILogo(aiData, totalCountRef.current);
      addLogo(newAILogo);
      setAiInput('');
      setFilter('ai-driven');
    } catch (error) {
      console.error('AI Generation failed:', error);
      alert(`AI Generation Failed: ${(error as Error).message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [aiInput, isGeneratingAI, addLogo, setAiInput, setFilter, setIsGeneratingAI]);

  const handleOpenDownloadModal = useCallback((svg: string, motif: string, id: string) => {
    setModalLogo({ svg, motif, id });
    setModalIsTransparent(true);
    setModalBgColor('#ffffff');
  }, []);

  const handleCloseDownloadModal = useCallback(() => {
    setModalLogo(null);
  }, []);

  const handleModalDownload = useCallback(async () => {
    if (!modalLogo) return;

    setModalDownloading(true);
    try {
      const filename = `${modalLogo.motif}-${modalLogo.id}.png`;
      const colorToUse = modalIsTransparent ? undefined : modalBgColor;
      const pngBlob = await svgStringToPngBlob(modalLogo.svg, 2048, 2048, colorToUse);

      const downloadUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setModalLogo(null);
    } catch (error) {
      console.error('Failed to download PNG:', error);
    } finally {
      setModalDownloading(false);
    }
  }, [modalLogo, modalIsTransparent, modalBgColor]);

  // Update favicon with the latest logo whenever logos change
  useEffect(() => {
    if (!logos.length) return;
    const LatestComponent = logos[0].Component;
    try {
      const svgString = renderToString(<LatestComponent isPaused={true} />);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (favicon) {
        favicon.href = url;
        return () => URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('Failed to update favicon:', e);
    }
  }, [logos]);

  const filteredLogos = logos.filter((logo) => {
    if (filter === 'all') return true;
    return logo.type === filter;
  });

  return (
    <div
      className={`min-h-screen ${THEME.bg} font-sans selection:bg-[#00ff9d] selection:text-black overflow-x-hidden`}
    >
      {/* Background Grid Accent */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header & Navigation */}
      <Header timeUntilNext={timeUntilNext} />

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* AI Input Bar */}
        <div className="mb-10 bg-[#1a1614] border border-[#2f2723] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-lg shadow-black/20">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Wand2
                size={16}
                className={isGeneratingAI ? 'text-[#b829ff] animate-pulse' : 'text-[#8c7a70]'}
              />
            </div>
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              placeholder="Enter words to steer AI synthesis (e.g., 'solana monkey, cyber crescent, golden ratio')..."
              className="w-full bg-[#110e0d] border border-[#2f2723] text-[#e8e3df] text-sm rounded-lg focus:ring-[#b829ff] focus:border-[#b829ff] block pl-11 p-3 placeholder-[#4a403a] transition-all outline-none"
              disabled={isGeneratingAI}
            />
          </div>
          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI || !aiInput.trim()}
            className={`w-full md:w-auto px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-mono text-xs tracking-wider transition-all duration-300 ${
              isGeneratingAI || !aiInput.trim()
                ? 'bg-[#2f2723] text-[#8c7a70] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#b829ff]/20 to-[#00ff9d]/20 border border-[#b829ff]/50 text-[#e8e3df] hover:border-[#00ff9d]/80'
            }`}
          >
            {isGeneratingAI ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#b829ff]" />
                SYNTHESIZING...
              </>
            ) : (
              <>
                <Wand2 size={16} className="text-[#b829ff]" />
                GENERATE
              </>
            )}
          </button>
        </div>

        {/* Section Header */}
        <div className="mb-8 flex justify-between items-end border-b border-[#2f2723] pb-4">
          <div>
            <h2 className={`text-2xl font-light tracking-wide ${THEME.textPrimary}`}>
              {filter === 'all'
                ? 'Complete Matrix'
                : filter === 'static'
                  ? 'Static Iterations'
                  : 'Dynamic Iterations'}
            </h2>
            <p
              className={`font-mono text-[11px] ${THEME.textSecondary} mt-2 flex flex-wrap items-center gap-2`}
            >
              <span>
                DISPLAYING {String(filteredLogos.length).padStart(3, '0')} HIGH-FIDELITY PATHS
              </span>
              <span className="hidden sm:inline text-[#4a403a]">|</span>
              <span className="text-[#00ff9d]">MEMORY BUFFER: {logos.length}/500</span>
            </p>
          </div>
          <div
            className={`font-mono text-[10px] ${THEME.textSecondary} flex gap-4 hidden sm:flex`}
          >
            <span>T-SPACE: #1A1614</span>
            <span>GOLD: #D4AF37</span>
            <span>NEON: #00FF9D</span>
          </div>
        </div>

        {/* Logo Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredLogos.map((logo) => (
              <LogoCard key={logo.id} logo={logo} onDownloadPNG={handleOpenDownloadModal} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer Specs */}
      <footer className="w-full border-t border-[#2f2723] py-6 text-center mt-12">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[#8c7a70]">
            Logo for Crypto // DEFI | Minimalistic | AI Generated // BUILD 3.4.1
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/romankurnovskii/logomaro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8c7a70] hover:text-[#e8e3df] transition-colors"
              aria-label="GitHub"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href="https://x.com/hashtag/logomaro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8c7a70] hover:text-[#e8e3df] transition-colors"
              aria-label="X / Twitter"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Download Modal */}
      {modalLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseDownloadModal}
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
              onClick={handleCloseDownloadModal}
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
              style={{ backgroundColor: modalIsTransparent ? 'transparent' : modalBgColor }}
            >
              {modalIsTransparent && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'repeating-conic-gradient(#3a302c 0 25%, transparent 0 50%) 50% / 8px 8px',
                  }}
                />
              )}
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  dangerouslySetInnerHTML={{
                    __html: modalLogo.svg,
                  }}
                />
              </div>
            </div>

            {/* Color Controls */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 font-mono text-[11px] uppercase text-[#e8e3df] cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalIsTransparent}
                  onChange={(e) => setModalIsTransparent(e.target.checked)}
                  className="w-4 h-4 border border-[#4a403a] rounded bg-[#110e0d] text-[#00ff9d] focus:ring-2 focus:ring-[#00ff9d]"
                />
                Transparent background
              </label>

              {!modalIsTransparent && (
                <div>
                  <label className="block font-mono text-[11px] uppercase text-[#8c7a70] mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={modalBgColor}
                    onChange={(e) => setModalBgColor(e.target.value)}
                    className="w-full h-10 p-0 border border-[#4a403a] rounded bg-transparent cursor-pointer"
                    style={{ padding: 0 }}
                  />
                  <div className="flex gap-2 mt-2">
                    {[
                      '#ffffff',
                      '#110e0d',
                      '#000000',
                      '#00ff9d',
                      '#b829ff',
                      '#d4af37',
                      '#ff6b35',
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setModalBgColor(color)}
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
                onClick={handleModalDownload}
                disabled={modalDownloading}
                className="w-full py-3 px-4 rounded-lg font-mono text-sm uppercase tracking-wider text-[#110e0d] bg-[#e8e3df] hover:bg-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {modalDownloading ? 'Preparing...' : 'Download PNG (2048×2048)'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
