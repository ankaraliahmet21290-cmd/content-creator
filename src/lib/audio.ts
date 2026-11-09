'use client';

import { resolveBgmTrackPath } from './constants';

export class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private previewAudio: HTMLAudioElement | null = null;
  private currentSpeechAudio: HTMLAudioElement | null = null;
  private synthCtx: AudioContext | null = null;
  private oscSub: OscillatorNode | null = null;
  private oscDrone: OscillatorNode | null = null;
  private synthGain: GainNode | null = null;
  private currentTrackUrl: string = '';
  private sfxAudio: HTMLAudioElement | null = null;
  public isPlaying: boolean = false;
  public isBGMEnabled: boolean = true;

  // Fon müziğini yapım türüne, seçilen parçaya ve konuya uygun olarak akıllıca başlat
  public startBGM(type: string = 'sinema', customTrack?: string, topic: string = '', customMusicData?: string): void {
    if (typeof window === 'undefined') return;
    if (customTrack === 'none') {
      this.stopBGM();
      return;
    }

    try {
      const targetTrack = resolveBgmTrackPath(customTrack, type, topic, customMusicData);
      if (!targetTrack) {
        this.stopBGM();
        return;
      }

      if (!this.bgmAudio || this.currentTrackUrl !== targetTrack) {
        if (this.bgmAudio) {
          try { this.bgmAudio.pause(); } catch {}
        }
        this.bgmAudio = new Audio(targetTrack);
        this.bgmAudio.loop = true;
        this.currentTrackUrl = targetTrack;
      }

      this.bgmAudio.volume = 0.25;
      this.bgmAudio.play().catch(() => {});
      this.isPlaying = true;
    } catch {
      // ignore
    }
  }

  // Müzik parçasını anlık olarak ön dinleme yap (5 saniye çalar)
  public previewSoundtrack(trackPath: string, onEnded?: () => void): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.previewAudio) {
        this.previewAudio.pause();
        this.previewAudio = null;
      }
      if (!trackPath) return;

      const audio = new Audio(trackPath);
      audio.volume = 0.45;
      this.previewAudio = audio;

      const stopTimeout = setTimeout(() => {
        try {
          audio.pause();
          if (onEnded) onEnded();
        } catch {}
      }, 7000);

      audio.onended = () => {
        clearTimeout(stopTimeout);
        if (onEnded) onEnded();
      };

      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }

  public stopPreview(): void {
    if (this.previewAudio) {
      try {
        this.previewAudio.pause();
        this.previewAudio.currentTime = 0;
      } catch {}
      this.previewAudio = null;
    }
  }

  // Sinematik Sahne Geçiş Efekti (Whoosh + Sub Impact)
  public playTransitionSFX(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!this.sfxAudio) {
        this.sfxAudio = new Audio('/audio_assets/cinema_sfx_impact.wav');
      }
      this.sfxAudio.currentTime = 0;
      this.sfxAudio.volume = 0.35;
      this.sfxAudio.play().catch(() => {});
    } catch {
      // ignore
    }
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch {}
    }
    this.isPlaying = false;
  }

  public setBGMVolume(ducked: boolean): void {
    if (this.bgmAudio) {
      // Konuşma varken müziği kıs (ducking: 0.10), konuşma bitince yükselt (0.28)
      this.bgmAudio.volume = ducked ? 0.10 : 0.28;
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
