/**
 * @file AIInputBar.tsx
 * @description Dumb UI component for the AI synthesis input bar and generate button.
 *
 * @features
 * - Renders a text input bound to `aiInput` with placeholder guidance
 * - Shows `Wand2` icon, pulses while generating
 * - Generate button with loading spinner state
 * - All data and callbacks received via props — no store access
 *
 * @dependencies lucide-react
 */
import { Loader2, Wand2 } from 'lucide-react';

interface AIInputBarProps {
  aiInput: string;
  isGeneratingAI: boolean;
  onAiInputChange: (value: string) => void;
  onGenerate: () => void;
}

export const AIInputBar = ({
  aiInput,
  isGeneratingAI,
  onAiInputChange,
  onGenerate,
}: AIInputBarProps) => (
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
        onChange={(e) => onAiInputChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
        placeholder="Enter words to steer AI synthesis (e.g., 'solana monkey, cyber crescent, golden ratio')..."
        className="w-full bg-[#110e0d] border border-[#2f2723] text-[#e8e3df] text-sm rounded-lg focus:ring-[#b829ff] focus:border-[#b829ff] block pl-11 p-3 placeholder-[#4a403a] transition-all outline-none"
        disabled={isGeneratingAI}
      />
    </div>
    <button
      onClick={onGenerate}
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
);
