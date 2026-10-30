import React, { useEffect, useRef, useState } from 'react';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

export default function TwoBodyObservatory({ onResonanceChange }) {
  const canvasRef = useRef(null);
  const [resonanceTier, setResonanceTier] = useState(0);
  const [resonancePct, setResonancePct] = useState(24);

  const simRef = useRef({
    kPos: { x: 0.64, y: 0.44 },
    kTarget: { x: 0.64, y: 0.44 },
    rPos: { x: 0.32, y: 0.56 },
    rVel: { x: 0.0, y: 0.0 },
    dragging: false,
    phase: 0,
    lastChimeTier: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Dedicated offscreen ribbon buffer so orbital trails glow cleanly with zero text smearing
    const trailCanvas = document.createElement('canvas');
    const trailCtx = trailCanvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, rect.width);
      height = Math.max(300, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      trailCanvas.width = Math.floor(width * dpr);
      trailCanvas.height = Math.floor(height * dpr);
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      trailCtx.fillStyle = '#070811';
      trailCtx.fillRect(0, 0, width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    let last = performance.now();
    let frameCounter = 0;

    const step = (now) => {
      rafId = requestAnimationFrame(step);
      const dt = Math.min(0.035, (now - last) / 1000);
      last = now;
      frameCounter += 1;

      const s = simRef.current;
      s.phase += dt;

      s.kPos.x += (s.kTarget.x - s.kPos.x) * (1 - Math.exp(-dt * 10));
      s.kPos.y += (s.kTarget.y - s.kPos.y) * (1 - Math.exp(-dt * 10));

      const kx = s.kPos.x * width;
      const ky = s.kPos.y * height;
      let rx = s.rPos.x * width;
      let ry = s.rPos.y * height;

      const dx = kx - rx;
      const dy = ky - ry;
      const dist = Math.hypot(dx, dy);
      const maxRef = Math.min(width, height) * 0.58;

      const closeness = Math.max(0, Math.min(1, 1 - (dist - 54) / Math.max(75, maxRef)));

      const chaosAmp = (1 - closeness * 0.9) * 330;
      const fxChaos =
        Math.sin(s.phase * 4.3) * chaosAmp + Math.cos(s.phase * 7.1 + ry * 0.02) * chaosAmp * 0.65;
      const fyChaos =
        Math.cos(s.phase * 3.9) * chaosAmp + Math.sin(s.phase * 6.4 + rx * 0.02) * chaosAmp * 0.65;

      const desiredOrbitR = Math.min(width, height) * 0.145;
      const ux = dx / Math.max(1, dist);
      const uy = dy / Math.max(1, dist);
      const tx = -uy;
      const ty = ux;

      const radialSpring = (dist - desiredOrbitR) * (1.9 + closeness * 4.7);
      const orbitalSwirl = 68 + closeness * 115;

      const ax = ux * radialSpring + tx * orbitalSwirl + fxChaos * 0.44;
      const ay = uy * radialSpring + ty * orbitalSwirl + fyChaos * 0.44;

      const prevRx = rx;
      const prevRy = ry;

      const damping = Math.exp(-dt * (2.2 + closeness * 2.4));
      s.rVel.x = (s.rVel.x + ax * dt) * damping;
      s.rVel.y = (s.rVel.y + ay * dt) * damping;

      rx += s.rVel.x * dt;
      ry += s.rVel.y * dt;

      const pad = 34;
      if (rx < pad) {
        rx = pad;
        s.rVel.x *= -0.6;
      } else if (rx > width - pad) {
        rx = width - pad;
        s.rVel.x *= -0.6;
      }
      if (ry < pad) {
        ry = pad;
        s.rVel.y *= -0.6;
      } else if (ry > height - pad) {
        ry = height - pad;
        s.rVel.y *= -0.6;
      }

      s.rPos.x = rx / width;
      s.rPos.y = ry / height;

      // 1. Update Silk Trail Buffer (ONLY ribbons, never text!)
      trailCtx.fillStyle = 'rgba(7, 8, 17, 0.085)';
      trailCtx.fillRect(0, 0, width, height);

      const rCol = Math.round(148 + closeness * 94);
      const gCol = Math.round(164 + closeness * 36);
      const bCol = Math.round(216 - closeness * 66);

      trailCtx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, 0.88)`;
      trailCtx.lineWidth = 2.2;
      trailCtx.lineCap = 'round';
      trailCtx.beginPath();
      trailCtx.moveTo(prevRx, prevRy);
      trailCtx.lineTo(rx, ry);
      trailCtx.stroke();

      // 2. Composite clean frame onto Main Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(trailCanvas, 0, 0, width, height);

      // Subtle sanctuary orbital ring around K
      ctx.strokeStyle = `rgba(232, 195, 145, ${0.07 + closeness * 0.18})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(kx, ky, desiredOrbitR, 0, Math.PI * 2);
      ctx.stroke();

      if (closeness > 0.32) {
        const grad = ctx.createLinearGradient(kx, ky, rx, ry);
        grad.addColorStop(0, `rgba(232, 195, 145, ${closeness * 0.6})`);
        grad.addColorStop(1, `rgba(201, 91, 114, ${closeness * 0.45})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // Draw Body R (Andrés)
      const rGlow = ctx.createRadialGradient(rx, ry, 1, rx, ry, 20);
      rGlow.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, 0.95)`);
      rGlow.addColorStop(1, 'rgba(150, 166, 215, 0)');
      ctx.fillStyle = rGlow;
      ctx.beginPath();
      ctx.arc(rx, ry, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F4EFEA';
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.fill();

      // Crisp radial-repelled label for R (mathematically never crosses K's label)
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(244, 239, 234, 0.84)';
      const rLabel = closeness > 0.65 ? 'Andrés (en calma)' : 'Andrés (ruido)';
      const rTextW = ctx.measureText(rLabel).width;
      const outX = -ux;
      const outY = -uy;
      const rawRx = rx + outX * 22 - rTextW * 0.5;
      const rawRy = ry + outY * 22 + 3;
      const clampedRx = Math.max(10, Math.min(width - rTextW - 10, rawRx));
      const clampedRy = Math.max(16, Math.min(height - 10, rawRy));
      ctx.fillText(rLabel, clampedRx, clampedRy);

      // Draw Body K (Kimberly)
      const haloR = 36 + closeness * 16;
      const kGlow = ctx.createRadialGradient(kx, ky, 2, kx, ky, haloR);
      kGlow.addColorStop(0, 'rgba(248, 224, 188, 0.98)');
      kGlow.addColorStop(0.42, 'rgba(201, 91, 114, 0.44)');
      kGlow.addColorStop(1, 'rgba(201, 91, 114, 0)');
      ctx.fillStyle = kGlow;
      ctx.beginPath();
      ctx.arc(kx, ky, haloR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF4E4';
      ctx.beginPath();
      ctx.arc(kx, ky, 6.2, 0, Math.PI * 2);
      ctx.fill();

      // Crisp radial-repelled label for K (placed on opposite side of R)
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#E8C391';
      const kLabel = '✦ Kimberly';
      const kTextW = ctx.measureText(kLabel).width;
      const rawKx = kx + ux * 24 - kTextW * 0.5;
      const rawKy = ky + uy * 24 + 4;
      const clampedKx = Math.max(10, Math.min(width - kTextW - 10, rawKx));
      const clampedKy = Math.max(16, Math.min(height - 10, rawKy));
      ctx.fillText(kLabel, clampedKx, clampedKy);

      if (frameCounter % 10 === 0) {
        const pct = Math.round(closeness * 100);
        setResonancePct(pct);
        const tier = pct >= 68 ? 2 : pct >= 36 ? 1 : 0;
        setResonanceTier(tier);
        onResonanceChange?.(closeness);

        if (tier > s.lastChimeTier) {
          nocturneAudio.triggerStarChime(0.45 + tier * 0.25);
        }
        s.lastChimeTier = tier;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [onResonanceChange]);

  const updateKFromClient = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0.16, Math.min(0.84, (clientX - rect.left) / rect.width));
    const ny = Math.max(0.16, Math.min(0.84, (clientY - rect.top) / rect.height));
    simRef.current.kTarget = { x: nx, y: ny };
  };

  const bringTogether = () => {
    simRef.current.kTarget = { x: 0.5, y: 0.5 };
    simRef.current.rPos = { x: 0.44, y: 0.5 };
    nocturneAudio.triggerStarChime(0.85);
  };

  const separateBodies = () => {
    simRef.current.kTarget = { x: 0.8, y: 0.24 };
    simRef.current.rPos = { x: 0.2, y: 0.76 };
    nocturneAudio.triggerStarChime(0.2);
  };

  const tierMessages = [
    {
      badge: 'ESTADO 01 · LEJOS DE TI',
      quote:
        '“Mil problemas buscando solución, planes a toda velocidad y una cabeza que no sabe estarse quieta ni un segundo.”',
    },
    {
      badge: 'ESTADO 02 · CUANDO APARECES',
      quote:
        '“El ruido empieza a perder fuerza. De repente todo lo urgente pasa a segundo plano y el tiempo cambia de ritmo.”',
    },
    {
      badge: 'ESTADO 03 · ÓRBITA CONTIGO (QUIETUD TOTAL)',
      quote:
        '“Exactamente esto haces en mí: conviertes todo mi caos en un solo lugar tranquilo del que nunca me quiero ir.”',
    },
  ];

  const currentMessage = tierMessages[resonanceTier];

  return (
    <section
      id="observatorio"
      aria-label="Observatorio interactivo de dos cuerpos"
      className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="smoked-glass rounded-3xl p-6 sm:p-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[10px] tracking-[0.26em] text-[#E8C391] uppercase block mb-2">
              Instrumento Interactivo · Dinámica de Dos Cuerpos
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-[#F4EFEA]">
              Lo que pasa en mi cabeza cuando te acercas.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={bringTogether}
              className="rounded-full border border-[#E8C391]/40 bg-[#E8C391]/10 px-4 py-1.5 font-mono-tech text-[10px] tracking-[0.16em] text-[#E8C391] uppercase hover:bg-[#E8C391]/20 transition-colors cursor-pointer"
            >
              Acercarte a mí ✦
            </button>
            <button
              type="button"
              onClick={separateBodies}
              className="rounded-full border border-[#F4EFEA]/15 bg-[#06070D]/60 px-3.5 py-1.5 font-mono-tech text-[10px] tracking-[0.16em] text-[#9A96AD] uppercase hover:text-[#F4EFEA] transition-colors cursor-pointer"
            >
              Ver mi caos
            </button>
          </div>
        </div>

        {/* Clean non-overlapping telemetry strip above canvas */}
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <span className="font-mono-tech text-[10px] tracking-[0.15em] text-[#9A96AD] uppercase">
            Arrastra o toca para mover tu estrella (✦ Kimberly)
          </span>
          <span className="shrink-0 rounded-full border border-[#E8C391]/30 bg-[#06070D]/80 px-3 py-1 font-mono-tech text-[10px] tracking-[0.16em] text-[#E8C391] uppercase">
            Armonía: {resonancePct}%
          </span>
        </div>

        {/* Interactive 60fps Two-Body Orbital Canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E8C391]/20 bg-[#070811]">
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => {
              simRef.current.dragging = true;
              updateKFromClient(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              if (simRef.current.dragging) {
                updateKFromClient(e.clientX, e.clientY);
              }
            }}
            onMouseUp={() => {
              simRef.current.dragging = false;
            }}
            onMouseLeave={() => {
              simRef.current.dragging = false;
            }}
            onClick={(e) => updateKFromClient(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches && e.touches[0]) {
                updateKFromClient(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches && e.touches[0]) {
                updateKFromClient(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            className="block h-[320px] sm:h-[390px] w-full cursor-grab active:cursor-grabbing touch-none"
          />
        </div>

        {/* Dynamic Confession Readout Driven by Orbital Distance */}
        <div className="mt-6 rounded-2xl border border-[#E8C391]/15 bg-[#06070D]/55 p-5 sm:p-6 text-center transition-all duration-500">
          <span className="font-mono-tech text-[10px] tracking-[0.24em] text-[#C95B72] uppercase block mb-2">
            {currentMessage.badge}
          </span>
          <p className="font-display italic text-xl sm:text-2xl text-[#F4EFEA] font-light leading-relaxed">
            {currentMessage.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
