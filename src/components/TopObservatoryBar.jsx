import React from 'react';
import { Volume2, VolumeX, Sparkles, Music } from 'lucide-react';

export default function TopObservatoryBar({
  omega,
  telemetryTag,
  audioMode,
  onCycleAudio,
  onMuteAudio,
}) {
  const formattedOmega =
    omega <= 0
      ? '0.000 rad/s · CONTIGO'
      : `${omega.toString().padStart(3, '0')}.4 rad/s`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none px-4 pt-3 sm:px-8 sm:pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        {/* Live Emotional & Kinematic Telemetry */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 rounded-full bg-[#06070D]/65 px-4 py-1.5 backdrop-blur-md border border-[#E8C391]/15">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              omega <= 0 ? 'bg-[#E8C391] shadow-[0_0_10px_#E8C391]' : 'bg-[#C95B72]'
            }`}
          />
          <span className="font-mono-tech text-[10px] tracking-[0.2em] text-[#9A96AD] uppercase">
            {telemetryTag}
          </span>
          <span className="text-[#E8C391]/30">|</span>
          <span className="font-mono-tech text-[10px] tracking-[0.16em] text-[#E8C391]">
            ω = {formattedOmega}
          </span>
        </div>

        {/* Compact mobile badge */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-2 rounded-full bg-[#06070D]/80 px-3 py-1.5 backdrop-blur-md border border-[#E8C391]/15 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8C391]" />
          <span className="font-mono-tech text-[9px] tracking-[0.15em] text-[#E8C391]/90">
            {omega <= 0 ? 'TIEMPO DETENIDO' : `ω = ${omega} rad/s`}
          </span>
        </div>

        {/* Soundscape Controller */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCycleAudio}
            className={`group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs backdrop-blur-md transition-all duration-500 cursor-pointer whitespace-nowrap ${
              audioMode === 'muted'
                ? 'bg-[#141026]/85 border border-[#E8C391]/35 text-[#F4EFEA] shadow-[0_0_24px_rgba(232,195,145,0.18)] hover:border-[#E8C391]/65'
                : 'bg-[#06070D]/80 border border-[#E8C391]/25 text-[#E8C391] hover:border-[#E8C391]/50'
            }`}
          >
            {audioMode === 'muted' && (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#E8C391] animate-pulse shrink-0" />
                <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase">
                  Escuchar mientras lees
                </span>
              </>
            )}
            {audioMode === 'nocturne' && (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#E8C391] shrink-0" />
                <span className="font-mono-tech text-[10px] tracking-[0.13em] uppercase sm:hidden">
                  Piano · Canción
                </span>
                <span className="hidden sm:inline font-mono-tech text-[10px] tracking-[0.15em] uppercase">
                  Piano Nocturno · Cambiar a canción
                </span>
              </>
            )}
            {audioMode === 'song' && (
              <>
                <Music className="h-3.5 w-3.5 text-[#C95B72] shrink-0" />
                <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#F8DCE2]">
                  Nuestra Canción
                </span>
              </>
            )}
          </button>

          {audioMode !== 'muted' && (
            <button
              type="button"
              onClick={onMuteAudio}
              aria-label="Silenciar sonido"
              title="Silenciar"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06070D]/75 border border-[#F4EFEA]/15 text-[#9A96AD] hover:text-[#F4EFEA] hover:border-[#E8C391]/35 backdrop-blur-md transition-colors cursor-pointer"
            >
              <VolumeX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
