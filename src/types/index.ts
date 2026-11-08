export type VideoType =
  | 'sinema'
  | 'belgesel'
  | 'youtube'
  | 'reklam'
  | 'tanitim'
  | 'sosyal'
  | 'egitim'
  | 'kurumsal';

export type AspectRatio = '21:9' | '16:9' | '9:16' | '1:1';

export type VoiceGender = 'female' | 'male';

export interface CharacterProfile {
  enabled: boolean;
  name: string;
  gender: 'male' | 'female';
  ageGroup: string;
  roleArchetype: string;
  appearance: string;
  clothing: string;
  consistencyPrompt: string;
}

export type VisualSourceMode = 'ai_generate' | 'web_search' | 'curated';

export interface BriefForm {
  type: VideoType;
  product: string;
  audience: string;
  points: string;
  cta: string;
  tone: string;
  dur: number;
  ratio: AspectRatio;
  platform: string;
  lang: string;
  voiceGender?: VoiceGender;
  customInstructions?: string;
  bgMusic?: string;
  character?: CharacterProfile;
  visualSource?: VisualSourceMode;
}

export interface Scene {
  id: number;
  role: string;
  sec: number;
  text: string;
  subtitle?: string;
  highlight?: string;
  vo: string;
  visual: string;
  grad: [string, string];
  imageUrl?: string;
  audioUrl?: string;
  zoomDir?: 'in' | 'out';
  speaker?: string;
  voiceGender?: VoiceGender;
  characterTag?: string;
  characterConsistent?: boolean;
}

export type VideoStatus =
  | 'Senaryo Yazılıyor'
  | 'Senaryo & Sahne Planlanıyor'
  | 'Tasarım Bekliyor (Storyboard)'
  | 'Görsel & Ses Üretiliyor'
  | 'Render & Kalite Kontrolü'
  | 'Hazır'
  | 'Başarısız';

export type AppMode = 'sinema' | 'belgesel' | 'youtube' | 'reklam' | 'classic';

export interface VideoItem extends BriefForm {
  id: string;
  title: string;
  mode?: AppMode;
  status: VideoStatus;
  stage: 'senaryo' | 'storyboard' | 'sahneler' | 'render' | 'hazir' | 'hata';
  progress: number;
  scenes: Scene[];
  logs: string[];
  created: string;
}

export interface QCCheck {
  title: string;
  pass: boolean;
  detail: string;
}

export interface QCResult {
  score: number;
  checks: QCCheck[];
  isPerfect: boolean;
}

export interface Preset {
  name: string;
  data: BriefForm;
}

export interface ProviderConfig {
  llm: string;
  tts: string;
  voiceGender?: VoiceGender;
  renderEngine: string;
  mcpUrl: string;
  geminiApiKey?: string;
}
