import React, { useEffect, useState } from 'react';
import { Sparkles, Send, Check, Download, X, Star } from 'lucide-react';
import { CERTAINTIES, SECRET_POSTSCRIPT } from '../data/universeData';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

const STORAGE_STAR_KEY = 'kimberly_star_lit_v1';
const STORAGE_WHISPER_KEY = 'kimberly_whisper_sent_v1';

export default function CertaintiesAndFinale({ onTriggerSupernova }) {
  const [starTimestamp, setStarTimestamp] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_STAR_KEY) || '';
    } catch {
      return '';
    }
  });

  const [whisperText, setWhisperText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentRecord, setSentRecord] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_WHISPER_KEY) || '';
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
        // ignore storage restrictions
      }
    }

    nocturneAudio.triggerSupernovaChord();
    onTriggerSupernova?.();
  };

  const sendSignalToAndres = async (customMessage) => {
    if (sending) return;
    setSending(true);
    handleLightStar();

    const payloadMsg =
      customMessage ||
      whisperText.trim() ||
      '✦ Kimberly encendió la estrella silenciosa al terminar de leer tu universo.';

    try {
      await fetch('https://formsubmit.co/ajax/andrespepe014@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: '✦ Kimberly abrió tu universo y dejó una luz encendida',
          mensaje_de_kimberly: payloadMsg,
          fecha_hora: new Date().toISOString(),
        }),
      });
    } catch {
      // Even offline, preserve her star locally without error friction
    }

    try {
      localStorage.setItem(STORAGE_WHISPER_KEY, payloadMsg);
    } catch {
      // ignore
    }

    setSentRecord(payloadMsg);
    setWhisperText('');
    setSending(false);
  };

  return (
    <>
      {/* ACT IV: FIVE ARCHITECTURAL CERTAINTIES */}
      <section
        id="certezas"
        aria-label="Cinco certezas que no cambian"
        className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-28"
      >
        <div className="mb-14 max-w-2xl">
          <span className="font-mono-tech text-[10px] tracking-[0.28em] text-[#E8C391] uppercase block mb-3">
            Leyes Invariantes · Lo que el tiempo no toca
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

      {/* ACT V: THE CELESTIAL FINALE & ZERO-PRESSURE STAR CAPSULE */}
      <section
        id="cielo-final"
        aria-label="Epílogo bajo el cielo"
        className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-28 sm:px-10 sm:pt-24 sm:pb-36 text-center"
      >
        <div className="mx-auto mb-10 h-20 w-[1px] bg-gradient-to-b from-transparent via-[#E8C391]/45 to-transparent" />

        <span className="font-mono-tech text-[10px] tracking-[0.3em] text-[#C95B72] uppercase block mb-5">
          Epílogo · Sin pedirte nada, entregándote todo
        </span>

        <h2 className="font-display text-3xl sm:text-5xl font-light text-[#F4EFEA] leading-[1.24] mb-6">
          En la carta escribí <em className="italic glow-phrase">«ojalá volver a verla»</em>…
        </h2>

        <p className="font-editorial text-lg sm:text-xl text-[#F4EFEA]/85 font-light leading-[1.82] mb-12 max-w-2xl mx-auto">
          …pensando en qué pasaría si un día la vida nos llevara lejos. Pero hoy estamos aquí, bajo el mismo cielo, y no quería guardarme para dentro de veinte años la verdad más simple y más grande que tengo: <span className="glow-rose">te amo como a nadie en mi vida, Kimberly.</span>
        </p>

        {/* Central Star Illumination Sanctuary */}
        <div className="smoked-glass rounded-3xl p-7 sm:p-11 text-center">
          <div className="mb-6 flex flex-col items-center">
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
                : 'Toca la estrella para dejar una luz encendida en este cielo'}
            </span>
          </div>

          {/* Zero-Pressure Whisper or Silent Signal */}
          {!sentRecord ? (
            <div className="mt-8 border-t border-[#E8C391]/15 pt-8 max-w-xl mx-auto">
              <p className="font-editorial text-sm sm:text-base text-[#9A96AD] font-light mb-5 leading-relaxed">
                Como te dije arriba, no tienes que responder nada por compromiso. Pero si quieres dejar una huella silenciosa de que estuviste aquí —o escribir lo primero que te nació al leerlo—, este cielo se lo lleva directo a Andrés:
              </p>

              <div className="mb-4">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() =>
                    sendSignalToAndres('✦ Kimberly estuvo aquí, leyó tu carta y encendió la estrella.')
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#C95B72]/45 bg-[#C95B72]/15 px-5 py-2.5 font-mono-tech text-[10px] tracking-[0.18em] text-[#F8DCE2] uppercase hover:bg-[#C95B72]/28 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Star className="h-3.5 w-3.5 text-[#E8C391]" />
                  <span>Enviar un latido silencioso («Lo leí ✦»)</span>
                </button>
              </div>

              <div className="relative mt-5">
                <textarea
                  rows={3}
                  value={whisperText}
                  onChange={(e) => setWhisperText(e.target.value)}
                  placeholder="O deja aquí un pensamiento guardado en esta estrella (opcional)..."
                  className="w-full rounded-2xl border border-[#E8C391]/20 bg-[#06070D]/75 px-4 py-3.5 font-editorial text-sm sm:text-base text-[#F4EFEA] placeholder-[#9A96AD]/50 focus:border-[#E8C391]/60 focus:outline-none transition-colors resize-none"
                />
                {whisperText.trim().length > 0 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => sendSignalToAndres(whisperText.trim())}
                      className="inline-flex items-center gap-2 rounded-full bg-[#E8C391] px-5 py-2 font-mono-tech text-[10px] font-medium tracking-[0.18em] text-[#06070D] uppercase hover:bg-[#F5DEC0] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{sending ? 'Elevando al cielo...' : 'Guardar en esta estrella'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-7 border-t border-[#E8C391]/15 pt-7 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8C391]/15 border border-[#E8C391]/35 px-4 py-1.5 mb-3">
                <Check className="h-3.5 w-3.5 text-[#E8C391]" />
                <span className="font-mono-tech text-[10px] tracking-[0.18em] text-[#E8C391] uppercase">
                  Guardado en este cielo para siempre
                </span>
              </div>
              <p className="font-display italic text-xl text-[#F4EFEA]/90 font-light">
                “{sentRecord}”
              </p>
            </div>
          )}
        </div>

        {/* Footer Signature + Hidden Twin-Star P.D. + Keepsake Astronomical Print */}
        <footer className="mt-20 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
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

            <button
              type="button"
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#F4EFEA]/12 bg-[#0A0C16]/60 px-4 py-2 font-mono-tech text-[10px] tracking-[0.2em] text-[#9A96AD] uppercase hover:border-[#E8C391]/35 hover:text-[#F4EFEA] transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Carta celeste para guardar</span>
            </button>
          </div>

          <p className="font-mono-tech text-[10px] tracking-[0.28em] text-[#9A96AD]/55 uppercase">
            Hecho a mano, línea por línea, solo para ti · Andrés
          </p>
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
            className="relative flex max-h-[90dvh] w-full max-w-xl flex-col items-center rounded-3xl border border-[#E8C391]/25 bg-[#0A0C16] p-5 sm:p-7"
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
              className="max-h-[64dvh] w-auto rounded-xl border border-[#E8C391]/20 object-contain"
            />

            <a
              href="./constelacion-kimberly.png"
              download="Constelacion-Kimberly.png"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E8C391] px-6 py-2.5 font-mono-tech text-[10px] font-medium tracking-[0.2em] text-[#06070D] uppercase hover:bg-[#F5DEC0] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Guardar lámina en alta resolución</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
