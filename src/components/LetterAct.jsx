import React, { useEffect, useRef, useState } from 'react';
import { LETTER_STANZAS } from '../data/universeData';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

export default function LetterAct({ activeStanzaId, onStanzaVisible, onHeartbeatPulse }) {
  const stanzaRefs = useRef({});
  const [seenIds, setSeenIds] = useState(() => new Set(['stanza-01', 'stanza-02']));
  const [heartbeatCount, setHeartbeatCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-stanza-id');
          if (!id) return;

          if (entry.isIntersecting) {
            setSeenIds((prev) => {
              if (prev.has(id)) return prev;
              const next = new Set(prev);
              next.add(id);
              return next;
            });
          }

          if (entry.isIntersecting && entry.intersectionRatio >= 0.42) {
            const found = LETTER_STANZAS.find((s) => s.id === id);
            if (found) {
              onStanzaVisible(found);
            }
          }
        });
      },
      {
        threshold: [0.18, 0.45, 0.7],
        rootMargin: '-10% 0px -15% 0px',
      }
    );

    Object.values(stanzaRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [onStanzaVisible]);

  const handleMonumentalTouch = () => {
    setHeartbeatCount((c) => c + 1);
    nocturneAudio.triggerStarChime(0.75);
    onHeartbeatPulse?.();
  };

  return (
    <section
      id="carta"
      aria-label="Carta para Kimberly"
      className="relative z-10 mx-auto max-w-3xl px-6 pt-24 pb-16 sm:px-10 sm:pt-32"
    >
      {/* Opening Dedication Header — Immediately visible above the first paragraph */}
      <div className="mb-12 sm:mb-16 text-center">
        <div className="inline-flex items-center gap-3 mb-5">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#E8C391]/60" />
          <span className="font-mono-tech text-[11px] tracking-[0.32em] text-[#E8C391] uppercase">
            Para Kimberly
          </span>
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#E8C391]/60" />
        </div>

        <p className="font-mono-tech text-[10px] tracking-[0.22em] text-[#9A96AD]/80 uppercase">
          01°14′56″ S · 78°37′00″ W
        </p>
      </div>

      {/* The 6 Verbatim Stanzas of Roberto's Message */}
      <div className="reading-sanctuary rounded-3xl px-2 py-4 sm:px-8 sm:py-8 space-y-16 sm:space-y-24">
        {LETTER_STANZAS.map((stanza, index) => {
          const isVisible = seenIds.has(stanza.id) || index === 0;
          const isActive = activeStanzaId === stanza.id;

          if (stanza.isMonumental) {
            return (
              <div
                key={stanza.id}
                data-stanza-id={stanza.id}
                ref={(el) => {
                  stanzaRefs.current[stanza.id] = el;
                }}
                onClick={handleMonumentalTouch}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMonumentalTouch();
                  }
                }}
                className={`group relative my-12 sm:my-20 py-14 sm:py-20 text-center cursor-pointer transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Delicate orbital rings framing the 8-word core truth */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className={`h-44 w-44 sm:h-56 sm:w-56 rounded-full border border-[#E8C391]/20 transition-transform duration-1000 ${
                      isActive ? 'scale-105 border-[#E8C391]/40' : 'scale-95'
                    }`}
                  />
                  <div className="absolute h-60 w-60 sm:h-72 sm:w-72 rounded-full border border-[#C95B72]/15 animate-pulse-slow" />
                </div>

                <span className="block font-mono-tech text-[10px] tracking-[0.28em] text-[#E8C391]/70 uppercase mb-5">
                  {stanza.roman}
                </span>

                <p className="relative font-display text-3xl sm:text-5xl font-light tracking-wide glow-rose leading-[1.35] px-4">
                  {stanza.segments[0].text}
                </p>

                <span className="mt-6 inline-block font-mono-tech text-[9px] tracking-[0.22em] text-[#9A96AD]/70 uppercase group-hover:text-[#E8C391] transition-colors">
                  {heartbeatCount > 0
                    ? `✦ Latido enviado al cielo (${heartbeatCount})`
                    : '✦ Toca para hacer resonar'}
                </span>
              </div>
            );
          }

          return (
            <article
              key={stanza.id}
              data-stanza-id={stanza.id}
              ref={(el) => {
                stanzaRefs.current[stanza.id] = el;
              }}
              onClick={() => nocturneAudio.triggerStarChime(index / LETTER_STANZAS.length)}
              className={`relative transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
              }`}
            >
              {/* Subtle Roman Numeral Marginalia */}
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`font-mono-tech text-[10px] tracking-[0.25em] transition-colors duration-700 ${
                    isActive ? 'text-[#E8C391]' : 'text-[#9A96AD]/50'
                  }`}
                >
                  {stanza.roman}
                </span>
                <span
                  className={`h-[1px] transition-all duration-700 ${
                    isActive ? 'w-10 bg-[#E8C391]/55' : 'w-4 bg-[#9A96AD]/20'
                  }`}
                />
              </div>

              <p
                className={`font-editorial text-[1.24rem] sm:text-[1.48rem] font-light leading-[1.82] tracking-[0.01em] transition-colors duration-700 ${
                  isActive ? 'text-[#F4EFEA]' : 'text-[#F4EFEA]/82'
                }`}
              >
                {stanza.segments.map((seg, sIdx) => {
                  if (seg.italic) {
                    return (
                      <em
                        key={sIdx}
                        className="font-display italic text-[1.45rem] sm:text-[1.78rem] font-normal glow-phrase"
                      >
                        {seg.text}
                      </em>
                    );
                  }
                  if (seg.highlight) {
                    return (
                      <span key={sIdx} className="glow-phrase font-normal">
                        {seg.text}
                      </span>
                    );
                  }
                  return <span key={sIdx}>{seg.text}</span>;
                })}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
