import React from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Film, Sparkles, MessageSquare, Clapperboard, 
  Palette, Sliders, Maximize2, FastForward, Image as ImageIcon
} from 'lucide-react';
import { SceneData, ColorLut, AspectRatioPreset, NarrationStyle, VisualMode } from '../types';

interface DirectorControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  scenes: SceneData[];
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;

  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;

  colorLut: ColorLut;
  onChangeLut: (lut: ColorLut) => void;

  aspectRatio: AspectRatioPreset;
  onChangeAspectRatio: (ratio: AspectRatioPreset) => void;

  filmGrain: boolean;
  onToggleFilmGrain: () => void;

  lensFlare: boolean;
  onToggleLensFlare: () => void;

  subtitlesEnabled: boolean;
  onToggleSubtitles: () => void;

  cameraShake: boolean;
  onToggleCameraShake: () => void;

  selectedVoiceStyle: NarrationStyle;
  onChangeVoiceStyle: (style: NarrationStyle) => void;

  visualMode?: VisualMode;
  onToggleVisualMode?: () => void;

  onTriggerVoiceover: () => void;
  onToggleFullscreen: () => void;
}

export const DirectorControls: React.FC<DirectorControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  currentTime,
  totalDuration,
  onSeek,
  scenes,
  currentSceneIndex,
  onSelectScene,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  playbackSpeed,
  onChangeSpeed,
  colorLut,
  onChangeLut,
  aspectRatio,
  onChangeAspectRatio,
  filmGrain,
  onToggleFilmGrain,
  lensFlare,
  onToggleLensFlare,
  subtitlesEnabled,
  onToggleSubtitles,
  cameraShake,
  onToggleCameraShake,
  selectedVoiceStyle,
  onChangeVoiceStyle,
  visualMode = 'photorealistic',
  onToggleVisualMode,
  onTriggerVoiceover,
  onToggleFullscreen,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis}`;
  };

  return (
    <div className="w-full bg-zinc-950/95 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
      {/* 1. Timeline Scrubber with Scene Markers */}
      <div className="flex flex-col gap-1.5">
        <div className="relative w-full h-8 flex items-center cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            onSeek(clickPos * totalDuration);
          }}
        >
          {/* Base Track */}
          <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden relative shadow-inner">
            {/* Played Progress Bar */}
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full relative transition-all duration-75"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          {/* Scene Split Markers */}
          {scenes.map((scene, idx) => {
            const leftPercent = (scene.timeStart / totalDuration) * 100;
            const isCurrent = idx === currentSceneIndex;
            return (
              <div 
                key={scene.id}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              >
                <div className={`w-0.5 h-4 ${isCurrent ? 'bg-amber-400 h-6 ring-2 ring-amber-400/40' : 'bg-zinc-600'} transition-all`} />
              </div>
            );
          })}

          {/* Playhead Pin */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 border-2 border-white rounded-full shadow-lg shadow-amber-500/50 pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          />
        </div>

        {/* Scene Labels & Timecode Bar */}
        <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Scene Quick Jump Chips */}
          <div className="flex items-center gap-1 sm:gap-2">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => onSelectScene(idx)}
                className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium transition-all ${
                  idx === currentSceneIndex
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
                title={scene.titleIndo}
              >
                Sc 0{scene.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Master Director Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/80">
        {/* Left: Playback buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
            title="Ulangi dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-sm">Jeda Video</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span className="text-sm">Putar Dokumenter</span>
              </>
            )}
          </button>

          <button
            onClick={onTriggerVoiceover}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all active:scale-95"
            title="Bacakan Narasi Bahasa Indonesia"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sulih Suara (VO)</span>
          </button>
        </div>

        {/* Center: Volume & Speed Controls */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/60">
            <FastForward className="w-3 h-3 text-zinc-400 ml-1 hidden sm:block" />
            {[0.75, 1, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                  playbackSpeed === speed
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Cinema Toggles */}
        <div className="flex items-center gap-1.5">
          {onToggleVisualMode && (
            <button
              onClick={onToggleVisualMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                visualMode === 'photorealistic'
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md'
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
              title="Ganti Mode: Stills Fotorealistis / Motion Graphic"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {visualMode === 'photorealistic' ? 'Master Stills' : 'Motion Art'}
              </span>
            </button>
          )}

          <button
            onClick={onToggleFilmGrain}
            className={`p-2 rounded-lg text-xs font-medium border transition-all ${
              filmGrain 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs' 
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Efek Film Grain 24 FPS"
          >
            <Film className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleLensFlare}
            className={`p-2 rounded-lg text-xs font-medium border transition-all ${
              lensFlare 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Efek Anamorphic Lens Flare"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSubtitles}
            className={`p-2 rounded-lg text-xs font-medium border transition-all ${
              subtitlesEnabled 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Tampilkan Teks Terjemahan / Subtitle"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleCameraShake}
            className={`p-2 rounded-lg text-xs font-medium border transition-all ${
              cameraShake 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Simulasi Handheld Camera Shake"
          >
            <Clapperboard className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all"
            title="Mode Sinema Layar Penuh"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Director Color Grading & Lens Suite Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-xs">
        {/* Color LUT Picker */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400 font-medium">Color Grade (LUT):</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'golden_dawn', label: 'Golden Fajar' },
              { id: 'cinematic_kodachrome', label: 'Kodachrome' },
              { id: 'teal_orange', label: 'Teal & Orange' },
              { id: 'moody_pre_dawn', label: 'Moody Noir' },
              { id: 'vintage_sepia', label: 'Nostalgia' },
              { id: 'raw_neutral', label: 'Raw' },
            ].map((lut) => (
              <button
                key={lut.id}
                onClick={() => onChangeLut(lut.id as ColorLut)}
                className={`px-2 py-1 rounded text-[11px] transition-all ${
                  colorLut === lut.id
                    ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/50'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {lut.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Voice Style */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Rasio:</span>
            {(['2.39', '16:9', '4:3'] as AspectRatioPreset[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => onChangeAspectRatio(ratio)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  aspectRatio === ratio
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ratio === '2.39' ? '2.39:1' : ratio}
              </button>
            ))}
          </div>

          {/* Voice Style Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Gaya Narasi:</span>
            <select
              value={selectedVoiceStyle}
              onChange={(e) => onChangeVoiceStyle(e.target.value as NarrationStyle)}
              className="bg-zinc-800 text-amber-300 border border-zinc-700 rounded px-2 py-0.5 text-xs focus:outline-hidden focus:border-amber-500"
            >
              <option value="emotif">Emosional & Menyentuh</option>
              <option value="puitis">Puitis Mendalam</option>
              <option value="monolog_batin">Monolog Batin Sang Ayah</option>
              <option value="dokumenter_alam">Dokumenter Alami</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
