export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // We no longer need to load external .ogg files, avoiding Safari decoding errors.
  static async loadSound(key: string, url: string) {
    // No-op: we use synthetic sounds now.
    return Promise.resolve();
  }

  static playFootstep() {
    if (!this.ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime;
    
    // Create a short burst of noise for the footstep
    const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // White noise
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter the noise to make it sound like a dull thud/step
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    // Randomize frequency slightly for variety
    filter.frequency.value = 400 + Math.random() * 200;

    const gainNode = this.ctx.createGain();
    // Envelope: quick attack, quick decay
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noiseSource.start(time);
    noiseSource.stop(time + 0.1);
  }
}
