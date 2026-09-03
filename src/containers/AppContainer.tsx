/**
 * @file AppContainer.tsx
 * @description Smart container that wires logo store state and AI generation to the App UI.
 *
 * @features
 * - Subscribes to useLogoStore for logos, filter, timer, AI state
 * - Manages auto-generation timer via requestAnimationFrame
 * - Handles AI generation via Puter.js
 * - Manages DownloadModal state (logo, bg color, transparency, downloading)
 * - Updates favicon with the latest logo whenever logos change
 * - Delegates all rendering to presentational components (AIInputBar, SectionHeader, LogoGrid, DownloadModal, Footer)
 *
 * @dependencies useLogoStore (Zustand), createAILogo, svgStringToPngBlob, Header, framer-motion
 * @sideEffects Injects Puter.js script on mount; calls Puter AI API on generate; writes favicon href
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useLogoStore } from '../stores/useLogoStore';
import { Header } from '../components/layout/Header';
import { THEME } from '../utils/theme';
import { createAILogo } from '../utils/logoGenerators';
import { callAiLogoModel, geometrySignature } from '../utils/aiLogoGenerator';
import { renderToString } from 'react-dom/server';
import { svgStringToPngBlob } from '../utils/svgToPng';
import { AIInputBar } from '../components/layout/AIInputBar';
import { SectionHeader } from '../components/layout/SectionHeader';
import { LogoGrid } from '../components/layout/LogoGrid';
import { Footer } from '../components/layout/Footer';
import { DownloadModal, type ModalLogo } from '../components/layout/DownloadModal';

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            temperature?: number;
            max_tokens?: number;
          }
        ) => Promise<{ message?: { content: string } } | string>;
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
  const [modalLogo, setModalLogo] = useState<ModalLogo | null>(null);
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

  const AI_GENERATION_COUNT = 5;

  const handleAIGenerate = useCallback(async () => {
    if (!aiInput.trim() || isGeneratingAI) return;
    setIsGeneratingAI(true);

    const userPrompt = aiInput.trim();
    const errors: string[] = [];
    let successCount = 0;
    const seenMotifs = new Set<string>();
    const seenSignatures = new Set<string>();

    try {
      if (!window.puter) {
        throw new Error(
          'Puter.js is not fully loaded yet. Please try again in a few seconds.'
        );
      }

      const chat = (
        messages: Array<{ role: string; content: string }>,
        options?: { model?: string; temperature?: number; max_tokens?: number }
      ) => window.puter!.ai.chat(messages, options);

      for (let i = 0; i < AI_GENERATION_COUNT; i++) {
        try {
          const validated = await callAiLogoModel(
            userPrompt,
            i,
            chat,
            Date.now() + i * 9973 + Math.floor(Math.random() * 1_000_000)
          );

          const motifKey = validated.motifName.toLowerCase();
          if (seenMotifs.has(motifKey)) {
            throw new Error(`Duplicate motif "${validated.motifName}" — skipped.`);
          }
          const signature = geometrySignature(validated);
          if (seenSignatures.has(signature)) {
            throw new Error('Duplicate geometry — skipped.');
          }
          seenMotifs.add(motifKey);
          seenSignatures.add(signature);

          totalCountRef.current += 1;
          const newAILogo = createAILogo(validated, totalCountRef.current);
          addLogo(newAILogo);
          successCount += 1;
        } catch (callError) {
          const message = (callError as Error).message || String(callError);
          errors.push(`Variation ${i + 1}: ${message}`);
          console.error(`AI Generation variation ${i + 1} failed:`, callError);
        }
      }

      setAiInput('');
      setFilter('ai-driven');

      if (successCount === 0) {
        alert(`AI Generation Failed:\n${errors.join('\n')}`);
      } else if (errors.length > 0) {
        console.warn(
          `Generated ${successCount}/${AI_GENERATION_COUNT} logos. Failures:\n${errors.join('\n')}`
        );
      }
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
        <AIInputBar
          aiInput={aiInput}
          isGeneratingAI={isGeneratingAI}
          onAiInputChange={setAiInput}
          onGenerate={handleAIGenerate}
        />

        {/* Section Header */}
        <SectionHeader
          filter={filter}
          displayedCount={filteredLogos.length}
          totalCount={logos.length}
        />

        {/* Logo Grid */}
        <LogoGrid logos={filteredLogos} onDownloadPNG={handleOpenDownloadModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Download Modal */}
      <DownloadModal
        logo={modalLogo}
        bgColor={modalBgColor}
        isTransparent={modalIsTransparent}
        isDownloading={modalDownloading}
        onClose={handleCloseDownloadModal}
        onDownload={handleModalDownload}
        onBgColorChange={setModalBgColor}
        onTransparentChange={setModalIsTransparent}
      />
    </div>
  );
};
