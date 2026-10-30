/**
 * Background Audio Controller for Sui Generis - Quizás, Porque.
 * Provides smooth fade-in, mobile-safe play on first interaction, and optional gentle chimes.
 */

class BackgroundAudioEngine {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.listeners = new Set();
    this.ctx = null;
    this.initAudio();
  }

  initAudio() {
    if (typeof window === 'undefined') return;
    this.audio = new Audio('./assets/audio/sui-generis-quizas-porque.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.65;
    this.audio.preload = 'auto';

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this.isPlaying);
    }
  }

  ensureContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  play() {
    if (!this.audio) this.initAudio();
    if (!this.audio) return;
    this.ensureContext();
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.notify();
        })
        .catch(() => {
          this.isPlaying = false;
          this.notify();
        });
    }
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setHarmony(_val) {
    // Kept for interface compatibility
  }

  triggerStarChime(normalizedIndex = 0.5) {
    try {
      this.ensureContext();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const idx = Math.min(notes.length - 1, Math.max(0, Math.floor(normalizedIndex * notes.length)));
      const freq = notes[idx];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  triggerSupernovaChord() {
    try {
      this.ensureContext();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      const now = this.ctx.currentTime;
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.045, now + i * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 2.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 2.5);
      });
    } catch {
      // ignore
    }
  }
}

export const nocturneAudio = new BackgroundAudioEngine();
