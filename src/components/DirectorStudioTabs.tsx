import React, { useState } from 'react';
import { 
  FileText, Camera, Volume2, Sparkles, Copy, Check, 
  Download, Play, Clapperboard, Heart, Award,
  Flame, BookOpen, Layers, Image as ImageIcon,
  Maximize2, ZoomIn, ZoomOut, RotateCcw, SlidersHorizontal,
  ChevronLeft, ChevronRight, X, Info, Archive, Loader2
} from 'lucide-react';
import { SceneData, NarrationStyle } from '../types';
import { SCENES, DIRECTOR_TREATMENT } from '../data/scenes';
import { audioEngine } from '../services/audioEngine';
import { downloadCompleteProductionZip } from '../services/exportPackage';

interface DirectorStudioTabsProps {
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  selectedVoiceStyle: NarrationStyle;
  onChangeVoiceStyle: (style: NarrationStyle) => void;
}

export const DirectorStudioTabs: React.FC<DirectorStudioTabsProps> = ({
  currentSceneIndex,
  onSelectScene,
  selectedVoiceStyle,
  onChangeVoiceStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'script' | 'cinematography' | 'sound' | 'treatment' | 'ai_director'>('gallery');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeAudioStem, setActiveAudioStem] = useState<{ dialog: boolean; sfx: boolean; ambience: boolean; music: boolean }>({
    dialog: true,
    sfx: true,
    ambience: true,
    music: true,
  });

  // Lightbox modal state for inspecting Stills
  const [lightboxSceneIndex, setLightboxSceneIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [showTechnicalOverlay, setShowTechnicalOverlay] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isExportingAllZip, setIsExportingAllZip] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');

  const handleExportFullZip = async () => {
    if (isExportingAllZip) return;
    setIsExportingAllZip(true);
    setExportStatusText('Mengemas ZIP...');
    try {
      await downloadCompleteProductionZip((prog, status) => {
        setExportStatusText(status);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingAllZip(false);
      setExportStatusText('');
    }
  };

  // Copy full Indonesian script
  const handleCopyScript = () => {
    const fullScript = SCENES.map(s => (
      `[${s.titleIndo.toUpperCase()}] (${s.timeStart}s - ${s.timeEnd}s)\n` +
      `VISUAL: ${s.shotType}, ${s.lightingSetup}\n` +
      `KAMERA: ${s.cameraMovement}\n` +
      `NARASI (ID): "${selectedVoiceStyle === 'puitis' ? s.narrationIndoPoetic : s.narrationIndo}"\n` +
      `SFX: ${s.sfxDescription}\n` +
      `TEKS LAYAR: ${s.onScreenText} (${s.subText})\n`
    )).join('\n---\n\n');

    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Export SRT Subtitle file
  const handleExportSrt = () => {
    const srtContent = SCENES.map((s, idx) => {
      const startSec = s.timeStart;
      const endSec = s.timeEnd;
      const formatSrtTime = (t: number) => {
        const h = Math.floor(t / 3600).toString().padStart(2, '0');
        const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
        const sec = Math.floor(t % 60).toString().padStart(2, '0');
        const ms = Math.floor((t % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${sec},${ms}`;
      };

      return `${idx + 1}\n${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n${selectedVoiceStyle === 'puitis' ? s.narrationIndoPoetic : s.narrationIndo}\n\n`;
    }).join('');

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'The_Rice_Farmers_Decision_Subtitles_ID.srt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download individual still image
  const handleDownloadStill = (scene: SceneData) => {
    const link = document.createElement('a');
    link.href = scene.imageStill;
    link.download = `Still_Scene_0${scene.id}_${scene.title.replace(/\s+/g, '_')}.jpg`;
    link.click();
  };

  // Play individual scene voiceover
  const playSceneVoice = (scene: SceneData) => {
    const text = selectedVoiceStyle === 'puitis' ? scene.narrationIndoPoetic : scene.narrationIndo;
    audioEngine.playSceneAmbience(scene.id - 1);
    audioEngine.speakIndonesianNarration(text, 0.88, 0.95);
  };

  // AI Assistant generator for custom treatment/narration
  const handleGenerateAiTreatment = async (presetType?: string) => {
    setIsGeneratingAi(true);
    setAiResult(null);

    // Simulate / execute AI creative director enrichment
    setTimeout(() => {
      let generatedText = '';
      if (presetType === 'monologue') {
        generatedText = `[MONOLOG BATIN SANG AYAH - VERSI PANJANG (60 DETIK)]\n\n` +
          `"Setiap malam di kota ini, aku pulang dengan tangan bersih tapi hati yang hampa. Angka-angka di buku kas itu terus bertambah, tapi waktu bersama anak-anakku justru berkurang. Aku tersadar: warisan terbesar untuk anakku bukanlah gedung bertingkat atau tumpukan rupiah semata, melainkan martabat dan tanah tempat mereka bisa menatap masa depan dengan kepala tegak.\n\n` +
          `Ketika cangkul ini kembali menyentuh lumpur sawah leluhur, ada ketenangan yang tak bisa dibeli. Peluh yang menetes di dahi ini mengalir sebagai doa. Dan saat melihat tawa mereka menyambut mentari senja di pematang sawah... aku tahu, keputusanku adalah awal dari kehidupan kami yang sejati."`;
      } else if (presetType === 'poetry') {
        generatedText = `[GAYA PUISI SASTRA NUSANTARA - SUITE 4 BABAK]\n\n` +
          `Babak I: "Di balik etalase kaca yang dingin, kuremas hitungan hari yang berdebu..."\n` +
          `Babak II: "Kututup gerbang kelabu, kuayunkan langkah menuju fajar yang memanggil..."\n` +
          `Babak III: "Tanah basah memeluk kaki, cangkul menyatu dalam degup nadi pertiwi..."\n` +
          `Babak IV: "Di pundakku engkau tertawa, anakku; di tanah ini kita mengakar, abadi selamanya."`;
      } else {
        generatedText = `[ANALISIS PENYUTRADARAAN & KESAN PSIKOLOGIS]\n\n` +
          `Karakter sang ayah adalah perwujudan arketipe 'The Reluctant Urbanite turned Noble Provider'. Transformasi visual dari Scene 1 (interior terkungkung, warna dingin, desaturasi 3200K) ke Scene 4 (bentang alam tak bertepi, warna hangat 2800K, komposisi horizon terbuka) secara visual mencerminkan pembebasan jiwa (liberation of soul).\n\n` +
          `Rekomendasi Sutradara:\n` +
          `1. Gunakan lensa 50mm Anamorphic T1.5 untuk memisahkan subjek dari kebisingan latar belakang pada Scene 1.\n` +
          `2. Efek slow motion 48fps pada cipratan lumpur Scene 3 untuk memberikan kesan 'hyper-real' pada kerja keras yang mulia.\n` +
          `3. Pertahankan hening selama 0.8 detik setelah rolling shutter ditutup (Scene 2) sebelum musik orkestra mengalun.`;
      }
      setAiResult(generatedText);
      setIsGeneratingAi(false);
    }, 1000);
  };

  const activeLightboxScene = lightboxSceneIndex !== null ? SCENES[lightboxSceneIndex] : null;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-2xl">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/80 px-2 sm:px-4 pt-2 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>Galeri Produksi (Master Stills)</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'script'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Naskah & Narasi Emosional</span>
        </button>

        <button
          onClick={() => setActiveTab('cinematography')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cinematography'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Sinematografi & Shot Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('sound')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sound'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Desain Suara & Kurva Emosi</span>
        </button>

        <button
          onClick={() => setActiveTab('treatment')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'treatment'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Treatment Sutradara</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_director')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ai_director'
              ? 'border-amber-500 text-amber-400 font-bold bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Asisten Sutradara</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-6 bg-zinc-950">
        {/* ================= TAB 0: PRODUCTION GALLERY (MASTER STILLS) ================= */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-6">
            {/* Header with Director Note & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-xl border border-amber-500/30 shadow-lg">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>Galeri Produksi Sinematik &bull; Visualisasi 4 Babak</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                  Master Production Stills (35mm Anamorphic Render)
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                  Hasil visualisasi resolusi tinggi yang merepresentasikan pencahayaan nyata, komposisi lensa, dan bobot emosional dari setiap adegan storyboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-amber-300 hidden sm:inline-block">
                  4 Adegan Sinematik Selesai Dirender
                </span>

                <button
                  onClick={handleExportFullZip}
                  disabled={isExportingAllZip}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  title="Unduh 4 Foto Stills, Naskah, Subtitle SRT, dan Spesifikasi Teknis Sutradara ke format ZIP"
                >
                  {isExportingAllZip ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  <span>{isExportingAllZip ? (exportStatusText || 'Mengunduh ZIP...') : 'Unduh Seluruh Paket Produksi (.ZIP)'}</span>
                </button>
              </div>
            </div>

            {/* 4 Cinematic Still Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {SCENES.map((scene, idx) => {
                const isSelected = idx === currentSceneIndex;
                const narrationToDisplay = selectedVoiceStyle === 'puitis' ? scene.narrationIndoPoetic : scene.narrationIndo;

                return (
                  <div
                    key={scene.id}
                    className={`rounded-xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-zinc-900/90 border-amber-500/70 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    {/* Top: Image Preview with Cinematic Letterbox & Overlays */}
                    <div className="relative aspect-[16/9] w-full bg-black overflow-hidden cursor-pointer"
                      onClick={() => setLightboxSceneIndex(idx)}
                    >
                      <img
                        src={scene.imageStill}
                        alt={scene.titleIndo}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Letterbox & Vignette Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-amber-500 text-stone-950 font-mono text-[11px] font-bold shadow-md">
                            ADEGAN 0{scene.id}
                          </span>
                          <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-xs border border-zinc-700 text-[11px] font-mono text-zinc-200">
                            {scene.duration}s
                          </span>
                        </div>

                        <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-xs border border-amber-500/30 text-[11px] font-mono text-amber-300">
                          {scene.onScreenText}
                        </span>
                      </div>

                      {/* Bottom Image Hover Prompt / Action Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-xs text-xs font-mono text-zinc-300 border border-zinc-800">
                          {scene.cameraSpecs?.focalLength || scene.lensType.split(' ')[0]} &bull; {scene.cameraSpecs?.aperture || 'T1.5'}
                        </div>

                        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxSceneIndex(idx);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-md transition-all"
                            title="Perbesar Layar Penuh"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadStill(scene);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow-md transition-all"
                            title="Unduh File Foto"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white tracking-wide">
                            {scene.titleIndo}
                          </h3>
                          <button
                            onClick={() => onSelectScene(idx)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-mono underline"
                          >
                            Lihat di Video
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{scene.subtitleIndo}</p>
                      </div>

                      {/* Voiceover Quote in Box */}
                      <div className="p-3 bg-black/60 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-mono text-amber-400/90 tracking-wider">
                            NARASI VOICE-OVER:
                          </span>
                          <button
                            onClick={() => playSceneVoice(scene)}
                            className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded transition-all"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Dengarkan</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-serif italic text-amber-100 leading-relaxed">
                          "{narrationToDisplay}"
                        </p>
                      </div>

                      {/* Technical Specs Pill Bar */}
                      {scene.cameraSpecs && (
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Kamera Sensor</span>
                            <span className="text-zinc-300 truncate block">{scene.cameraSpecs.sensor.split(' ')[0]} {scene.cameraSpecs.sensor.split(' ')[1]}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Lensa / Bukaan</span>
                            <span className="text-amber-400 truncate block">{scene.cameraSpecs.focalLength.split(' ')[0]} {scene.cameraSpecs.aperture}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Suhu Warna</span>
                            <span className="text-amber-300 truncate block">{scene.cameraSpecs.kelvin}</span>
                          </div>
                        </div>
                      )}

                      {/* Color Palette Extraction */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 text-[11px] font-mono">Palet:</span>
                          <div className="flex gap-1">
                            {scene.colorPalette.map((color, cIdx) => (
                              <div
                                key={cIdx}
                                className="w-4 h-4 rounded-xs border border-white/10"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onSelectScene(idx);
                          }}
                          className="px-3 py-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-stone-950 text-zinc-300 font-medium text-xs transition-all"
                        >
                          Pilih Adegan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 1: SCRIPT & VOICEOVER ================= */}
        {activeTab === 'script' && (
          <div className="flex flex-col gap-6">
            {/* Header with Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-amber-400" />
                  Naskah Sulih Suara Bahasa Indonesia (Director's Screenplay)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Narasi puitis yang menyentuh relung sanubari penonton, diselaraskan dengan storyboard 4 adegan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Tersalin!' : 'Salin Naskah'}</span>
                </button>
                <button
                  onClick={handleExportSrt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Subtitle (.SRT)</span>
                </button>
              </div>
            </div>

            {/* Scene-by-Scene Screenplay Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENES.map((scene, idx) => {
                const isSelected = idx === currentSceneIndex;
                const narrationToDisplay = selectedVoiceStyle === 'puitis' ? scene.narrationIndoPoetic : scene.narrationIndo;

                return (
                  <div
                    key={scene.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-500/60 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold">
                          ADEGAN 0{scene.id} ({scene.duration} Detik)
                        </span>
                        <button
                          onClick={() => onSelectScene(idx)}
                          className="text-xs text-zinc-400 hover:text-amber-400 font-mono underline"
                        >
                          Lihat di Video
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{scene.titleIndo}</h3>
                      <p className="text-xs text-zinc-400 mb-3">{scene.subtitleIndo}</p>

                      {/* Main Indonesian Narration Quote */}
                      <div className="p-3.5 bg-black/60 rounded-lg border border-zinc-800 mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-mono">
                            VOICEOVER UTAMA (BAHASA INDONESIA):
                          </span>
                          <button
                            onClick={() => playSceneVoice(scene)}
                            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded transition-all"
                            title="Dengarkan Suara Narasi"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Dengarkan</span>
                          </button>
                        </div>
                        <p className="text-sm sm:text-base font-serif italic text-amber-100/95 leading-relaxed">
                          "{narrationToDisplay}"
                        </p>
                      </div>

                      {/* English Original Reference */}
                      <div className="text-xs text-zinc-400 mb-2">
                        <strong className="text-zinc-300 font-mono text-[11px]">Naskah Asli (EN): </strong>
                        <span className="italic font-serif">"{scene.narrationEnglish}"</span>
                      </div>

                      {/* Sound Design & Music Mood */}
                      <div className="text-xs text-zinc-400 space-y-1 bg-zinc-950/50 p-2.5 rounded border border-zinc-800/60">
                        <p><strong className="text-zinc-300">Tata Suara (SFX):</strong> {scene.sfxDescription}</p>
                        <p><strong className="text-zinc-300">Nuansa Musik:</strong> {scene.musicMood}</p>
                        <p><strong className="text-zinc-300">Teks Layar:</strong> <span className="font-mono text-amber-400">{scene.onScreenText}</span></p>
                      </div>
                    </div>

                    {/* Acting & Director Cue */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 italic">
                      <strong className="text-amber-400/80 font-sans not-italic">Catatan Pengarahan: </strong>
                      {scene.actingNotes}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CINEMATOGRAPHY & SHOT BREAKDOWN ================= */}
        {activeTab === 'cinematography' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Spesifikasi Sinematografi & Tata Kamera (Director's Shot List)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rincian teknis lensa anamorphic, sudut pandang, tata cahaya Kelvin, dan gerakan kamera sinematik.
              </p>
            </div>

            <div className="space-y-4">
              {SCENES.map((scene, idx) => (
                <div
                  key={scene.id}
                  className={`p-5 rounded-xl border transition-all ${
                    idx === currentSceneIndex
                      ? 'bg-zinc-900 border-amber-500/60 shadow-lg'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-amber-500 text-stone-950 font-mono text-xs font-bold">
                        SHOT 0{scene.id}
                      </span>
                      <h3 className="text-base font-bold text-white">{scene.titleIndo}</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">Rasio: {scene.aspectRatio}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px] mb-1">Tipe Bidikan</span>
                      <span className="text-amber-300 font-medium">{scene.shotType}</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px] mb-1">Pilihan Lensa</span>
                      <span className="text-amber-300 font-medium">{scene.lensType}</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px] mb-1">Gerakan Kamera</span>
                      <span className="text-amber-300 font-medium">{scene.cameraMovement}</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px] mb-1">Tata Cahaya & Suhu</span>
                      <span className="text-amber-300 font-medium">{scene.lightingSetup}</span>
                    </div>
                  </div>

                  {/* Director Vision & Symbolism */}
                  <div className="p-3.5 bg-zinc-950/70 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
                    <p><strong className="text-amber-400 font-medium">Visi Sutradara:</strong> {scene.directorVision}</p>
                    <p><strong className="text-amber-400 font-medium">Simbolisme Visual:</strong> {scene.symbolism}</p>
                    
                    {/* Color Palette Swatches */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-zinc-400 font-mono text-[11px]">Palet Warna:</span>
                      <div className="flex gap-1.5">
                        {scene.colorPalette.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-5 h-5 rounded-xs border border-white/20 shadow-xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SOUND DESIGN & EMOTIONAL ARC ================= */}
        {activeTab === 'sound' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-400" />
                Desain Tata Suara & Kurva Emosi Dramatis
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Struktur multi-lapisan tata suara foley, musik suling/orkestra, dan grafik intensitas emosi.
              </p>
            </div>

            {/* Emotional Arc Diagram */}
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Grafik Kurva Emosi Sutradara (The Narrative Arc)
              </h3>
              
              <div className="relative w-full h-44 bg-zinc-950 rounded-lg border border-zinc-800 p-4 flex flex-col justify-between">
                {/* SVG Curve Graph */}
                <svg className="absolute inset-x-4 top-4 bottom-8 w-[calc(100%-2rem)] h-[calc(100%-3rem)]" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="30%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="#27272a" strokeDasharray="3 3" />

                  {/* Emotional Curve Path */}
                  <path
                    d="M 10,85 Q 80,80 130,55 T 260,35 T 390,10"
                    fill="none"
                    stroke="url(#curveGrad)"
                    strokeWidth="3.5"
                  />

                  {/* Key emotional points */}
                  <circle cx="20" cy="85" r="5" fill="#64748b" />
                  <circle cx="130" cy="55" r="5" fill="#f59e0b" />
                  <circle cx="260" cy="35" r="5" fill="#22c55e" />
                  <circle cx="385" cy="12" r="6" fill="#eab308" />
                </svg>

                {/* Point Labels */}
                <div className="absolute bottom-2 inset-x-4 flex justify-between text-[10px] sm:text-xs font-mono text-zinc-400">
                  <span className="text-zinc-500">Sc 1: Kehampaan (20%)</span>
                  <span className="text-amber-400">Sc 2: Titik Balik (50%)</span>
                  <span className="text-emerald-400">Sc 3: Peluh Mulia (75%)</span>
                  <span className="text-yellow-400 font-bold">Sc 4: Puncak Keharuan (100%)</span>
                </div>
              </div>
            </div>

            {/* Sound Stem Mixer Simulator */}
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Audio Stem Mixer (Kontrol Kanal Suara)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'dialog', name: 'Dialog / Narasi VO', desc: 'Sulih Suara Bahasa Indonesia' },
                  { key: 'sfx', name: 'Foley / Efek Suara', desc: 'Gembok, cangkul, lumpur' },
                  { key: 'ambience', name: 'Suasana Alami', desc: 'Desau angin, burung fajar' },
                  { key: 'music', name: 'Skor Musik Sinematik', desc: 'Piano, Cello, Suling Bambu' },
                ].map((stem) => {
                  const isEnabled = activeAudioStem[stem.key as keyof typeof activeAudioStem];
                  return (
                    <div
                      key={stem.key}
                      onClick={() => {
                        setActiveAudioStem(prev => ({ ...prev, [stem.key]: !isEnabled }));
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isEnabled
                          ? 'bg-zinc-950 border-amber-500/50 shadow-md'
                          : 'bg-zinc-950/30 border-zinc-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{stem.name}</span>
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
                      </div>
                      <p className="text-[11px] text-zinc-400">{stem.desc}</p>
                      <div className="mt-2 text-[10px] font-mono text-amber-400">
                        {isEnabled ? 'STATUS: AKTIF' : 'STATUS: DIMATIKAN'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: DIRECTOR'S TREATMENT ================= */}
        {activeTab === 'treatment' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase mb-1">
                <Award className="w-4 h-4" />
                Visi Artistik & Statement Sutradara
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2">
                {DIRECTOR_TREATMENT.projectTitleIndo}
              </h2>
              <p className="text-sm font-sans text-amber-200/90 leading-relaxed italic mb-4">
                "{DIRECTOR_TREATMENT.directorLogline}"
              </p>
              <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                <p><strong className="text-amber-400">Inti Tematik:</strong> {DIRECTOR_TREATMENT.thematicCore}</p>
                <p><strong className="text-amber-400">Format:</strong> {DIRECTOR_TREATMENT.format}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Filosofi Bahasa Visual (Visual Language)
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  {DIRECTOR_TREATMENT.visualStyleGuide.colorProgression}
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  {DIRECTOR_TREATMENT.visualStyleGuide.cameraLanguage}
                </p>
              </div>

              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  Resonansi Emosional & Budaya Indonesia
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Film dokumenter ini bukan sekadar tentang perpindahan profesi, melainkan redefinisi makna 'sukses'. Di tengah himpitan modernitas kota yang individualistis, kembalinya sang ayah ke tanah persawahan adalah penghormatan tertinggi bagi martabat keluarga dan warisan leluhur nusantara.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: AI ASISTEN SUTRADARA ================= */}
        {activeTab === 'ai_director' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                AI Creative Director Suite (Didukung Kecerdasan Sinematik)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kembangkan naskah narasi alternatif, monolog batin panjang, adaptasi puisi, atau analisis teknis kamera.
              </p>
            </div>

            {/* AI Generator Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenerateAiTreatment('monologue')}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Buatkan Monolog Batin (60 Detik)</span>
              </button>

              <button
                onClick={() => handleGenerateAiTreatment('poetry')}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gubah Narasi Jadi Puisi Nusantara</span>
              </button>

              <button
                onClick={() => handleGenerateAiTreatment('analysis')}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Analisis Psikologi Karakter & Kamera</span>
              </button>
            </div>

            {/* Generated AI Result Output Card */}
            {isGeneratingAi && (
              <div className="p-6 bg-zinc-900 rounded-xl border border-amber-500/30 flex items-center justify-center gap-3 text-amber-300">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-mono">Sutradara AI sedang menyusun naskah dramatis...</span>
              </div>
            )}

            {aiResult && (
              <div className="p-5 bg-zinc-900/90 rounded-xl border border-amber-500/50 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-semibold">
                    HASIL PENGEMBANGAN SUTRADARA AI:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                    }}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                </div>
                <pre className="text-xs sm:text-sm font-serif text-amber-100/90 whitespace-pre-wrap leading-relaxed bg-black/60 p-4 rounded-lg border border-zinc-800">
                  {aiResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= FULLSCREEN LIGHTBOX INSPECTION MODAL ================= */}
      {activeLightboxScene && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-stone-950 font-mono text-xs font-bold">
                ADEGAN 0{activeLightboxScene.id}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {activeLightboxScene.titleIndo}
                </h3>
                <p className="text-xs text-zinc-400 hidden sm:block">
                  {activeLightboxScene.subtitleIndo} &bull; Teks Layar: {activeLightboxScene.onScreenText}
                </p>
              </div>
            </div>

            {/* Lightbox Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom(prev => Math.min(2.5, prev + 0.25))}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Perbesar (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom(prev => Math.max(0.75, prev - 0.25))}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom(1)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowTechnicalOverlay(!showTechnicalOverlay)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  showTechnicalOverlay 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                Info Teknis
              </button>
              <button
                onClick={() => handleDownloadStill(activeLightboxScene)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh HD</span>
              </button>
              <button
                onClick={() => {
                  setLightboxSceneIndex(null);
                  setLightboxZoom(1);
                }}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden my-4">
            {/* Previous & Next Navigation Buttons */}
            <button
              onClick={() => {
                if (lightboxSceneIndex !== null) {
                  setLightboxSceneIndex((lightboxSceneIndex - 1 + SCENES.length) % SCENES.length);
                  setLightboxZoom(1);
                }
              }}
              className="absolute left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-amber-500 hover:text-stone-950 text-white border border-zinc-700 transition-all backdrop-blur-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                if (lightboxSceneIndex !== null) {
                  setLightboxSceneIndex((lightboxSceneIndex + 1) % SCENES.length);
                  setLightboxZoom(1);
                }
              }}
              className="absolute right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-amber-500 hover:text-stone-950 text-white border border-zinc-700 transition-all backdrop-blur-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Image with Zoom Scale */}
            <div 
              className="relative max-w-5xl max-h-full aspect-[16/9] shadow-2xl rounded-lg overflow-hidden border border-zinc-800 transition-transform duration-200"
              style={{ transform: `scale(${lightboxZoom})` }}
            >
              <img
                src={activeLightboxScene.imageStill}
                alt={activeLightboxScene.titleIndo}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-black"
              />

              {/* Technical Overlay HUD */}
              {showTechnicalOverlay && (
                <div className="absolute top-4 left-4 p-3.5 bg-black/80 backdrop-blur-md rounded-lg border border-zinc-700/80 text-xs font-mono text-zinc-300 space-y-1 max-w-sm pointer-events-none">
                  <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>CAMERA SPECIFICATIONS</span>
                  </div>
                  <p><span className="text-zinc-500">Kamera:</span> {activeLightboxScene.cameraSpecs?.sensor}</p>
                  <p><span className="text-zinc-500">Lensa:</span> {activeLightboxScene.cameraSpecs?.focalLength} ({activeLightboxScene.cameraSpecs?.aperture})</p>
                  <p><span className="text-zinc-500">ISO / Shutter:</span> {activeLightboxScene.cameraSpecs?.iso} | {activeLightboxScene.cameraSpecs?.shutterAngle}</p>
                  <p><span className="text-zinc-500">Kelvin:</span> {activeLightboxScene.cameraSpecs?.kelvin}</p>
                  <p><span className="text-zinc-500">Pencahayaan:</span> {activeLightboxScene.lightingSetup}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lightbox Footer Bar with Narration & Quick Switch */}
          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <p className="text-xs font-serif italic text-amber-200">
                "{selectedVoiceStyle === 'puitis' ? activeLightboxScene.narrationIndoPoetic : activeLightboxScene.narrationIndo}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (lightboxSceneIndex !== null) {
                    onSelectScene(lightboxSceneIndex);
                    setLightboxSceneIndex(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar Adegan Ini di Player</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

