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
import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { useLogoStore } from '../stores/useLogoStore';
import { LogoCard } from '../components/LogoCard';
import { THEME } from '../utils/theme';
import { createAILogo } from '../utils/logoGenerators';
import { renderToString } from 'react-dom/server';
import { Header } from '../components/layout/Header';

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
              <LogoCard key={logo.id} logo={logo} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer Specs */}
      <footer className="w-full border-t border-[#2f2723] py-6 text-center mt-12">
        <span className="font-mono text-[10px] tracking-widest text-[#8c7a70]">
          Logo for Crypto // DEFI | Minimalistic | AI Generated // BUILD 3.4.1
        </span>
      </footer>
    </div>
  );
};
