import React, { useEffect, useState } from 'react';
import { Sparkles, Download, X } from 'lucide-react';
import { CERTAINTIES, SECRET_POSTSCRIPT } from '../data/universeData';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

const STORAGE_STAR_KEY = 'kimberly_star_lit_v2';

export default function CertaintiesAndFinale({ onTriggerSupernova }) {
  const [starTimestamp, setStarTimestamp] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_STAR_KEY) || '';
    } catch {
      return '';
    }
  });

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowSecretModal(false);
        setShowPosterModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--spot-x', `${x}px`);
    e.currentTarget.style.setProperty('--spot-y', `${y}px`);
  };

  const handleLightStar = () => {
    const nowStr = new Date().toLocaleString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!starTimestamp) {
      setStarTimestamp(nowStr);
      try {
        localStorage.setItem(STORAGE_STAR_KEY, nowStr);
      } catch {
        // ignore
      }
    }

    nocturneAudio.triggerSupernovaChord();
    onTriggerSupernova?.();
  };

  return (
    <>
      {/* ACT IV: FIVE CERTAINTIES */}
      <section
        id="certezas"
        aria-label="Cinco certezas que no cambian"
        className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
      >
        <div className="mb-14 max-w-2xl">
          <span className="font-mono-tech text-[10px] tracking-[0.28em] text-[#E8C391] uppercase block mb-3">
            Leyes Invariantes
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-light text-[#F4EFEA] leading-[1.18]">
            Cinco cosas que sé con los ojos cerrados cuando pienso en ti.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {CERTAINTIES.map((item, idx) => {
            const spanClass = idx < 2 ? 'md:col-span-3' : idx < 4 ? 'md:col-span-3' : 'md:col-span-6';
            return (
              <article
                key={item.index}
                onMouseMove={handleCardMouseMove}
                onClick={() => nocturneAudio.triggerStarChime(0.3 + idx * 0.14)}
                className={`certainty-card rounded-3xl p-6 sm:p-8 cursor-default ${spanClass}`}
              >
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono-tech text-[10px] tracking-[0.26em] text-[#E8C391] uppercase">
                      {item.index} · {item.label}
                    </span>
                    <span className="text-[#C95B72]/70 text-xs">✦</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-[1.72rem] font-light text-[#F4EFEA] mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <p className="font-editorial text-sm sm:text-base text-[#9A96AD] font-light leading-[1.78]">
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ACT V: THE CELESTIAL FINALE */}
      <section
        id="cielo-final"
        aria-label="Epílogo bajo el cielo"
        className="relative z-10 mx-auto max-w-3xl scroll-mt-20 px-6 pt-16 pb-28 sm:px-10 sm:pt-24 sm:pb-36 text-center"
      >
        <div className="mx-auto mb-10 h-20 w-[1px] bg-gradient-to-b from-transparent via-[#E8C391]/45 to-transparent" />

        <h2 className="font-display text-3xl sm:text-5xl font-light text-[#F4EFEA] leading-[1.24] mb-6">
          En la carta escribí <em className="italic glow-phrase">«ojalá volver a verla»</em>…
        </h2>

        <p className="font-editorial text-lg sm:text-xl text-[#F4EFEA]/85 font-light leading-[1.82] mb-12 max-w-2xl mx-auto">
          …pensando en qué pasaría si un día la vida nos llevara lejos. Pero hoy estamos aquí, bajo el mismo cielo, y no quería guardarme para dentro de veinte años la verdad más simple y más grande que tengo: <span className="glow-rose">te amo como a nadie en mi vida, Kimberly.</span>
        </p>

        {/* Central Star Illumination & Downloadable Keepsake Sanctuary */}
        <div className="smoked-glass rounded-3xl p-7 sm:p-11 text-center">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleLightStar}
              className={`group relative flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-700 cursor-pointer ${
                starTimestamp
                  ? 'border-[#E8C391] bg-[#E8C391]/20 shadow-[0_0_60px_rgba(232,195,145,0.45)] scale-105'
                  : 'border-[#E8C391]/35 bg-[#141026]/80 hover:border-[#E8C391] hover:shadow-[0_0_40px_rgba(232,195,145,0.28)]'
              }`}
              aria-label="Encender estrella en este cielo"
            >
              <Sparkles
                className={`h-8 w-8 transition-transform duration-700 group-hover:scale-110 ${
                  starTimestamp ? 'text-[#FFF4E0]' : 'text-[#E8C391]'
                }`}
              />
            </button>

            <span className="mt-4 font-mono-tech text-[10px] tracking-[0.24em] text-[#E8C391] uppercase">
              {starTimestamp
                ? `✦ Estrella encendida · ${starTimestamp}`
                : 'Toca la estrella para encender una luz en este cielo'}
            </span>
          </div>

          {/* Keepsake Photo Download Card */}
          <div className="mt-10 border-t border-[#E8C391]/15 pt-8 max-w-md mx-auto flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#E8C391] px-6 py-3 font-mono-tech text-[11px] font-medium tracking-[0.18em] text-[#06070D] uppercase hover:bg-[#F5DEC0] transition-all shadow-[0_10px_30px_rgba(232,195,145,0.22)] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Ver y guardar lámina de recuerdo</span>
            </button>
            <p className="mt-3 font-editorial text-xs text-[#9A96AD] font-light">
              Ilustración astronómica en alta resolución hecha para ti
            </p>
          </div>
        </div>

        {/* Footer: Hidden Twin-Star P.D. */}
        <footer className="mt-16 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => {
              nocturneAudio.triggerStarChime(0.92);
              setShowSecretModal(true);
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-[#E8C391]/20 bg-[#0A0C16]/75 px-4 py-2 font-mono-tech text-[10px] tracking-[0.22em] text-[#E8C391]/85 uppercase hover:border-[#E8C391]/55 hover:text-[#FFF4E0] transition-all cursor-pointer"
          >
            <span className="inline-block animate-pulse text-[#C95B72]">✦</span>
            <span>P.D. oculta en una estrella</span>
          </button>
        </footer>
      </section>

      {/* Secret Postscript Twin-Star Modal */}
      {showSecretModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070D]/90 p-5 backdrop-blur-xl"
          onClick={() => setShowSecretModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#E8C391]/30 bg-gradient-to-b from-[#141026] to-[#080912] p-7 sm:p-10 shadow-[0_30px_100px_rgba(201,91,114,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSecretModal(false)}
              aria-label="Cerrar posdata secreta"
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#F4EFEA]/15 text-[#9A96AD] hover:text-[#F4EFEA] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="font-mono-tech text-[10px] tracking-[0.24em] text-[#E8C391] uppercase block mb-3">
              {SECRET_POSTSCRIPT.eyebrow}
            </span>

            <h3 className="font-display text-2xl sm:text-3xl font-light text-[#F4EFEA] mb-5">
              {SECRET_POSTSCRIPT.title}
            </h3>

            <div className="space-y-4 font-editorial text-base text-[#F4EFEA]/85 font-light leading-[1.8]">
              {SECRET_POSTSCRIPT.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <p className="mt-7 font-display italic text-xl text-[#E8C391]">
              — {SECRET_POSTSCRIPT.signature}
            </p>
          </div>
        </div>
      )}

      {/* Keepsake Astronomical Poster Modal */}
      {showPosterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070D]/92 p-5 backdrop-blur-xl"
          onClick={() => setShowPosterModal(false)}
        >
          <div
            className="relative flex max-h-[90dvh] w-full max-w-xl flex-col items-center rounded-3xl border border-[#E8C391]/25 bg-[#0A0C16] p-5 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex w-full items-center justify-between">
              <span className="font-mono-tech text-[10px] tracking-[0.22em] text-[#E8C391] uppercase">
                Lámina Astronómica · Kimberly
              </span>
              <button
                type="button"
                onClick={() => setShowPosterModal(false)}
                aria-label="Cerrar lámina"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F4EFEA]/15 text-[#9A96AD] hover:text-[#F4EFEA] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <img
              src="./constelacion-kimberly.png"
              alt="Carta celeste dedicada a Kimberly"
              className="max-h-[60dvh] w-auto rounded-xl border border-[#E8C391]/20 object-contain"
            />

            <a
              href="./constelacion-kimberly.png"
              download="Constelacion-Kimberly.png"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E8C391] px-6 py-2.5 font-mono-tech text-[10px] font-medium tracking-[0.2em] text-[#06070D] uppercase hover:bg-[#F5DEC0] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar foto en alta resolución</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
