'use client';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  public isPlaying: boolean = false;

  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Ritmik ambient lo-fi / sıcak synth pad sentezleme
  public startBGM(): void {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) return;

      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(0.045, this.ctx.currentTime);
      this.gain.connect(this.ctx.destination);

      // Çift osilatör ile sıcak chord pad (A3 ve E4)
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();
      this.osc1.type = 'triangle';
      this.osc2.type = 'sine';
      this.osc1.frequency.setValueAtTime(220, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(329.63, this.ctx.currentTime);

      this.osc1.connect(this.gain);
      this.osc2.connect(this.gain);
      this.osc1.start();
      this.osc2.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio init warning:', e);
    }
  }

  public stopBGM(): void {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
        this.osc1 = null;
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
        this.osc2 = null;
      }
      if (this.gain) {
        this.gain.disconnect();
        this.gain = null;
      }
      this.isPlaying = false;
    } catch {
      // ignore
    }
  }

  // TTS: Önce Gemini AI WAV sesini çalar, yoksa Web Speech API'ye düşer
  public speak(text: string, lang: string = 'tr-TR', audioUrl?: string): void {
    if (typeof window === 'undefined') return;
    this.stopSpeech();

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        audio.play().catch(() => {
          // Tarayıcı otomatik oynatmayı engellerse veya hata olursa Web Speech'e geç
          this.speakWebSpeech(text, lang);
        });
        return;
      } catch {
        // fallback
      }
    }

    this.speakWebSpeech(text, lang);
  }

  private speakWebSpeech(text: string, lang: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioMgr = new AudioManager();
