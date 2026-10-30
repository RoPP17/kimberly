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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const autoAwakenedRef = useRef(false);

  useEffect(() => {
    const unsub = nocturneAudio.subscribe((playing) => setIsPlayingAudio(playing));
    return unsub;
  }, []);

  // Gentle auto-start of Sui Generis on her first touch anywhere on the phone
  useEffect(() => {
    const awakenOnFirstGesture = () => {
      if (autoAwakenedRef.current) return;
      autoAwakenedRef.current = true;
      nocturneAudio.play();
    };

    window.addEventListener('pointerdown', awakenOnFirstGesture, { once: true, passive: true });
    window.addEventListener('scroll', awakenOnFirstGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', awakenOnFirstGesture);
      window.removeEventListener('scroll', awakenOnFirstGesture);
    };
  }, []);

  const handleStanzaVisible = useCallback((stanza) => {
    setActiveStanza(stanza);
    setCosmosState(stanza.shaderState);
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
    // Keeps shader bloom responsive to physical closeness
    setCosmosState((prev) => ({
      ...prev,
      harmony: Math.min(1.0, 0.5 + closeness * 0.5),
      warmth: Math.min(1.0, 0.4 + closeness * 0.6),
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Real-Time 60fps Three.js + Custom GLSL Shaders + UnrealBloom Cosmos */}
      <HarmonicCosmosCanvas
        targetState={cosmosState}
        supernovaPulse={supernovaPulse}
      />

      {/* Top Bar with Sui Generis Background Player */}
      <TopObservatoryBar
        isPlaying={isPlayingAudio}
        onToggleAudio={() => {
          autoAwakenedRef.current = true;
          nocturneAudio.toggle();
        }}
      />

      {/* Narrative Journey */}
      <main className="relative z-10">
        {/* ACT I — ROBERTO'S VERBATIM 6-STANZA LETTER */}
        <LetterAct
          activeStanzaId={activeStanza.id}
          onStanzaVisible={handleStanzaVisible}
          onHeartbeatPulse={triggerSupernova}
        />

        {/* INTERLUDE — HOLD TO DILATE TIME PORTAL */}
        <TimeDilationPortal onPortalActivated={handlePortalActivated} />

        {/* ACT II — MEMORIES IN 3D OPTICAL GLASS (ANTHONY PHOTO) */}
        <MemoriesAct />

        {/* ACT III — AUTONOMOUS TWO-BODY OBSERVATORY (ROBERTO PURSUING KIMBERLY) */}
        <TwoBodyObservatory onResonanceChange={handleResonanceChange} />

        {/* ACT IV & V — FIVE CERTAINTIES (RELATIVITY / LORENTZ INVARIANT) & KEEPSAKE */}
        <CertaintiesAndFinale onTriggerSupernova={triggerSupernova} />
      </main>
    </div>
  );
}
