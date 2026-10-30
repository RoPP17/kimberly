import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const PHOTO_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const PHOTO_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPhoto;
  uniform sampler2D uDepth;
  uniform vec2 uOffset;
  uniform float uTime;

  void main() {
    float depth = texture2D(uDepth, vUv).r;

    // Smooth depth-guided parallax displacement
    vec2 shift = uOffset * (depth - 0.45) * 0.034;
    vec2 displacedUv = clamp(vUv - shift, 0.004, 0.996);

    vec4 tex = texture2D(uPhoto, displacedUv);
    vec3 col = tex.rgb;

    // Subtle moving warm glass specular sheen
    float diag = (vUv.x * 0.8 + vUv.y * 0.6) - (0.35 + uOffset.x * 0.45 + sin(uTime * 0.45) * 0.12);
    float sheen = exp(-diag * diag * 18.0) * 0.055;
    col += vec3(0.95, 0.82, 0.64) * sheen;

    // Gentle darkroom edge vignette
    vec2 c = vUv - 0.5;
    float vig = smoothstep(0.82, 0.25, length(c));
    col *= mix(0.84, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function DepthParallaxPhoto({ webp, jpg, depth, alt, onOpen }) {
  const wrapRef = useRef(null);
  const canvasHostRef = useRef(null);
  const [shaderReady, setShaderReady] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1100px) rotateX(0deg) rotateY(0deg)' });
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return undefined;

    let disposed = false;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth || 500, host.clientHeight || 500);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    let photoTex = null;
    let depthTex = null;
    let loadedCount = 0;

    const uniforms = {
      uPhoto: { value: null },
      uDepth: { value: null },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: PHOTO_VERTEX,
      fragmentShader: PHOTO_FRAGMENT,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    const checkReady = () => {
      loadedCount += 1;
      if (loadedCount === 2 && !disposed) {
        uniforms.uPhoto.value = photoTex;
        uniforms.uDepth.value = depthTex;
        setShaderReady(true);
      }
    };

    photoTex = loader.load(jpg, checkReady);
    photoTex.minFilter = THREE.LinearFilter;
    photoTex.magFilter = THREE.LinearFilter;

    depthTex = loader.load(depth, checkReady);
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;

    const ro = new ResizeObserver(() => {
      if (!host || disposed) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
      }
    });
    ro.observe(host);

    let rafId = 0;
    const start = performance.now();
    const currentOffset = new THREE.Vector2(0, 0);

    const renderLoop = (now) => {
      rafId = requestAnimationFrame(renderLoop);
      const t = (now - start) / 1000;
      uniforms.uTime.value = t;

      // Autonomous gentle figure-8 breathing when untouched, or responsive parallax on touch/hover
      const targetX = pointerRef.current.active
        ? pointerRef.current.x
        : Math.sin(t * 0.65) * 0.38;
      const targetY = pointerRef.current.active
        ? pointerRef.current.y
        : Math.cos(t * 0.48) * 0.28;

      currentOffset.x += (targetX - currentOffset.x) * 0.08;
      currentOffset.y += (targetY - currentOffset.y) * 0.08;
      uniforms.uOffset.value.copy(currentOffset);

      if (uniforms.uPhoto.value && uniforms.uDepth.value) {
        renderer.render(scene, camera);
      }
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (photoTex) photoTex.dispose();
      if (depthTex) depthTex.dispose();
      quad.geometry.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [jpg, depth]);

  const handlePointerMove = (clientX, clientY) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    pointerRef.current = {
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
      active: true,
    };
    setTiltStyle({
      transform: `perspective(1100px) rotateX(${(ny * 4.2).toFixed(2)}deg) rotateY(${(nx * 4.8).toFixed(2)}deg)`,
    });
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    setTiltStyle({
      transform: 'perspective(1100px) rotateX(0deg) rotateY(0deg)',
    });
  };

  return (
    <div
      ref={wrapRef}
      onClick={onOpen}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseLeave={handlePointerLeave}
      onTouchMove={(e) => {
        if (e.touches && e.touches[0]) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handlePointerLeave}
      style={tiltStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
      aria-label={alt}
      className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E8C391]/25 bg-[#0B0D18] shadow-[0_30px_90px_-15px_rgba(201,91,114,0.28)] transition-transform duration-300 ease-out"
    >
      {/* Crisp progressive picture fallback always ready underneath */}
      <picture className={`block h-full w-full transition-opacity duration-700 ${shaderReady ? 'opacity-0' : 'opacity-100'}`}>
        <source srcSet={webp} type="image/webp" />
        <img
          src={jpg}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </picture>

      {/* Live 3D Depth-Parallax GLSL Canvas */}
      <div
        ref={canvasHostRef}
        className={`absolute inset-0 transition-opacity duration-700 ${shaderReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Subtle corner astronomical frame ticks */}
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-[#F4EFEA]/10 transition-colors duration-500 group-hover:border-[#E8C391]/35" />
      <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[#06070D]/70 px-3 py-1 backdrop-blur-md border border-[#E8C391]/20">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E8C391] animate-pulse" />
        <span className="font-mono-tech text-[10px] tracking-[0.18em] text-[#E8C391]/90 uppercase">
           Lente 3D · Toca para ampliar
        </span>
      </div>
    </div>
  );
}
