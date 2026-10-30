import React, { useEffect, useRef, useState } from 'react';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

export default function TimeDilationPortal({ onPortalActivated }) {
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const holdingRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      setProgress((prev) => {
        if (unlocked) return 1;
        if (holdingRef.current) {
          const next = Math.min(1, prev + dt * 0.85);
          if (next >= 1 && !unlocked) {
            setUnlocked(true);
            nocturneAudio.triggerSupernovaChord();
            onPortalActivated?.();
          }
          return next;
        }
        return Math.max(0, prev - dt * 1.2);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [unlocked, onPortalActivated]);

  const startHold = () => {
    if (unlocked) {
      const el = document.getElementById('memorias');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    holdingRef.current = true;
    nocturneAudio.triggerStarChime(0.4);
  };

  const endHold = () => {
    holdingRef.current = false;
  };

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <div className="mx-auto mb-8 h-16 w-[1px] bg-gradient-to-b from-[#E8C391]/40 to-transparent" />

      <p className="font-display italic text-2xl sm:text-3xl text-[#F4EFEA]/90 font-light leading-relaxed mb-4">
        “Aunque si te soy completamente sincero… no construí este pequeño universo solo para conformarme con un «ojalá».”
      </p>

      <p className="font-editorial text-sm sm:text-base text-[#9A96AD] max-w-md mx-auto mb-10 leading-relaxed">
        Detrás de estas palabras guardé lo que pasa en mi cabeza cada vez que apareces, nuestros instantes reales y una estrella que lleva tu nombre.
      </p>

      {/* Tactile Hold-to-Stop-Time Orbital Portal */}
      <div className="flex flex-col items-center justify-center">
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onClick={() => {
            if (!unlocked && progress < 0.25) {
              // Single quick click convenience: still allow instant unlock if tapped!
              setUnlocked(true);
              setProgress(1);
              nocturneAudio.triggerSupernovaChord();
              onPortalActivated?.();
            }
          }}
          className="group relative flex h-32 w-32 items-center justify-center rounded-full focus:outline-none cursor-pointer select-none"
          aria-label="Detener el tiempo y explorar nuestro universo"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="rgba(20, 16, 38, 0.55)"
              stroke="rgba(232, 195, 145, 0.2)"
              strokeWidth="1.2"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#E8C391"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-75"
            />
          </svg>

          <div className="relative flex flex-col items-center">
            <span className="font-display text-2xl text-[#E8C391] group-hover:scale-110 transition-transform">
              {unlocked ? '✦' : '◎'}
            </span>
            <span className="mt-1 font-mono-tech text-[9px] tracking-[0.2em] text-[#F4EFEA]/90 uppercase">
              {unlocked ? 'Abierto' : 'Detener'}
            </span>
          </div>
        </button>

        <span className="mt-4 font-mono-tech text-[10px] tracking-[0.22em] text-[#E8C391]/75 uppercase">
          {unlocked
            ? 'Tiempo detenido · Desliza hacia abajo'
            : 'Toca o mantén presionado para detener el tiempo'}
        </span>
      </div>
    </section>
  );
}
