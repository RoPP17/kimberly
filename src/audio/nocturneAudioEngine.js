/**
 * Nocturne Generative Felt-Piano, Warm Cello Pad & Real-Song Soundscape Engine.
 * Built with Web Audio API + algorithmic velvet-impulse convolution reverb.
 */

class NocturneAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.dryGain = null;
    this.wetGain = null;

    // Modes: 'muted' | 'nocturne' | 'song'
    this.mode = 'muted';
    this.chordTimer = null;
    this.chordIndex = 0;
    this.harmonyFactor = 0.5;
    this.songAudio = null;
    this.listeners = new Set();

    // Lush nocturnal voicings (MIDI notes):
    // Dbmaj9 -> Bbm11 -> Gbmaj7(#11) -> Ab6sus4
    this.progression = [
      { bass: 49, pad: [53, 56, 60], notes: [61, 65, 68, 72, 75] }, // Db3 | F3 Ab3 C4 | Db4 F4 Ab4 C5 Eb5
      { bass: 46, pad: [53, 58, 61], notes: [58, 63, 65, 68, 73] }, // Bb2 | F3 Bb3 Db4 | Bb3 Eb4 F4 Ab4 Db5
      { bass: 42, pad: [49, 54, 58], notes: [61, 65, 66, 70, 72] }, // Gb2 | Db3 Gb3 Bb3 | Db4 F4 Gb4 Bb4 C5
      { bass: 44, pad: [51, 54, 56], notes: [61, 63, 65, 68, 73] }, // Ab2 | Eb3 Gb3 Ab3 | Db4 Eb4 F4 Ab4 Db5
    ];

    // Pentatonic / Lydian shimmer scale in Db major for interactive star touches
    this.sparkleScale = [61, 63, 65, 68, 70, 72, 73, 75, 77, 80];
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this.mode);
    }
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.58;
    this.dryGain.connect(this.masterGain);

    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.64;

    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createVelvetImpulse(3.6, 2.4);
    this.reverbNode.connect(this.wetGain);
    this.wetGain.connect(this.masterGain);
  }

  createVelvetImpulse(durationSec = 3.5, decay = 2.3) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * durationSec);
    const impulse = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        // Warm low-pass filtered velvet noise for concert-hall wooden warmth
        const white = (Math.random() * 2 - 1) * env;
        lp = lp * 0.78 + white * 0.22;
        data[i] = lp * 0.85;
      }
    }
    return impulse;
  }

  setHarmony(factor) {
    this.harmonyFactor = Math.max(0, Math.min(1, factor));
  }

  playFeltPianoNote(midi, delaySec = 0, velocity = 0.16, duration = 3.8) {
    if (!this.ctx || this.mode !== 'nocturne') return;

    const now = this.ctx.currentTime + delaySec;
    const freq = this.midiToFreq(midi);

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(velocity, now + 0.024);
    voiceGain.gain.exponentialRampToValueAtTime(velocity * 0.36, now + 0.65);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const topCutoff = 920 + this.harmonyFactor * 780;
    filter.frequency.setValueAtTime(topCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(290, now + duration * 0.82);
    filter.Q.value = 0.7;

    // Fundamental + subtly detuned warm 2nd harmonic
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, now);
    osc2.detune.setValueAtTime(3.2, now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.32;

    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, now);
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.075, now);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(voiceGain);
    voiceGain.connect(this.dryGain);
    voiceGain.connect(this.reverbNode);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    const stopAt = now + duration + 0.08;
    osc1.stop(stopAt);
    osc2.stop(stopAt);
    osc3.stop(stopAt);
  }

  playWarmCelloPad(midiNotes, duration = 5.4) {
    if (!this.ctx || this.mode !== 'nocturne') return;
    const now = this.ctx.currentTime;

    midiNotes.forEach((midi, idx) => {
      const freq = this.midiToFreq(midi);
      const gain = this.ctx.createGain();
      const peak = idx === 0 ? 0.055 : 0.032;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 1.85);
      gain.gain.setValueAtTime(peak, now + duration - 1.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.4);

      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(260 + this.harmonyFactor * 160, now);
      lp.Q.value = 0.6;

      const oscA = this.ctx.createOscillator();
      oscA.type = 'sawtooth';
      oscA.frequency.setValueAtTime(freq, now);
      oscA.detune.setValueAtTime(-5, now);

      const oscB = this.ctx.createOscillator();
      oscB.type = 'triangle';
      oscB.frequency.setValueAtTime(freq, now);
      oscB.detune.setValueAtTime(5, now);

      oscA.connect(lp);
      oscB.connect(lp);
      lp.connect(gain);
      gain.connect(this.reverbNode);
      gain.connect(this.dryGain);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + duration + 0.5);
      oscB.stop(now + duration + 0.5);
    });
  }

  scheduleNextChord() {
    if (this.mode !== 'nocturne' || !this.ctx) return;

    const voicing = this.progression[this.chordIndex % this.progression.length];
    this.chordIndex += 1;

    // Warm cello foundation
    this.playWarmCelloPad([voicing.bass, ...voicing.pad], 5.6);

    // Delicate arpeggiated felt-piano notes with human rubato timing
    voicing.notes.forEach((note, i) => {
      const rubato = i * 0.46 + (Math.random() * 0.08 - 0.04);
      const vel = 0.115 - i * 0.011;
      this.playFeltPianoNote(note, Math.max(0.02, rubato), Math.max(0.055, vel), 4.3);
    });

    // Occasional high starlight grace note when harmony is high
    if (this.harmonyFactor > 0.55) {
      const grace = voicing.notes[voicing.notes.length - 1] + 12;
      this.playFeltPianoNote(grace, 2.85, 0.048, 4.2);
    }

    this.chordTimer = window.setTimeout(() => this.scheduleNextChord(), 5400);
  }

  triggerStarChime(normalizedIndex = 0.5) {
    if (!this.ctx || this.mode !== 'nocturne') return;
    const idx = Math.min(
      this.sparkleScale.length - 1,
      Math.max(0, Math.floor(normalizedIndex * this.sparkleScale.length))
    );
    this.playFeltPianoNote(this.sparkleScale[idx], 0, 0.075, 3.2);
  }

  triggerSupernovaChord() {
    if (!this.ctx) {
      this.startNocturne();
    }
    if (!this.ctx || this.mode === 'muted') return;
    if (this.mode === 'nocturne') {
      const notes = [61, 65, 68, 72, 75, 80];
      notes.forEach((n, i) => {
        this.playFeltPianoNote(n, i * 0.13, 0.095, 5.2);
      });
    }
  }

  stopTimersAndSong() {
    if (this.chordTimer) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.songAudio) {
      this.songAudio.pause();
    }
  }

  startNocturne() {
    this.ensureContext();
    if (!this.ctx) return;
    this.stopTimersAndSong();

    this.mode = 'nocturne';
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(0.82, now + 2.1);

    this.scheduleNextChord();
    this.notify();
  }

  startSong() {
    this.ensureContext();
    this.stopTimersAndSong();

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }

    if (!this.songAudio) {
      this.songAudio = new Audio('./assets/audio/nuestra-cancion.mp3');
      this.songAudio.loop = true;
      this.songAudio.volume = 0.52;
    }

    this.mode = 'song';
    this.songAudio.play().catch(() => {
      // Fallback gracefully to generative nocturne if MP3 playback is blocked
      this.startNocturne();
    });
    this.notify();
  }

  mute() {
    this.stopTimersAndSong();
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    }
    this.mode = 'muted';
    this.notify();
  }

  cycleMode() {
    if (this.mode === 'muted') {
      this.startNocturne();
    } else if (this.mode === 'nocturne') {
      this.startSong();
    } else {
      this.mute();
    }
  }
}

export const nocturneAudio = new NocturneAudioEngine();
