/**
 * Procedural sound design using the Web Audio API — no audio files required.
 * Everything is synthesized: a low ambient drone, a travel whoosh, and short UI blips.
 */
export class SpaceAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private enabledState = false;

  get enabled(): boolean {
    return this.enabledState;
  }

  /** Must be called from a user gesture to satisfy autoplay policies. */
  enable(): void {
    if (this.enabledState) return;
    try {
      if (!this.ctx) this.setup();
      this.ctx!.resume();
      this.enabledState = true;
      this.master!.gain.cancelScheduledValues(this.ctx!.currentTime);
      this.master!.gain.setTargetAtTime(0.8, this.ctx!.currentTime, 0.6);
    } catch (err) {
      console.warn('Audio unavailable', err);
    }
  }

  disable(): void {
    if (!this.enabledState || !this.ctx || !this.master) return;
    this.enabledState = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
  }

  toggle(): boolean {
    if (this.enabledState) this.disable();
    else this.enable();
    return this.enabledState;
  }

  playTravel(duration: number): void {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.45);
    filter.frequency.exponentialRampToValueAtTime(160, now + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(this.master!);
    source.start(now);
    source.stop(now + duration + 0.05);

    // Soft harmonic swell underneath the whoosh.
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + duration * 0.5);
    osc.frequency.exponentialRampToValueAtTime(96, now + duration);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.06, now + duration * 0.4);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(oscGain).connect(this.master!);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playClick(): void {
    this.blip(660, 0.09, 0.12);
    this.blip(990, 0.07, 0.05, 0.03);
  }

  playHover(): void {
    this.blip(1320, 0.05, 0.035);
  }

  playArrive(): void {
    this.blip(440, 0.25, 0.08);
    this.blip(660, 0.35, 0.05, 0.08);
    this.blip(880, 0.5, 0.03, 0.16);
  }

  private blip(frequency: number, duration: number, volume: number, delay = 0): void {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, now + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(this.master!);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private ready(): boolean {
    return this.enabledState && !!this.ctx && !!this.master && !!this.noiseBuffer;
  }

  private setup(): void {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 4;
    this.master.connect(compressor).connect(ctx.destination);

    // Noise buffer for whooshes and ambient texture.
    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Brown-ish noise is less harsh than white.
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    this.noiseBuffer = buffer;

    this.startAmbient();
  }

  private startAmbient(): void {
    const ctx = this.ctx!;
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 0.16;
    this.ambientGain.connect(this.master!);

    const drone = (frequency: number, detune: number, gainValue: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = frequency;
      osc.detune.value = detune;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;
      filter.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = gainValue;
      osc.connect(filter).connect(gain).connect(this.ambientGain!);
      osc.start();
      this.ambientNodes.push(osc, filter, gain);

      // Slow LFO breathing on the filter.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 60;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
      this.ambientNodes.push(lfo, lfoGain);
    };
    drone(55, -6, 0.5);
    drone(55, 7, 0.5);
    drone(82.4, 3, 0.25);

    // Distant wind made from filtered noise.
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.5;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;
    wind.connect(windFilter).connect(windGain).connect(this.ambientGain);
    wind.start();
    this.ambientNodes.push(wind, windFilter, windGain);
  }

  dispose(): void {
    for (const node of this.ambientNodes) {
      try {
        (node as OscillatorNode).stop?.();
      } catch {
        /* already stopped */
      }
      node.disconnect();
    }
    this.ambientNodes = [];
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.enabledState = false;
  }
}
