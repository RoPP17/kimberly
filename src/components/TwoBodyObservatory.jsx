import React, { useEffect, useRef, useState } from 'react';
import { nocturneAudio } from '../audio/nocturneAudioEngine';

export default function TwoBodyObservatory({ onResonanceChange }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [stageIndex, setStageIndex] = useState(0);

  const animStateRef = useRef({
    inView: false,
    startTime: null,
    hasReached: false,
    chimeTriggered: false,
    rPos: { x: 0.16, y: 0.82 },
    rVel: { x: 0.0, y: 0.0 },
  });

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animStateRef.current.inView = true;
            if (animStateRef.current.startTime === null) {
              animStateRef.current.startTime = performance.now();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sec);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const trailCanvas = document.createElement('canvas');
    const trailCtx = trailCanvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(260, rect.width);
      height = Math.max(260, rect.height);

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

    const render = (now) => {
      rafId = requestAnimationFrame(render);
      const dt = Math.min(0.035, (now - last) / 1000);
      last = now;

      const s = animStateRef.current;
      if (!s.inView) return;

      const elapsed = (now - (s.startTime || now)) / 1000;

      // 1. Kimberly moves gracefully along a continuous serene celestial curve
      const kNormX = 0.5 + 0.26 * Math.cos(elapsed * 0.45);
      const kNormY = 0.5 + 0.18 * Math.sin(elapsed * 0.9);
      const kx = kNormX * width;
      const ky = kNormY * height;

      // 2. Roberto starts on the side and pursues Kimberly until reaching her
      let rx = s.rPos.x * width;
      let ry = s.rPos.y * height;

      const dx = kx - rx;
      const dy = ky - ry;
      const dist = Math.hypot(dx, dy);

      // Desired close binary orbit distance once reached
      const orbitR = Math.min(width, height) * 0.125;

      // Steering acceleration toward Kimberly
      const dirX = dx / Math.max(1, dist);
      const dirY = dy / Math.max(1, dist);
      const perpX = -dirY;
      const perpY = dirX;

      // Pursuit strength ramps up smoothly
      const pursuitSpeed = dist > orbitR + 20 ? 180 : 80;
      const radialPull = (dist - orbitR) * (dist > orbitR ? 3.2 : 4.5);
      const tangentialSwirl = dist < orbitR * 2.5 ? 90 : 25;

      const targetAx = dirX * (pursuitSpeed + radialPull) + perpX * tangentialSwirl;
      const targetAy = dirY * (pursuitSpeed + radialPull) + perpY * tangentialSwirl;

      s.rVel.x += (targetAx - s.rVel.x * 2.1) * dt;
      s.rVel.y += (targetAy - s.rVel.y * 2.1) * dt;

      const prevRx = rx;
      const prevRy = ry;

      rx += s.rVel.x * dt;
      ry += s.rVel.y * dt;

      s.rPos.x = rx / width;
      s.rPos.y = ry / height;

      const isClose = dist < orbitR + 28;
      if (isClose && !s.hasReached) {
        s.hasReached = true;
        if (!s.chimeTriggered) {
          s.chimeTriggered = true;
          nocturneAudio.triggerStarChime(0.85);
          onResonanceChange?.(1.0);
        }
      }

      // Determine narrative stage
      if (s.hasReached) {
        setStageIndex(2);
      } else if (dist < Math.min(width, height) * 0.38) {
        setStageIndex(1);
      } else {
        setStageIndex(0);
      }

      // Draw trails into offscreen buffer
      trailCtx.fillStyle = 'rgba(7, 8, 17, 0.08)';
      trailCtx.fillRect(0, 0, width, height);

      const rCol = s.hasReached ? 232 : Math.round(155 + (1 - dist / width) * 75);
      const gCol = s.hasReached ? 195 : Math.round(170 + (1 - dist / width) * 25);
      const bCol = s.hasReached ? 145 : Math.round(215 - (1 - dist / width) * 70);

      trailCtx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, 0.85)`;
      trailCtx.lineWidth = 2.2;
      trailCtx.lineCap = 'round';
      trailCtx.beginPath();
      trailCtx.moveTo(prevRx, prevRy);
      trailCtx.lineTo(rx, ry);
      trailCtx.stroke();

      // Render main canvas
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(trailCanvas, 0, 0, width, height);

      // Subtle golden connection filament when close
      if (dist < 120) {
        const filamentAlpha = Math.max(0, 1 - dist / 120) * 0.45;
        ctx.strokeStyle = `rgba(232, 195, 145, ${filamentAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // Draw Roberto's Star
      const rGlow = ctx.createRadialGradient(rx, ry, 1, rx, ry, 18);
      rGlow.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, 0.95)`);
      rGlow.addColorStop(1, 'rgba(150, 166, 215, 0)');
      ctx.fillStyle = rGlow;
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F4EFEA';
      ctx.beginPath();
      ctx.arc(rx, ry, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Roberto Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(244, 239, 234, 0.88)';
      const rLabel = s.hasReached ? 'Roberto' : 'Roberto (buscándote)';
      const rW = ctx.measureText(rLabel).width;
      const rLabelX = Math.max(8, Math.min(width - rW - 8, rx - rW * 0.5));
      ctx.fillText(rLabel, rLabelX, ry + 16);

      // Draw Kimberly's Star
      const kHalo = 34;
      const kGlow = ctx.createRadialGradient(kx, ky, 2, kx, ky, kHalo);
      kGlow.addColorStop(0, 'rgba(248, 224, 188, 0.98)');
      kGlow.addColorStop(0.45, 'rgba(201, 91, 114, 0.42)');
      kGlow.addColorStop(1, 'rgba(201, 91, 114, 0)');
      ctx.fillStyle = kGlow;
      ctx.beginPath();
      ctx.arc(kx, ky, kHalo, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF4E4';
      ctx.beginPath();
      ctx.arc(kx, ky, 5.8, 0, Math.PI * 2);
      ctx.fill();

      // Kimberly Label
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#E8C391';
      const kLabel = '✦ Kimberly';
      const kW = ctx.measureText(kLabel).width;
      const kLabelX = Math.max(8, Math.min(width - kW - 8, kx - kW * 0.5));
      ctx.fillText(kLabel, kLabelX, ky - 14);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [onResonanceChange]);

  const stages = [
    {
      badge: 'CUANDO ESTÁS LEJOS',
      quote:
        '“Mil problemas buscando solución, planes a toda velocidad y una mente que no sabe estarse quieta.”',
    },
    {
      badge: 'CUANDO APARECES',
      quote:
        '“El ruido empieza a perder fuerza. Todo lo demás pasa a segundo plano y el tiempo cambia de ritmo.”',
    },
    {
      badge: 'CONTIGO',
      quote:
        '“Exactamente esto haces en mí: conviertes todo mi caos en un solo lugar tranquilo del que nunca me quiero ir.”',
    },
  ];

  const currentStage = stages[stageIndex];

  return (
    <section
      ref={sectionRef}
      id="observatorio"
      aria-label="Lo que pasa en mi cabeza cuando te acercas"
      className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="smoked-glass rounded-3xl p-6 sm:p-10">
        <div className="mb-6 max-w-xl">
          <h2 className="font-display text-3xl sm:text-4xl font-light text-[#F4EFEA] leading-tight">
            Lo que pasa en mi cabeza cuando te acercas.
          </h2>
        </div>

        {/* Autonomous 60fps Canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E8C391]/20 bg-[#070811]">
          <canvas
            ref={canvasRef}
            className="block h-[270px] sm:h-[350px] w-full"
          />
        </div>

        {/* Dynamic Confession Readout Driven by Autonomous Position */}
        <div className="mt-6 rounded-2xl border border-[#E8C391]/15 bg-[#06070D]/55 p-5 sm:p-6 text-center transition-all duration-500">
          <span className="font-mono-tech text-[10px] tracking-[0.24em] text-[#C95B72] uppercase block mb-2">
            {currentStage.badge}
          </span>
          <p className="font-display italic text-xl sm:text-2xl text-[#F4EFEA] font-light leading-relaxed">
            {currentStage.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
