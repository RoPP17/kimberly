import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MEMORIES } from '../data/universeData';
import DepthParallaxPhoto from '../webgl/DepthParallaxPhoto';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

export default function MemoriesAct() {
  const [activeIndex, setActiveIndex] = useState(null);

  const heroMemory = MEMORIES[0];
  const secondaryMemories = MEMORIES.slice(1);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i + 1) % MEMORIES.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i - 1 + MEMORIES.length) % MEMORIES.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex]);

  const openPhoto = (idx) => {
    nocturneAudio.triggerStarChime(0.6 + idx * 0.12);
    setActiveIndex(idx);
  };

  const activePhoto = activeIndex !== null ? MEMORIES[activeIndex] : null;

  return (
    <section
      id="memorias"
      aria-label="Fragmentos donde el tiempo se detuvo"
      className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      {/* Section Header */}
      <div className="mb-14 sm:mb-20 max-w-2xl">
        <span className="font-mono-tech text-[10px] tracking-[0.28em] text-[#E8C391] uppercase block mb-3">
          Archivo Visual · Donde el tiempo sí se detuvo
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-light text-[#F4EFEA] leading-[1.18] mb-4">
          Pruebas de que no fuiste una coincidencia.
        </h2>
        <p className="font-editorial text-base sm:text-lg text-[#9A96AD] font-light leading-relaxed">
          Hay momentos que, vistos desde afuera, parecen un día normal. Vistos desde mí, son exactamente los lugares a los que mi cabeza vuelve cuando busca paz.
        </p>
      </div>

      {/* Centerpiece: Today's Uploaded Carmenere Photo in 3D Depth-Parallax Optical Glass */}
      <div className="smoked-glass rounded-3xl p-5 sm:p-8 mb-10 sm:mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <DepthParallaxPhoto
              webp={heroMemory.webp}
              jpg={heroMemory.jpg}
              depth={heroMemory.depth}
              alt={heroMemory.title}
              onOpen={() => openPhoto(0)}
            />
          </div>

          <div className="lg:col-span-5 space-y-5 px-1 sm:px-2">
            <span className="font-mono-tech text-[10px] tracking-[0.24em] text-[#C95B72] uppercase block">
              {heroMemory.catalog}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-light text-[#F4EFEA] leading-snug">
              {heroMemory.title}
            </h3>
            <p className="font-editorial text-base sm:text-[1.08rem] text-[#F4EFEA]/80 font-light leading-[1.78]">
              {heroMemory.caption}
            </p>
            <div className="pt-2 flex items-center gap-3 text-[#E8C391]/75">
              <span className="h-[1px] w-8 bg-[#E8C391]/40" />
              <span className="font-mono-tech text-[9px] tracking-[0.2em] uppercase">
                Mueve el cursor o inclina tu dedo sobre la imagen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Diptych of Authentic Intimate Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
        {secondaryMemories.map((mem, idx) => {
          const realIdx = idx + 1;
          return (
            <article
              key={mem.id}
              onClick={() => openPhoto(realIdx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPhoto(realIdx);
                }
              }}
              className={`group smoked-glass rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:border-[#E8C391]/35 ${
                idx === 1 ? 'md:mt-10' : ''
              }`}
            >
              <div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#090B14] mb-5"
                style={{
                  boxShadow: `0 22px 60px -18px ${mem.aura}`,
                }}
              >
                <picture>
                  <source srcSet={mem.webp} type="image/webp" />
                  <img
                    src={mem.jpg}
                    alt={mem.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                </picture>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070D]/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 font-mono-tech text-[9px] tracking-[0.2em] text-[#E8C391]/90 uppercase rounded-full bg-[#06070D]/70 px-3 py-1 backdrop-blur-md border border-[#E8C391]/20">
                  {mem.catalog}
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-light text-[#F4EFEA] mb-2 leading-snug group-hover:text-[#FAEEDC] transition-colors">
                {mem.title}
              </h3>
              <p className="font-editorial text-sm sm:text-base text-[#9A96AD] font-light leading-relaxed">
                {mem.caption}
              </p>
            </article>
          );
        })}
      </div>

      {/* Full-Screen Cinema Darkroom Loupe Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070D]/92 p-4 sm:p-8 backdrop-blur-xl"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col items-center overflow-hidden rounded-3xl border border-[#E8C391]/25 bg-[#0A0C16] p-4 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between">
              <span className="font-mono-tech text-[10px] tracking-[0.24em] text-[#E8C391] uppercase">
                {activePhoto.catalog}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Cerrar vista ampliada"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F4EFEA]/15 text-[#F4EFEA]/80 hover:border-[#E8C391]/50 hover:text-[#E8C391] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex max-h-[64dvh] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#06070D]">
              <picture className="flex max-h-[64dvh] items-center justify-center">
                <source srcSet={activePhoto.webp} type="image/webp" />
                <img
                  src={activePhoto.jpg}
                  alt={activePhoto.title}
                  className="max-h-[64dvh] w-auto object-contain"
                />
              </picture>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((activeIndex - 1 + MEMORIES.length) % MEMORIES.length)
                }
                aria-label="Recuerdo anterior"
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#06070D]/75 border border-[#E8C391]/25 text-[#F4EFEA] hover:border-[#E8C391] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + 1) % MEMORIES.length)}
                aria-label="Siguiente recuerdo"
                className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#06070D]/75 border border-[#E8C391]/25 text-[#F4EFEA] hover:border-[#E8C391] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 max-w-2xl text-center">
              <h4 className="font-display text-xl sm:text-2xl text-[#F4EFEA] font-light mb-1.5">
                {activePhoto.title}
              </h4>
              <p className="font-editorial text-sm sm:text-base text-[#9A96AD] font-light">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
