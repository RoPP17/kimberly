import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LETTER_STANZAS } from './data/universeData';
import { nocturneAudio } from './audio/nocturneAudioEngine';
import HarmonicCosmosCanvas from './webgl/HarmonicCosmosCanvas';
import TopObservatoryBar from './components/TopObservatoryBar';
import LetterAct from './components/LetterAct';
import TimeDilationPortal from './components/TimeDilationPortal';
import MemoriesAct from './components/MemoriesAct';
import TwoBodyObservatory from './components/TwoBodyObservatory';
import CertaintiesAndFinale from './components/CertaintiesAndFinale';

export default function App() {
  const [activeStanza, setActiveStanza] = useState(LETTER_STANZAS[0]);
  const [cosmosState, setCosmosState] = useState(LETTER_STANZAS[0].shaderState);
  const [supernovaPulse, setSupernovaPulse] = useState(0);
  const [audioMode, setAudioMode] = useState('muted');
  const autoAwakenedRef = useRef(false);

  useEffect(() => {
    const unsub = nocturneAudio.subscribe((mode) => setAudioMode(mode));
    return unsub;
  }, []);

  // Gentle auto-awakening of the felt-piano nocturne on her very first intentional tap/click
  useEffect(() => {
    const awakenOnFirstGesture = (e) => {
      if (autoAwakenedRef.current) return;
      // Avoid double-triggering if she explicitly clicked the audio toggle button itself
      if (e.target && e.target.closest && e.target.closest('header')) {
        autoAwakenedRef.current = true;
        return;
      }
      autoAwakenedRef.current = true;
      if (nocturneAudio.mode === 'muted') {
        nocturneAudio.startNocturne();
      }
    };

    window.addEventListener('pointerdown', awakenOnFirstGesture, { once: true, passive: true });
    return () => window.removeEventListener('pointerdown', awakenOnFirstGesture);
  }, []);

  const handleStanzaVisible = useCallback((stanza) => {
    setActiveStanza(stanza);
    setCosmosState(stanza.shaderState);
    nocturneAudio.setHarmony(stanza.shaderState.harmony);
  }, []);

  const triggerSupernova = useCallback(() => {
    setSupernovaPulse((c) => c + 1);
  }, []);

  const handlePortalActivated = useCallback(() => {
    setSupernovaPulse((c) => c + 1);
    setCosmosState({
      harmony: 1.0,
      warmth: 0.92,
      dawn: 0.55,
      bloom: 1.35,
      timeScale: 0.08,
    });
    window.setTimeout(() => {
      document.getElementById('memorias')?.scrollIntoView({ behavior: 'smooth' });
    }, 650);
  }, []);

  const handleResonanceChange = useCallback((closeness) => {
    nocturneAudio.setHarmony(0.45 + closeness * 0.55);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Real-Time 60fps Three.js + Custom GLSL Shaders + UnrealBloom Cosmos */}
      <HarmonicCosmosCanvas
        targetState={cosmosState}
        supernovaPulse={supernovaPulse}
      />

      {/* Top Kinematic Telemetry & Dual-Mode Soundscape Bar */}
      <TopObservatoryBar
        omega={activeStanza.omegaValue}
        telemetryTag={activeStanza.telemetryTag}
        audioMode={audioMode}
        onCycleAudio={() => {
          autoAwakenedRef.current = true;
          nocturneAudio.cycleMode();
        }}
        onMuteAudio={() => {
          autoAwakenedRef.current = true;
          nocturneAudio.mute();
        }}
      />

      {/* Narrative Journey */}
      <main className="relative z-10">
        {/* ACT I — IMMEDIATELY VISIBLE: ROBERTO'S VERBATIM 6-STANZA LETTER */}
        <LetterAct
          activeStanzaId={activeStanza.id}
          onStanzaVisible={handleStanzaVisible}
          onHeartbeatPulse={triggerSupernova}
        />

        {/* INTERLUDE — HOLD TO DILATE TIME PORTAL */}
        <TimeDilationPortal onPortalActivated={handlePortalActivated} />

        {/* ACT II — 3D DEPTH-PARALLAX & DARKROOM MEMORIES */}
        <MemoriesAct />

        {/* ACT III — INTERACTIVE TWO-BODY HARMONIC OBSERVATORY */}
        <TwoBodyObservatory onResonanceChange={handleResonanceChange} />

        {/* ACT IV & V — FIVE CERTAINTIES, CELESTIAL STAR CAPSULE & SECRET P.D. */}
        <CertaintiesAndFinale onTriggerSupernova={triggerSupernova} />
      </main>
    </div>
  );
}
