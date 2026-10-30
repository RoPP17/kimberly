import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const SKY_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWarmth;
  uniform float uDawn;
  uniform float uSupernova;
  uniform vec2 uPointer;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);

    vec3 obsidian = vec3(0.023, 0.027, 0.051);
    vec3 amethyst = vec3(0.095, 0.068, 0.175);
    vec3 carmenere = vec3(0.42, 0.14, 0.22);
    vec3 champagne = vec3(0.88, 0.71, 0.49);

    float slowT = uTime * 0.035;
    float neb1 = fbm(centered * 1.45 + vec2(slowT, -slowT * 0.6));
    float neb2 = fbm(centered * 2.6 - vec2(slowT * 0.7, slowT * 0.4) + neb1 * 0.65);

    vec3 col = mix(obsidian, amethyst, smoothstep(0.22, 0.85, neb1) * 0.72);
    col = mix(col, carmenere * 0.52, smoothstep(0.38, 0.92, neb2) * (0.22 + 0.36 * uWarmth));

    // Rising twilight-dawn horizon (echoing the Carmenere twilight-gold horizon)
    float horizonMask = smoothstep(0.62, 0.0, uv.y);
    vec3 dawnGlow = mix(carmenere * 0.55, champagne * 0.48, smoothstep(0.38, 0.0, uv.y));
    col += dawnGlow * horizonMask * (0.12 + 0.55 * uDawn);

    // Subtle touch/cursor warm presence halo
    vec2 ptr = (uPointer * 0.5 + 0.5 - 0.5) * vec2(aspect, 1.0);
    float dPtr = length(centered - ptr);
    col += mix(carmenere, champagne, 0.6) * exp(-dPtr * 3.1) * 0.09;

    // Supernova celebration radiance
    float centerDist = length(centered);
    col += champagne * exp(-centerDist * 1.9) * uSupernova * 0.34;

    // Subtle vignette
    float vig = smoothstep(1.38, 0.28, centerDist);
    col *= mix(0.68, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const PARTICLE_VERTEX = /* glsl */ `
  attribute vec3 aChaos;
  attribute vec3 aHarmonic;
  attribute vec3 aSeed;

  uniform float uTime;
  uniform float uFlowTime;
  uniform float uHarmony;
  uniform float uWarmth;
  uniform float uSupernova;
  uniform float uPixelRatio;
  uniform vec2 uPointerWorld;

  varying float vTemp;
  varying float vAlpha;
  varying float vProximity;

  void main() {
    float phase = aSeed.x * 6.2831853;
    float speed = 0.45 + aSeed.y * 0.85;

    // State A: Restless kinetic trajectories (Roberto's non-stop thoughts)
    vec3 chaosPos = aChaos;
    chaosPos.x += sin(uFlowTime * speed * 1.7 + phase) * 1.35 + cos(uFlowTime * 0.9 + aChaos.y) * 0.55;
    chaosPos.y += cos(uFlowTime * speed * 1.4 + phase * 1.3) * 1.15 + sin(uFlowTime * 1.1 + aChaos.x) * 0.55;
    chaosPos.z += sin(uFlowTime * speed + phase * 0.7) * 0.95;

    // State B: Serene golden-ratio rose-harmonic sanctuary orbit (Kimberly's presence)
    float angle = uTime * (0.075 + aSeed.y * 0.05) + phase * 0.15;
    float ca = cos(angle);
    float sa = sin(angle);
    vec3 harmPos = vec3(
      aHarmonic.x * ca - aHarmonic.y * sa,
      aHarmonic.x * sa + aHarmonic.y * ca,
      aHarmonic.z + sin(uTime * 0.55 + phase) * 0.18
    );

    // Local pointer stillness field: particles near touch calm down even earlier
    vec3 baseMix = mix(chaosPos, harmPos, smoothstep(0.0, 1.0, uHarmony));
    float distToPtr = length(baseMix.xy - uPointerWorld);
    float ptrInfluence = exp(-distToPtr * 0.55);

    vec3 pos = mix(baseMix, harmPos, ptrInfluence * 0.65);

    // Gentle orbital attraction ring around touch point
    vec2 dirPtr = pos.xy - uPointerWorld;
    float dLen = max(0.001, length(dirPtr));
    vec2 tangent = vec2(-dirPtr.y, dirPtr.x) / dLen;
    pos.xy += tangent * ptrInfluence * 0.22;

    // Supernova ripple expansion when time stops or star is lit
    float radial = length(pos.xy) + 0.001;
    pos.xy += (pos.xy / radial) * sin(uSupernova * 3.14159) * (1.25 + aSeed.z * 1.4);
    pos.z += sin(uSupernova * 3.14159) * aSeed.x * 0.9;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float baseSize = mix(14.0, 28.0, aSeed.z) * (1.0 + ptrInfluence * 0.45 + uSupernova * 0.55);
    gl_PointSize = clamp(baseSize * uPixelRatio / max(1.2, -mvPosition.z), 1.2, 22.0);

    vTemp = clamp(aSeed.z * 0.55 + uWarmth * 0.55 + ptrInfluence * 0.35, 0.0, 1.0);
    vProximity = ptrInfluence;
    float depthFade = smoothstep(22.0, 3.0, -mvPosition.z);
    vAlpha = depthFade * (0.38 + 0.52 * aSeed.y + 0.25 * uSupernova);
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  precision highp float;
  varying float vTemp;
  varying float vAlpha;
  varying float vProximity;

  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;

    // Optical Airy-disk starlight kernel
    float core = exp(-r2 * 7.2);
    float halo = exp(-r2 * 2.1) * 0.42;
    float intensity = core + halo;

    vec3 silverMist = vec3(0.68, 0.72, 0.88);
    vec3 carmenereRose = vec3(0.88, 0.43, 0.54);
    vec3 champagneGold = vec3(0.97, 0.84, 0.64);

    vec3 col = mix(silverMist, carmenereRose, smoothstep(0.15, 0.62, vTemp));
    col = mix(col, champagneGold, smoothstep(0.48, 0.98, vTemp + vProximity * 0.3));

    gl_FragColor = vec4(col * (1.0 + core * 0.55), intensity * vAlpha);
  }
`;

export default function HarmonicCosmosCanvas({ targetState, supernovaPulse }) {
  const containerRef = useRef(null);
  const stateRef = useRef(targetState);
  const supernovaRef = useRef(0);

  useEffect(() => {
    stateRef.current = targetState;
  }, [targetState]);

  useEffect(() => {
    if (supernovaPulse > 0) {
      supernovaRef.current = 1.0;
    }
  }, [supernovaPulse]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = prefersReducedMotion ? 3500 : isMobile ? 8500 : 15000;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return undefined;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    container.appendChild(renderer.domElement);

    // 1. Background GLSL Sky Shader Quad
    const skyUniforms = {
      uTime: { value: 0 },
      uWarmth: { value: 0.25 },
      uDawn: { value: 0.05 },
      uSupernova: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const skyMat = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      depthWrite: false,
      depthTest: false,
    });
    const skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), skyMat);
    skyMesh.frustumCulled = false;
    scene.add(skyMesh);

    // 2. GPU Particle Sanctuary
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const chaosArr = new Float32Array(PARTICLE_COUNT * 3);
    const harmonicArr = new Float32Array(PARTICLE_COUNT * 3);
    const seedArr = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const r1 = Math.random();
      const r2 = Math.random();
      const r3 = Math.random();

      seedArr[i3] = r1;
      seedArr[i3 + 1] = r2;
      seedArr[i3 + 2] = r3;

      // Chaotic scattered volume
      const cTheta = r1 * Math.PI * 2;
      const cRad = 1.2 + Math.pow(r2, 0.7) * 11.5;
      chaosArr[i3] = Math.cos(cTheta) * cRad + (r3 - 0.5) * 3.5;
      chaosArr[i3 + 1] = Math.sin(cTheta) * cRad * 0.75 + (r1 - 0.5) * 3.0;
      chaosArr[i3 + 2] = (r3 - 0.5) * 9.0;

      // Harmonic rose-curve + concentric celestial rings
      const t = (i / PARTICLE_COUNT) * Math.PI * 12;
      let hx;
      let hy;
      let hz;

      if (i % 5 === 0) {
        // Parametric 5/3 rose harmonic curve (matching our keepsake art print!)
        const roseR = 3.9 * Math.cos((5.0 / 3.0) * t) + 0.55 * Math.sin(2.0 * t);
        const jitter = (r2 - 0.5) * 0.22;
        hx = (roseR + jitter) * Math.cos(t);
        hy = (roseR + jitter) * Math.sin(t);
        hz = (r3 - 0.5) * 0.9;
      } else {
        // Golden-ratio orbital shells
        const ringIdx = i % 6;
        const ringRadii = [1.35, 2.25, 3.4, 4.75, 6.3, 8.2];
        const baseR = ringRadii[ringIdx] + (r2 - 0.5) * 0.42;
        const ang = r1 * Math.PI * 2;
        hx = Math.cos(ang) * baseR;
        hy = Math.sin(ang) * baseR * 0.88;
        hz = (r3 - 0.5) * 2.4;
      }

      harmonicArr[i3] = hx;
      harmonicArr[i3 + 1] = hy;
      harmonicArr[i3 + 2] = hz;

      positions[i3] = chaosArr[i3];
      positions[i3 + 1] = chaosArr[i3 + 1];
      positions[i3 + 2] = chaosArr[i3 + 2];
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aChaos', new THREE.BufferAttribute(chaosArr, 3));
    geo.setAttribute('aHarmonic', new THREE.BufferAttribute(harmonicArr, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 3));

    const particleUniforms = {
      uTime: { value: 0 },
      uFlowTime: { value: 0 },
      uHarmony: { value: 0.28 },
      uWarmth: { value: 0.22 },
      uSupernova: { value: 0 },
      uPixelRatio: { value: dpr },
      uPointerWorld: { value: new THREE.Vector2(99, 99) },
    };

    const particleMat = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, particleMat);
    scene.add(points);

    // 3. Post-Processing Pipeline (EffectComposer + UnrealBloomPass)
    let composer = null;
    let bloomPass = null;
    try {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.95,
        0.52,
        0.36
      );
      composer.addPass(bloomPass);
    } catch {
      composer = null;
    }

    // Smooth pointer tracking (works with touch & mouse without blocking scroll)
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    let pointerActive = false;

    const updatePointer = (clientX, clientY) => {
      pointerActive = true;
      pointerTarget.x = (clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseMove = (e) => updatePointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
      skyUniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop with smooth spring damping
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let flowTime = 0;

    const current = {
      harmony: 0.25,
      warmth: 0.22,
      dawn: 0.04,
      bloom: 0.95,
      timeScale: 0.72,
    };

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const tgt = stateRef.current || current;
      const lerpRate = 1 - Math.exp(-dt * 2.2);

      current.harmony += (tgt.harmony - current.harmony) * lerpRate;
      current.warmth += (tgt.warmth - current.warmth) * lerpRate;
      current.dawn += (tgt.dawn - current.dawn) * lerpRate;
      current.bloom += (tgt.bloom - current.bloom) * lerpRate;
      current.timeScale += (tgt.timeScale - current.timeScale) * lerpRate;

      if (supernovaRef.current > 0.001) {
        supernovaRef.current = Math.max(0, supernovaRef.current - dt * 0.42);
      } else {
        supernovaRef.current = 0;
      }

      elapsed += dt * (prefersReducedMotion ? 0.2 : 1.0);
      flowTime += dt * current.timeScale * (prefersReducedMotion ? 0.2 : 1.0);

      pointerCurrent.lerp(pointerTarget, 1 - Math.exp(-dt * 5.0));

      skyUniforms.uTime.value = elapsed;
      skyUniforms.uWarmth.value = current.warmth;
      skyUniforms.uDawn.value = current.dawn;
      skyUniforms.uSupernova.value = supernovaRef.current;
      skyUniforms.uPointer.value.copy(pointerCurrent);

      particleUniforms.uTime.value = elapsed;
      particleUniforms.uFlowTime.value = flowTime;
      particleUniforms.uHarmony.value = current.harmony;
      particleUniforms.uWarmth.value = current.warmth;
      particleUniforms.uSupernova.value = supernovaRef.current;

      if (pointerActive) {
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        particleUniforms.uPointerWorld.value.set(
          pointerCurrent.x * 6.0 * aspect,
          pointerCurrent.y * 5.8
        );
      }

      // Subtle camera parallax breathing
      camera.position.x = pointerCurrent.x * 0.42;
      camera.position.y = pointerCurrent.y * 0.32;
      camera.lookAt(0, 0, 0);

      if (bloomPass) {
        bloomPass.strength = current.bloom + supernovaRef.current * 0.65;
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      particleMat.dispose();
      skyMat.dispose();
      skyMesh.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    />
  );
}
