import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clapperboard, Play, Pause, Volume2, VolumeX, 
  Sparkles, Maximize2, Layers, BookOpen, Film, Eye,
  Download, Loader2, CheckCircle2
} from 'lucide-react';
import { SCENES, DIRECTOR_TREATMENT } from './data/scenes';
import { PlaybackState, ColorLut, AspectRatioPreset, NarrationStyle } from './types';
import { audioEngine } from './services/audioEngine';
import { downloadCompleteProductionZip } from './services/exportPackage';
import { CinematicViewport } from './components/CinematicViewport';
import { DirectorControls } from './components/DirectorControls';
import { DirectorStudioTabs } from './components/DirectorStudioTabs';

export default function App() {
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    totalDuration: 17.0, // 4 scenes totaling 17 seconds
    currentSceneIndex: 0,
    volume: 0.8,
    isMuted: false,
    playbackSpeed: 1.0,
    colorLut: 'golden_dawn',
    aspectRatio: '2.39',
    filmGrain: true,
    lensFlare: true,
    subtitlesEnabled: true,
    directorCommentary: false,
    cameraShake: true,
    selectedVoiceStyle: 'emotif',
    visualMode: 'photorealistic',
  });

  const [highlightedChar, setHighlightedChar] = useState<number>(0);
  const [showStoryboardRef, setShowStoryboardRef] = useState<boolean>(false);
  const [onScreenTextVisible, setOnScreenTextVisible] = useState<boolean>(true);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>('');

  const prevSceneIndexRef = useRef<number>(-1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const currentScene = SCENES[playback.currentSceneIndex] || SCENES[0];
  const sceneProgress = Math.min(1, Math.max(0, 
    (playback.currentTime - currentScene.timeStart) / (currentScene.timeEnd - currentScene.timeStart)
  ));
  const totalProgress = playback.currentTime / playback.totalDuration;

  const currentNarrationText = playback.selectedVoiceStyle === 'puitis' 
    ? currentScene.narrationIndoPoetic 
    : currentScene.narrationIndo;

  // Trigger narration speech & ambient audio for current scene
  const triggerSceneAudio = useCallback((sceneIdx: number) => {
    const scene = SCENES[sceneIdx];
    if (!scene) return;

    audioEngine.playSceneAmbience(sceneIdx);
    
    const textToSpeak = playback.selectedVoiceStyle === 'puitis' 
      ? scene.narrationIndoPoetic 
      : scene.narrationIndo;

    audioEngine.speakIndonesianNarration(
      textToSpeak, 
      0.86, 
      0.95,
      (charIdx) => setHighlightedChar(charIdx)
    );
  }, [playback.selectedVoiceStyle]);

  // Main playback tick animation loop
  useEffect(() => {
    if (!playback.isPlaying) {
      lastTimestampRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setPlayback((prev) => {
        let newTime = prev.currentTime + delta * prev.playbackSpeed;
        
        // Loop back if ended
        if (newTime >= prev.totalDuration) {
          newTime = 0;
        }

        // Determine current scene from time
        const newSceneIdx = SCENES.findIndex(s => newTime >= s.timeStart && newTime < s.timeEnd);
        const resolvedIdx = newSceneIdx !== -1 ? newSceneIdx : (newTime >= prev.totalDuration ? 0 : prev.currentSceneIndex);

        return {
          ...prev,
          currentTime: newTime,
          currentSceneIndex: resolvedIdx,
        };
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [playback.isPlaying, playback.playbackSpeed, playback.totalDuration]);

  // When scene index changes during active playback, trigger scene audio & voice
  useEffect(() => {
    if (prevSceneIndexRef.current !== playback.currentSceneIndex) {
      prevSceneIndexRef.current = playback.currentSceneIndex;
      setOnScreenTextVisible(true);

      if (playback.isPlaying) {
        triggerSceneAudio(playback.currentSceneIndex);
      }
    }
  }, [playback.currentSceneIndex, playback.isPlaying, triggerSceneAudio]);

  // Play / Pause toggle handler
  const handleTogglePlay = () => {
    if (!playback.isPlaying) {
      audioEngine.init();
      triggerSceneAudio(playback.currentSceneIndex);
    } else {
      audioEngine.stopAllSounds();
    }
    setPlayback(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Reset to beginning
  const handleReset = () => {
    setPlayback(prev => ({ ...prev, currentTime: 0, currentSceneIndex: 0 }));
    if (playback.isPlaying) {
      triggerSceneAudio(0);
    }
  };

  // Seek time
  const handleSeek = (time: number) => {
    const targetSceneIdx = SCENES.findIndex(s => time >= s.timeStart && time < s.timeEnd);
    const resolvedIdx = targetSceneIdx !== -1 ? targetSceneIdx : 0;
    setPlayback(prev => ({ ...prev, currentTime: time, currentSceneIndex: resolvedIdx }));
    if (playback.isPlaying) {
      triggerSceneAudio(resolvedIdx);
    }
  };

  // Select scene directly
  const handleSelectScene = (sceneIdx: number) => {
    const scene = SCENES[sceneIdx];
    if (!scene) return;
    setPlayback(prev => ({
      ...prev,
      currentTime: scene.timeStart,
      currentSceneIndex: sceneIdx,
    }));
    if (playback.isPlaying) {
      triggerSceneAudio(sceneIdx);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !playback.isMuted;
    setPlayback(prev => ({ ...prev, isMuted: nextMuted }));
    audioEngine.setMute(nextMuted);
  };

  const handleVolumeChange = (vol: number) => {
    setPlayback(prev => ({ ...prev, volume: vol, isMuted: vol === 0 }));
    audioEngine.setVolume(vol);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleExportZip = async () => {
    if (isExportingZip) return;
    setIsExportingZip(true);
    setExportProgressText('Mempersiapkan berkas...');
    try {
      await downloadCompleteProductionZip((prog, status) => {
        setExportProgressText(status);
      });
    } catch (err) {
      console.error('Export ZIP error', err);
    } finally {
      setIsExportingZip(false);
      setExportProgressText('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* ================= MASTER HEADER: DIRECTOR SUITE ================= */}
      <header className="sticky top-0 z-50 w-full bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-lg shadow-amber-500/20">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                The Rice Farmer's Decision
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-500/30">
                15s SPOT / DOKUMENTER
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans hidden sm:block">
              Sutradara: <span className="text-zinc-200 font-medium">Egih</span> | Narasi Sinematik Puitis Bahasa Indonesia
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            title="Unduh Seluruh Paket Produksi (4 Master Stills, Naskah, Subtitle SRT, & Dokumen Sutradara)"
          >
            {isExportingZip ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isExportingZip ? (exportProgressText || 'Mengunduh ZIP...') : 'Unduh Proyek (ZIP)'}</span>
          </button>

          <button
            onClick={() => setShowStoryboardRef(!showStoryboardRef)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Storyboard Asli</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              playback.isPlaying 
                ? 'bg-zinc-800 text-amber-400 border border-amber-500/40' 
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
            }`}
          >
            {playback.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{playback.isPlaying ? 'Jeda' : 'Putar Film'}</span>
          </button>
        </div>
      </header>

      {/* ================= STORYBOARD DRAFT REFERENCE DRAWER (IF OPEN) ================= */}
      {showStoryboardRef && (
        <div className="w-full bg-zinc-900/95 border-b border-zinc-800 p-4 sm:p-6 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Referensi Storyboard Asli: "The Rice Farmer's Decision" (4 Panel)
              </h3>
              <button
                onClick={() => setShowStoryboardRef(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="font-mono text-amber-400 font-bold mb-1">Panel 1 (2s) - The Decision</div>
                <p className="text-zinc-300 mb-1"><strong>Visual:</strong> Medium shot, father alone in dimly lit sundry shop staring at account books.</p>
                <p className="text-zinc-400 italic">"The long days... but something was missing."</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="font-mono text-amber-400 font-bold mb-1">Panel 2 (4s) - A New Beginning</div>
                <p className="text-zinc-300 mb-1"><strong>Visual:</strong> Pulling metal roller shutter down, determined look, walking to bus with family photo.</p>
                <p className="text-zinc-400 italic">"For *them*... I had to change."</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="font-mono text-amber-400 font-bold mb-1">Panel 3 (4s) - Honest Labor. Our Roots.</div>
                <p className="text-zinc-300 mb-1"><strong>Visual:</strong> Wide shot, wading muddy lush terraced rice paddies with caping and cangkul.</p>
                <p className="text-zinc-400 italic">"Hard work, yes. But here... I build their future."</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="font-mono text-amber-400 font-bold mb-1">Panel 4 (5s) - For The Family. Our Legacy.</div>
                <p className="text-zinc-300 mb-1"><strong>Visual:</strong> Golden hour close-up and wide. Children laughing, child on shoulders, golden sunset harvest.</p>
                <p className="text-zinc-400 italic">"My family. Their foundation. Our path."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top: Master Cinema Monitor / Player */}
        <section className="flex flex-col gap-4">
          <CinematicViewport
            currentScene={currentScene}
            sceneProgress={sceneProgress}
            totalProgress={totalProgress}
            colorLut={playback.colorLut}
            aspectRatio={playback.aspectRatio}
            filmGrain={playback.filmGrain}
            lensFlare={playback.lensFlare}
            subtitlesEnabled={playback.subtitlesEnabled}
            cameraShake={playback.cameraShake}
            onScreenTextVisible={onScreenTextVisible}
            narrationText={currentNarrationText}
            highlightedCharIndex={highlightedChar}
            visualMode={playback.visualMode}
          />

          {/* Player Controller & Color Grading Toolbar */}
          <DirectorControls
            isPlaying={playback.isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            currentTime={playback.currentTime}
            totalDuration={playback.totalDuration}
            onSeek={handleSeek}
            scenes={SCENES}
            currentSceneIndex={playback.currentSceneIndex}
            onSelectScene={handleSelectScene}
            volume={playback.volume}
            onVolumeChange={handleVolumeChange}
            isMuted={playback.isMuted}
            onToggleMute={handleToggleMute}
            playbackSpeed={playback.playbackSpeed}
            onChangeSpeed={(speed) => setPlayback(prev => ({ ...prev, playbackSpeed: speed }))}
            colorLut={playback.colorLut}
            onChangeLut={(lut) => setPlayback(prev => ({ ...prev, colorLut: lut }))}
            aspectRatio={playback.aspectRatio}
            onChangeAspectRatio={(ratio) => setPlayback(prev => ({ ...prev, aspectRatio: ratio }))}
            filmGrain={playback.filmGrain}
            onToggleFilmGrain={() => setPlayback(prev => ({ ...prev, filmGrain: !prev.filmGrain }))}
            lensFlare={playback.lensFlare}
            onToggleLensFlare={() => setPlayback(prev => ({ ...prev, lensFlare: !prev.lensFlare }))}
            subtitlesEnabled={playback.subtitlesEnabled}
            onToggleSubtitles={() => setPlayback(prev => ({ ...prev, subtitlesEnabled: !prev.subtitlesEnabled }))}
            cameraShake={playback.cameraShake}
            onToggleCameraShake={() => setPlayback(prev => ({ ...prev, cameraShake: !prev.cameraShake }))}
            selectedVoiceStyle={playback.selectedVoiceStyle}
            onChangeVoiceStyle={(style) => setPlayback(prev => ({ ...prev, selectedVoiceStyle: style }))}
            visualMode={playback.visualMode}
            onToggleVisualMode={() => setPlayback(prev => ({ 
              ...prev, 
              visualMode: prev.visualMode === 'photorealistic' ? 'cinematic_motion' : 'photorealistic' 
            }))}
            onTriggerVoiceover={() => triggerSceneAudio(playback.currentSceneIndex)}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </section>

        {/* Bottom: Comprehensive Director Studio Breakdown & Naskah Narasi */}
        <section className="mt-2">
          <DirectorStudioTabs
            currentSceneIndex={playback.currentSceneIndex}
            onSelectScene={handleSelectScene}
            selectedVoiceStyle={playback.selectedVoiceStyle}
            onChangeVoiceStyle={(style) => setPlayback(prev => ({ ...prev, selectedVoiceStyle: style }))}
          />
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-6 px-4 text-center text-xs text-zinc-400">
        <p className="font-serif italic text-zinc-400 max-w-xl mx-auto mb-2">
          "Bumi pertiwi tidak pernah berdusta. Setiap ayunan cangkul adalah kidung cinta yang abadi bagi anak cucu kita."
        </p>
        <p className="font-mono text-[11px] text-zinc-400">
          Karya Sinematik Sutradara &bull; Diadaptasi dari Storyboard "The Rice Farmer's Decision"
        </p>
      </footer>
    </div>
  );
}
