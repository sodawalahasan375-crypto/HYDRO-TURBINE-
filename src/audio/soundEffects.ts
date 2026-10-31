/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound synthesis and Web Speech API narration

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private speechMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private waterGain: GainNode | null = null;
  private waterSource: AudioBufferSourceNode | null = null;
  private turbineGain: GainNode | null = null;
  private turbineOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupContinuousNodes();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private setupContinuousNodes() {
    if (!this.ctx) return;

    // 1. Water rushing pink noise generator
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      this.waterSource = this.ctx.createBufferSource();
      this.waterSource.buffer = noiseBuffer;
      this.waterSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.value = 0;

      this.waterSource.connect(filter);
      filter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      this.waterSource.start(0);

      // 2. Turbine spinning whir oscillator
      this.turbineOsc = this.ctx.createOscillator();
      this.turbineOsc.type = 'triangle';
      this.turbineOsc.frequency.value = 80;

      this.turbineGain = this.ctx.createGain();
      this.turbineGain.gain.value = 0;

      this.turbineOsc.connect(this.turbineGain);
      this.turbineGain.connect(this.ctx.destination);
      this.turbineOsc.start(0);

      // 3. Electrical 50/60Hz hum oscillator
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.value = 100;

      this.humGain = this.ctx.createGain();
      this.humGain.gain.value = 0;

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.value = 220;

      this.humOsc.connect(humFilter);
      humFilter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      this.humOsc.start(0);
    } catch {
      // Audio node failure fallback
    }
  }

  public updateSimulationAudio(flowPercent: number, rpm: number, watts: number) {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Water volume based on flow
    if (this.waterGain) {
      const targetGain = (flowPercent / 100) * 0.22;
      this.waterGain.gain.setTargetAtTime(targetGain, now, 0.1);
    }

    // Turbine pitch and volume based on RPM
    if (this.turbineGain && this.turbineOsc) {
      const targetGain = Math.min(0.12, (rpm / 1500) * 0.12);
      const targetFreq = 40 + (rpm / 1500) * 260; // 40Hz to 300Hz
      this.turbineGain.gain.setTargetAtTime(targetGain, now, 0.1);
      this.turbineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    }

    // Electrical hum volume based on generated watts
    if (this.humGain && this.humOsc) {
      const targetGain = Math.min(0.08, (watts / 70) * 0.08);
      this.humGain.gain.setTargetAtTime(targetGain, now, 0.1);
    }
  }

  public playClick() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  public playSuccessChime() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = this.ctx!.currentTime + idx * 0.09;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch {
      // ignore
    }
  }

  public speak(text: string, lang: 'en' | 'hi' = 'en', onEnd?: () => void) {
    if (this.speechMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public setSoundMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      if (this.waterGain) this.waterGain.gain.value = 0;
      if (this.turbineGain) this.turbineGain.gain.value = 0;
      if (this.humGain) this.humGain.gain.value = 0;
    }
  }

  public setSpeechMuted(muted: boolean) {
    this.speechMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public isSpeechMuted(): boolean {
    return this.speechMuted;
  }
}

export const soundManager = new SoundManager();
