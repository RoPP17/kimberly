import React from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function TopObservatoryBar({ isPlaying, onToggleAudio }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none px-4 pt-3 sm:px-8 sm:pt-5">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {/* Subtle romantic brand badge */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#06070D]/75 px-3.5 py-1.5 backdrop-blur-md border border-[#E8C391]/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8C391] animate-pulse" />
          <span className="font-mono-tech text-[10px] tracking-[0.22em] text-[#E8C391] uppercase">
            Para Kimberly
          </span>
        </div>

        {/* Music Player Button: Sui Generis — Quizás, Porque */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onToggleAudio}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
            className={`group flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs backdrop-blur-md transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
              isPlaying
                ? 'bg-[#141026]/90 border border-[#E8C391]/40 text-[#F4EFEA] hover:border-[#E8C391]/70'
                : 'bg-[#06070D]/80 border border-[#E8C391]/20 text-[#9A96AD] hover:border-[#E8C391]/40 hover:text-[#F4EFEA]'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="h-3.5 w-3.5 text-[#E8C391] shrink-0 animate-pulse" />
            ) : (
              <Music className="h-3.5 w-3.5 text-[#9A96AD] group-hover:text-[#E8C391] shrink-0" />
            )}

            <span className="font-mono-tech text-[10px] tracking-[0.14em] text-[#F4EFEA]/90">
              <span className="sm:hidden">Sui Generis</span>
              <span className="hidden sm:inline">Sui Generis — Quizás, Porque</span>
            </span>

            {isPlaying ? (
              <span className="flex h-2 items-center gap-0.5">
                <span className="h-1.5 w-0.5 bg-[#E8C391] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2.5 w-0.5 bg-[#E8C391] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-0.5 bg-[#E8C391] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : (
              <span className="text-[9px] font-mono-tech text-[#E8C391]/80 uppercase">
                Toca para oír
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
