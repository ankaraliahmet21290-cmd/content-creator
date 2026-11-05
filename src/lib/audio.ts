'use client';

export class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private currentSpeechAudio: HTMLAudioElement | null = null;
  public isPlaying: boolean = false;
  public isBGMEnabled: boolean = true;

  // Gerçek kurumsal v5 satış müziğini başlat
  public startBGM(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio('/sales-music.wav');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.22; // Konuşmanın altında duyulacak ideal fon seviyesi
      }
      this.bgmAudio.play().catch(() => {});
      this.isPlaying = true;
    } catch {
      // ignore
    }
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
    this.isPlaying = false;
  }

  public setBGMVolume(ducked: boolean): void {
    if (this.bgmAudio) {
      // Konuşma varken müziği hafifçe kıs (ducking)
      this.bgmAudio.volume = ducked ? 0.14 : 0.28;
    }
  }

  // TTS Seslendirme Çal
  public speak(
    text: string,
    lang: string = 'tr-TR',
    audioUrl?: string,
    voiceGender: 'female' | 'male' = 'female'
  ): void {
    if (typeof window === 'undefined') return;
    this.stopSpeech();
    this.setBGMVolume(true);

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        this.currentSpeechAudio = audio;
        audio.onended = () => this.setBGMVolume(false);
        audio.play().catch(() => {
          this.speakWebSpeech(text, lang, voiceGender);
        });
        return;
      } catch {
        // fallback
      }
    }

    this.speakWebSpeech(text, lang, voiceGender);
  }

  private speakWebSpeech(text: string, lang: string, voiceGender: 'female' | 'male'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = voiceGender === 'male' ? 0.82 : 1.15;
    utterance.onend = () => this.setBGMVolume(false);

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => {
        const name = v.name.toLowerCase();
        const matchesLang = v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase());
        if (!matchesLang) return false;
        if (voiceGender === 'female') {
          return name.includes('female') || name.includes('kadın') || name.includes('filiz') || name.includes('seda');
        } else {
          return name.includes('male') || name.includes('erkek') || name.includes('ahmet') || name.includes('tolga');
        }
      });
      if (match) utterance.voice = match;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech(): void {
    if (this.currentSpeechAudio) {
      try {
        this.currentSpeechAudio.pause();
        this.currentSpeechAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentSpeechAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.setBGMVolume(false);
  }
}

export const audioMgr = new AudioManager();
