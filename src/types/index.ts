export interface SceneData {
  id: number;
  title: string;
  titleIndo: string;
  subtitleIndo: string;
  duration: number; // in seconds
  timeStart: number;
  timeEnd: number;
  shotType: string;
  lightingSetup: string;
  lensType: string;
  cameraMovement: string;
  colorTemperature: string;
  aspectRatio: string;
  onScreenText: string;
  subText?: string;
  imageStill: string; // Photorealistic Generated Film Still Asset
  cameraSpecs?: {
    sensor: string;
    focalLength: string;
    aperture: string;
    iso: string;
    shutterAngle: string;
    kelvin: string;
  };
  
  // Audio & Voiceover
  narrationIndo: string;
  narrationIndoPoetic: string;
  narrationEnglish: string;
  sfxDescription: string;
  musicMood: string;
  sfxCues: { timeOffset: number; name: string; soundType: string }[];

  // Cinematography Notes from Director
  directorVision: string;
  actingNotes: string;
  symbolism: string;
  colorPalette: string[];
}

export type ColorLut = 'golden_dawn' | 'cinematic_kodachrome' | 'teal_orange' | 'moody_pre_dawn' | 'vintage_sepia' | 'raw_neutral';
export type AspectRatioPreset = '2.39' | '16:9' | '4:3';
export type NarrationStyle = 'emotif' | 'puitis' | 'monolog_batin' | 'dokumenter_alam';
export type VisualMode = 'photorealistic' | 'cinematic_motion';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  currentSceneIndex: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  colorLut: ColorLut;
  aspectRatio: AspectRatioPreset;
  filmGrain: boolean;
  lensFlare: boolean;
  subtitlesEnabled: boolean;
  directorCommentary: boolean;
  cameraShake: boolean;
  selectedVoiceStyle: NarrationStyle;
  visualMode: VisualMode;
}

