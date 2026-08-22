import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SceneData, ColorLut, AspectRatioPreset, VisualMode } from '../types';

interface CinematicViewportProps {
  currentScene: SceneData;
  sceneProgress: number; // 0 to 1 within scene
  totalProgress: number; // 0 to 1 across whole film
  colorLut: ColorLut;
  aspectRatio: AspectRatioPreset;
  filmGrain: boolean;
  lensFlare: boolean;
  subtitlesEnabled: boolean;
  cameraShake: boolean;
  onScreenTextVisible: boolean;
  narrationText: string;
  highlightedCharIndex: number;
  visualMode?: VisualMode;
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  currentScene,
  sceneProgress,
  colorLut,
  aspectRatio,
  filmGrain,
  lensFlare,
  subtitlesEnabled,
  cameraShake,
  onScreenTextVisible,
  narrationText,
  visualMode = 'photorealistic',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Film Grain Canvas Simulation (24fps noise generator)
  useEffect(() => {
    if (!filmGrain) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 24;

    const renderGrain = (time: number) => {
      animId = requestAnimationFrame(renderGrain);
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const imgData = ctx.createImageData(w, h);
      const buffer = new Uint32Array(imgData.data.buffer);
      const len = buffer.length;

      for (let i = 0; i < len; i += 2) {
        if (Math.random() < 0.18) {
          const val = Math.floor(Math.random() * 255);
          // semi-transparent grayscale noise
          buffer[i] = (25 << 24) | (val << 16) | (val << 8) | val;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    animId = requestAnimationFrame(renderGrain);
    return () => cancelAnimationFrame(animId);
  }, [filmGrain]);

  // Color LUT classes and styles
  const getLutFilter = (lut: ColorLut) => {
    switch (lut) {
      case 'golden_dawn':
        return 'sepia(20%) saturate(135%) contrast(108%) hue-rotate(-6deg) brightness(103%)';
      case 'cinematic_kodachrome':
        return 'contrast(118%) saturate(130%) brightness(98%)';
      case 'teal_orange':
        return 'contrast(122%) saturate(120%) drop-shadow(0 0 1px #0ea5e9)';
      case 'moody_pre_dawn':
        return 'saturate(70%) contrast(125%) brightness(88%) hue-rotate(180deg)';
      case 'vintage_sepia':
        return 'sepia(60%) contrast(112%) brightness(95%)';
      default:
        return 'none';
    }
  };

  // Aspect ratio calculation
  const getAspectRatioClass = (ratio: AspectRatioPreset) => {
    switch (ratio) {
      case '2.39':
        return 'aspect-[2.39/1]';
      case '16:9':
        return 'aspect-[16/9]';
      case '4:3':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[2.39/1]';
    }
  };

  return (
    <div className="relative w-full bg-black flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-zinc-800/80 group">
      {/* Cinema Frame Container with selected aspect ratio */}
      <div 
        className={`relative w-full ${getAspectRatioClass(aspectRatio)} max-h-[70vh] bg-stone-950 overflow-hidden flex items-center justify-center transition-all duration-500`}
        style={{
          filter: getLutFilter(colorLut),
        }}
      >
        {/* Dynamic Scene Visual Layers (Photorealistic Still or Dynamic Motion Art) */}
        <div 
          className={`absolute inset-0 w-full h-full transform transition-transform duration-700 ease-out ${
            cameraShake ? 'animate-subtle-shake' : ''
          }`}
          style={{
            transform: `scale(${1 + sceneProgress * 0.08}) translate(${(sceneProgress - 0.5) * 12}px, ${(sceneProgress - 0.5) * -6}px)`,
          }}
        >
          {visualMode === 'photorealistic' && currentScene.imageStill ? (
            <div className="relative w-full h-full overflow-hidden bg-black">
              <img
                src={currentScene.imageStill}
                alt={currentScene.titleIndo}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out"
                style={{
                  transform: `scale(${1.04 + sceneProgress * 0.06}) translate(${(sceneProgress - 0.5) * -1.5}%, ${(sceneProgress - 0.5) * -1}%)`,
                }}
              />
              {/* Subtle lighting gradation over photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            </div>
          ) : (
            <>
              {currentScene.id === 1 && <Scene1Visual progress={sceneProgress} />}
              {currentScene.id === 2 && <Scene2Visual progress={sceneProgress} />}
              {currentScene.id === 3 && <Scene3Visual progress={sceneProgress} />}
              {currentScene.id === 4 && <Scene4Visual progress={sceneProgress} />}
            </>
          )}
        </div>

        {/* Anamorphic Lens Flare Overlay */}
        {lensFlare && (
          <div 
            className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70 transition-opacity duration-300"
            style={{
              background: currentScene.id >= 3 
                ? `radial-gradient(ellipse 120% 25% at ${30 + sceneProgress * 40}% 45%, rgba(251, 191, 36, 0.45) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 80%)`
                : `radial-gradient(ellipse 80% 20% at 20% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 70%)`
            }}
          />
        )}

        {/* 24FPS Film Grain Canvas */}
        {filmGrain && (
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="pointer-events-none absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
          />
        )}

        {/* Anamorphic Vignette & Widescreen Rim */}
        <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%]" />

        {/* On-Screen Cinematic Title Cards */}
        <AnimatePresence mode="wait">
          {onScreenTextVisible && (
            <motion.div
              key={`title-${currentScene.id}`}
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 1.04 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20"
            >
              <div className="bg-black/40 backdrop-blur-xs px-8 py-4 rounded-lg border border-amber-500/20 shadow-2xl">
                <span className="text-xs uppercase tracking-[0.4em] text-amber-300/80 font-mono mb-1 block">
                  {currentScene.subText || "DOKUMENTER NUSANTARA"}
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif tracking-[0.25em] text-white font-bold drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] uppercase">
                  {currentScene.onScreenText}
                </h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene Badge & Timecode (Director Monitor Style) */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/75 border border-zinc-700 text-[11px] font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>REC 24FPS</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-black/75 border border-zinc-700 text-[11px] font-mono text-zinc-300 hidden sm:block">
            {currentScene.shotType.split(' ')[0]} | {currentScene.lensType.split(' ')[0]}
          </div>
        </div>

        {/* Scene Title Watermark */}
        <div className="absolute top-3 right-4 z-20 px-2.5 py-1 rounded bg-black/75 border border-zinc-700 text-[11px] font-mono text-zinc-400">
          SCENE 0{currentScene.id} / 04
        </div>

        {/* Subtitles / Teleprompter Display */}
        {subtitlesEnabled && narrationText && (
          <div className="absolute bottom-6 inset-x-6 z-20 flex justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl bg-black/80 backdrop-blur-md px-6 py-3 rounded-lg border border-zinc-700/60 shadow-2xl text-center"
            >
              <p className="text-base sm:text-lg md:text-xl font-sans text-amber-100/95 font-medium leading-relaxed drop-shadow-md">
                "{narrationText}"
              </p>
              <p className="text-xs text-zinc-400 font-serif italic mt-1">
                {currentScene.narrationEnglish}
              </p>
            </motion.div>
          </div>
        )}

        {/* 2.39:1 Letterbox Bars if needed */}
        {aspectRatio === '2.39' && (
          <>
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[3%] bg-black" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[3%] bg-black" />
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// SCENE 1: ESTABLISHING THE SHOP (WARUNG SUNYI)
// ==========================================
const Scene1Visual: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="relative w-full h-full bg-[#0b0f19] flex items-center justify-center overflow-hidden">
      {/* Background: Dimly Lit Shop Shelves & Pre-dawn Window Light */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transform scale-105"
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #151e2e 50%, #1f293d 100%)'
        }}
      />

      {/* Background Shop Shelves and Goods Silhouette */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="shelfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="warmLight" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.45)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>
          <linearGradient id="dawnBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 197, 253, 0.3)" />
            <stop offset="100%" stopColor="rgba(147, 197, 253, 0)" />
          </linearGradient>
        </defs>

        {/* Cold Dawn light beam from window */}
        <polygon points="650,0 800,0 800,450 500,450" fill="url(#dawnBeam)" opacity="0.6" />

        {/* Background Shelves */}
        <rect x="50" y="80" width="220" height="260" fill="url(#shelfGrad)" rx="4" />
        <rect x="60" y="110" width="200" height="6" fill="#334155" />
        <rect x="60" y="170" width="200" height="6" fill="#334155" />
        <rect x="60" y="230" width="200" height="6" fill="#334155" />
        <rect x="60" y="290" width="200" height="6" fill="#334155" />

        {/* Glass Jars & Cans on Shelves */}
        <circle cx="90" cy="98" r="10" fill="#475569" />
        <circle cx="120" cy="98" r="10" fill="#64748b" />
        <rect x="150" y="86" width="16" height="24" fill="#3b82f6" opacity="0.5" />
        <rect x="175" y="86" width="18" height="24" fill="#ef4444" opacity="0.4" />
        <rect x="80" y="145" width="22" height="25" fill="#f59e0b" opacity="0.4" />
        <rect x="115" y="148" width="20" height="22" fill="#10b981" opacity="0.3" />

        {/* Refrigerator in Background */}
        <rect x="620" y="90" width="110" height="250" fill="#1e293b" rx="6" />
        <rect x="625" y="95" width="100" height="110" fill="#334155" opacity="0.6" />
        <rect x="625" y="215" width="100" height="120" fill="#334155" opacity="0.6" />

        {/* Hanging Tungsten Bulb */}
        <line x1="400" y1="0" x2="400" y2="90" stroke="#475569" strokeWidth="2" />
        <circle cx="400" cy="95" r="9" fill="#fef08a" />
        <polygon points="360,95 440,95 560,380 240,380" fill="url(#warmLight)" />

        {/* Wooden Counter Desk */}
        <polygon points="180,280 620,280 670,450 130,450" fill="#1c1917" />
        <line x1="180" y1="280" x2="620" y2="280" stroke="#78350f" strokeWidth="4" />

        {/* Account Book & Pen on Counter */}
        <rect x="350" y="300" width="100" height="70" fill="#f8fafc" rx="2" transform="rotate(-6 400 335)" opacity="0.9" />
        <line x1="360" y1="315" x2="440" y2="305" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="360" y1="330" x2="440" y2="320" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="360" y1="345" x2="440" y2="335" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>

      {/* Father Figure (Thoughtful & Tired looking at ledger) */}
      <div 
        className="absolute bottom-0 z-10 flex flex-col items-center"
        style={{
          transform: `translateY(${progress * 4}px)`,
        }}
      >
        <svg width="340" height="340" viewBox="0 0 340 340">
          <defs>
            <linearGradient id="fatherSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Father Body & Shirt */}
          <path d="M90,340 C95,250 120,200 170,200 C220,200 245,250 250,340 Z" fill="url(#shirtGrad)" />
          {/* Shirt Collar & Wrinkles */}
          <polygon points="170,200 145,240 195,240" fill="#cbd5e1" />
          <line x1="170" y1="240" x2="170" y2="340" stroke="#64748b" strokeWidth="2" />
          
          {/* Arms resting on desk */}
          <path d="M100,280 C110,240 135,270 170,290" stroke="#92400e" strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d="M240,280 C230,240 205,270 170,290" stroke="#92400e" strokeWidth="18" strokeLinecap="round" fill="none" />

          {/* Head (Tilted down thoughtfully) */}
          <ellipse cx="170" cy="155" rx="36" ry="46" fill="url(#fatherSkin)" />
          {/* Hair */}
          <path d="M132,145 C132,105 160,100 175,100 C205,100 210,120 210,145 C195,130 170,125 132,145 Z" fill="#18181b" />
          {/* Tired Facial Details */}
          <path d="M150,148 Q158,145 165,149" stroke="#451a03" strokeWidth="2.5" fill="none" />
          <path d="M175,149 Q182,145 190,148" stroke="#451a03" strokeWidth="2.5" fill="none" />
          {/* Downcast Eyes looking at ledger */}
          <ellipse cx="158" cy="158" rx="4" ry="2.5" fill="#451a03" />
          <ellipse cx="182" cy="158" rx="4" ry="2.5" fill="#451a03" />
          {/* Nose & Mouth (Thoughtful, slight frown) */}
          <line x1="170" y1="156" x2="168" y2="172" stroke="#78350f" strokeWidth="2" />
          <path d="M162,185 Q170,183 178,185" stroke="#78350f" strokeWidth="2" fill="none" />
          {/* Five o'clock shadow stubble */}
          <ellipse cx="170" cy="186" rx="20" ry="12" fill="#451a03" opacity="0.25" />
        </svg>
      </div>

      {/* Subtle Dust Particles in Light Beam */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-200/40 animate-float"
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDuration: `${Math.random() * 5 + 4}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// SCENE 2: CLOSING UP & THE TURN (TITIK BALIK)
// ==========================================
const Scene2Visual: React.FC<{ progress: number }> = ({ progress }) => {
  const shutterHeight = Math.min(100, Math.max(20, progress * 110));

  return (
    <div className="relative w-full h-full bg-[#0a0f1d] flex items-center justify-center overflow-hidden">
      {/* Background: Morning City street & Bus in distance */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] via-[#0f172a] to-[#020617]" />

      {/* Shutter Shop Frame */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="metalShutter" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="morningGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.15)" />
          </linearGradient>
        </defs>

        {/* Outside Morning Street horizon */}
        <rect x="0" y="260" width="800" height="190" fill="#0f172a" />
        {/* Morning Sun breaking over horizon */}
        <circle cx="680" cy="220" r="70" fill="url(#morningGlow)" />

        {/* Bus Silhouette in Distance */}
        <rect x="580" y="230" width="110" height="45" fill="#1e293b" rx="4" />
        <circle cx="605" cy="275" r="8" fill="#334155" />
        <circle cx="665" cy="275" r="8" fill="#334155" />
        {/* Bus Windows */}
        <rect x="590" y="238" width="18" height="15" fill="#38bdf8" opacity="0.6" />
        <rect x="615" y="238" width="18" height="15" fill="#38bdf8" opacity="0.6" />
        <rect x="640" y="238" width="18" height="15" fill="#38bdf8" opacity="0.6" />
        <rect x="665" y="238" width="18" height="15" fill="#facc15" opacity="0.8" />

        {/* Corrugated Shutter Metal Frame */}
        <rect x="60" y="20" width="400" height="380" fill="#0f172a" stroke="#334155" strokeWidth="6" rx="4" />
      </svg>

      {/* Animated Roller Shutter coming down */}
      <div 
        className="absolute left-[7.5%] top-[5%] w-[50%] overflow-hidden border-b-4 border-zinc-900 shadow-2xl transition-all duration-200"
        style={{ height: `${shutterHeight}%` }}
      >
        <div className="w-full h-full bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 flex flex-col justify-between p-2">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="w-full h-2 bg-slate-900/40 border-t border-slate-500/50 rounded-xs" />
          ))}
        </div>
      </div>

      {/* Father pulling the shutter down & holding family photo */}
      <div 
        className="absolute z-10 bottom-0 left-[25%] sm:left-[32%] transform transition-transform duration-500"
        style={{
          transform: `translateX(${progress * 30}px) scale(${1 - progress * 0.05})`,
        }}
      >
        <svg width="340" height="360" viewBox="0 0 340 360">
          <defs>
            <linearGradient id="fatherSkin2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* Father Body in Profile/Semi-Back */}
          <path d="M120,360 C125,270 140,210 180,210 C210,210 225,270 230,360 Z" fill="#e2e8f0" />
          {/* Arm pulling shutter */}
          <path d="M165,220 L110,130 L100,140" stroke="#b45309" strokeWidth="18" strokeLinecap="round" fill="none" />
          <ellipse cx="100" cy="135" rx="9" ry="8" fill="#b45309" />

          {/* Left Arm holding cardboard box & family photo */}
          <path d="M195,230 L225,280" stroke="#b45309" strokeWidth="18" strokeLinecap="round" fill="none" />
          {/* Cardboard Box */}
          <polygon points="210,270 270,270 260,330 200,330" fill="#b45309" stroke="#78350f" strokeWidth="3" />
          {/* Family Photo sticking out or in hand */}
          <rect x="180" y="250" width="28" height="36" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" transform="rotate(-15 190 260)" />
          <circle cx="190" cy="262" r="4" fill="#d97706" />
          <circle cx="199" cy="265" r="3" fill="#0284c7" />

          {/* Resolute Head Profile Looking Up */}
          <ellipse cx="180" cy="165" rx="30" ry="38" fill="url(#fatherSkin2)" />
          {/* Hair */}
          <path d="M152,155 C152,125 175,120 195,125 C210,130 215,145 210,165 C200,150 180,145 152,155 Z" fill="#18181b" />
          {/* Resolute Eye & Jawline Profile */}
          <path d="M195,160 L205,160" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M190,185 L202,185" stroke="#78350f" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// SCENE 3: WORKING THE FIELDS (SAWAH LELUHUR)
// ==========================================
const Scene3Visual: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="relative w-full h-full bg-[#14532d] flex items-center justify-center overflow-hidden">
      {/* Sky Gradient: Morning Golden Sunrise */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #38bdf8 0%, #fde047 50%, #f59e0b 85%, #15803d 100%)'
        }}
      />

      {/* Sun Rays & Mountain Horizon (Gunung Berapi / Perbukitan Hijau) */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="sunBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.7)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" opacity="0.7" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="waterReflect" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" opacity="0.6" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>

        {/* Golden Sun Rising */}
        <circle cx="280" cy="180" r="55" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 35px #f59e0b)" />

        {/* Mountain Silhouettes */}
        <polygon points="0,240 180,120 360,240" fill="url(#mountainGrad)" opacity="0.7" />
        <polygon points="280,240 480,90 700,240" fill="url(#mountainGrad)" opacity="0.6" />
        <polygon points="560,240 680,150 800,240" fill="url(#mountainGrad)" opacity="0.8" />

        {/* Terraced Rice Fields (Terasering Sawah) */}
        <path d="M0,220 Q200,200 400,230 T800,210 L800,450 L0,450 Z" fill="#166534" />
        <path d="M0,250 Q250,230 500,260 T800,245 L800,450 L0,450 Z" fill="url(#waterReflect)" />
        
        {/* Terrace ridges */}
        <path d="M0,280 Q300,260 600,290 T800,270 L800,450 L0,450 Z" fill="#15803d" />
        <path d="M0,320 Q200,300 450,330 T800,310 L800,450 L0,450 Z" fill="#22c55e" opacity="0.9" />
        <path d="M0,360 Q350,340 700,370 T800,350 L800,450 L0,450 Z" fill="#14532d" />

        {/* Green Paddy Stems (Batang Padi) */}
        {[...Array(24)].map((_, i) => (
          <path
            key={i}
            d={`M${i * 35 + 10},${370 + (i % 3) * 15} Q${i * 35 + 15},${340 + (i % 3) * 15} ${i * 35 + 25},${330 + (i % 3) * 15}`}
            stroke="#86efac"
            strokeWidth="2.5"
            fill="none"
          />
        ))}

        {/* Flying Birds in Morning Sky */}
        <path d="M120,90 Q128,82 136,90 Q144,82 152,90" stroke="#78350f" strokeWidth="2" fill="none" />
        <path d="M160,110 Q166,104 172,110 Q178,104 184,110" stroke="#78350f" strokeWidth="1.8" fill="none" />
        <path d="M210,95 Q216,90 222,95 Q228,90 234,95" stroke="#78350f" strokeWidth="1.8" fill="none" />
      </svg>

      {/* Farmer Figure swinging Cangkul with Caping hat */}
      <div 
        className="absolute z-10 bottom-0 left-[35%] sm:left-[42%]"
        style={{
          transform: `translateY(${Math.sin(progress * Math.PI * 2) * 5}px) scale(${1 + progress * 0.05})`,
        }}
      >
        <svg width="340" height="380" viewBox="0 0 340 380">
          <defs>
            <linearGradient id="capingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="mudSplash" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Muddy Water Splash at feet */}
          <ellipse cx="170" cy="360" rx="60" ry="14" fill="#3f2e18" opacity="0.8" />
          <circle cx="130" cy="350" r="4" fill="#78350f" />
          <circle cx="210" cy="348" r="5" fill="#78350f" />
          <circle cx="180" cy="342" r="3" fill="#fbbf24" />

          {/* Farmer Legs in Mud */}
          <path d="M140,300 L145,360" stroke="#92400e" strokeWidth="20" strokeLinecap="round" />
          <path d="M190,300 L195,360" stroke="#92400e" strokeWidth="20" strokeLinecap="round" />

          {/* Farmer Torso with Simple Vest/Shirt */}
          <path d="M125,300 C130,230 145,190 170,190 C195,190 210,230 215,300 Z" fill="#e2e8f0" />
          {/* Rolled Up Sleeves and Muscular Arms swinging Cangkul */}
          <path d="M135,210 L100,260 L80,290" stroke="#b45309" strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M200,210 L150,260 L95,280" stroke="#b45309" strokeWidth="16" strokeLinecap="round" fill="none" />

          {/* Cangkul (Hoe) Wooden Handle & Metal Blade */}
          <line x1="85" y1="285" x2="60" y2="365" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
          {/* Cangkul Blade cutting mud */}
          <polygon points="50,355 75,360 65,378 40,373" fill="#64748b" stroke="#334155" strokeWidth="2" />

          {/* Head & Neck */}
          <ellipse cx="170" cy="165" rx="24" ry="28" fill="#d97706" />

          {/* Traditional Woven Caping Hat (Conical Straw Hat) */}
          <polygon points="170,95 240,155 100,155" fill="url(#capingGrad)" stroke="#78350f" strokeWidth="2" />
          {/* Caping Weave Pattern Lines */}
          <line x1="170" y1="95" x2="135" y2="155" stroke="#78350f" strokeWidth="1" />
          <line x1="170" y1="95" x2="170" y2="155" stroke="#78350f" strokeWidth="1" />
          <line x1="170" y1="95" x2="205" y2="155" stroke="#78350f" strokeWidth="1" />

          {/* Focused expression and sweat glistening */}
          <circle cx="165" cy="168" r="2.5" fill="#fef08a" />
          <circle cx="175" cy="174" r="2" fill="#fef08a" />
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// SCENE 4: FAMILY AND FUTURE (WARISAN ABADI)
// ==========================================
const Scene4Visual: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="relative w-full h-full bg-[#78350f] flex items-center justify-center overflow-hidden">
      {/* Sky: Breathtaking Golden Hour Sunset */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #ea580c 0%, #f59e0b 45%, #fbbf24 75%, #ca8a04 100%)'
        }}
      />

      {/* Panoramic Golden Harvest Field & Setting Sun */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="paddyGolden" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>
        </defs>

        {/* Massive Majestic Setting Sun on Horizon */}
        <circle cx="400" cy="220" r="90" fill="url(#sunGlow)" opacity="0.95" filter="drop-shadow(0 0 50px #ea580c)" />

        {/* Distant Hills in Sunset Mist */}
        <path d="M0,260 Q200,220 400,250 T800,240 L800,450 L0,450 Z" fill="#9a3412" opacity="0.6" />
        <path d="M0,280 Q300,250 600,280 T800,260 L800,450 L0,450 Z" fill="#78350f" opacity="0.8" />

        {/* Golden Harvest Field (Padi Menguning Matang) */}
        <rect x="0" y="300" width="800" height="150" fill="url(#paddyGolden)" />

        {/* Swaying Golden Grains Foreground */}
        {[...Array(35)].map((_, i) => (
          <g key={i}>
            <path
              d={`M${i * 24 + 8},450 Q${i * 24 + 16},370 ${i * 24 + 28 + Math.sin(progress * 4 + i) * 6},330`}
              stroke="#fef08a"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Grain head */}
            <ellipse 
              cx={i * 24 + 28 + Math.sin(progress * 4 + i) * 6} 
              cy="330" 
              rx="4" 
              ry="7" 
              fill="#fbbf24" 
              transform={`rotate(20 ${i * 24 + 28} 330)`}
            />
          </g>
        ))}
      </svg>

      {/* Father, Mother, and Children (Hero Family Composition) */}
      <div 
        className="absolute z-10 bottom-0 left-[22%] sm:left-[30%]"
        style={{
          transform: `scale(${1 + progress * 0.04})`,
        }}
      >
        <svg width="460" height="380" viewBox="0 0 460 380">
          <defs>
            <linearGradient id="skinGolden" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* ================= MOTHER FIGURE (Right) ================= */}
          <g transform="translate(180, 20)">
            {/* Mother Torso & Kebaya/Blouse */}
            <path d="M120,360 C125,280 140,240 165,240 C190,240 205,280 210,360 Z" fill="#f43f5e" opacity="0.9" />
            {/* Mother Head & Sanggul Hair */}
            <ellipse cx="165" cy="205" rx="20" ry="24" fill="url(#skinGolden)" />
            <ellipse cx="178" cy="198" rx="10" ry="12" fill="#18181b" /> {/* Sanggul */}
            <path d="M148,198 C148,180 165,175 180,180 C185,190 185,205 180,212 C170,200 160,195 148,198 Z" fill="#18181b" />
            {/* Mother Smile & Warm Eye */}
            <path d="M156,208 Q162,205 168,208" stroke="#451a03" strokeWidth="2" fill="none" />
            <path d="M156,218 Q165,224 174,218" stroke="#78350f" strokeWidth="2.5" fill="none" />

            {/* Mother Arm holding/carrying toddler */}
            <path d="M140,260 C130,290 150,310 170,300" stroke="#b45309" strokeWidth="12" strokeLinecap="round" fill="none" />
            {/* Toddler on Mother's Hip */}
            <ellipse cx="140" cy="270" rx="15" ry="18" fill="url(#skinGolden)" />
            <circle cx="140" cy="252" r="12" fill="url(#skinGolden)" />
            <path d="M130,248 C130,240 148,240 150,248 Z" fill="#18181b" />
          </g>

          {/* ================= FATHER & CHILD ON SHOULDERS (Center-Left) ================= */}
          <g transform="translate(40, 0)">
            {/* Father Body */}
            <path d="M110,380 C115,260 140,210 180,210 C220,210 245,260 250,380 Z" fill="#fed7aa" />
            
            {/* Father Arms holding Child's legs */}
            <path d="M125,220 L105,150 L120,135" stroke="#b45309" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M235,220 L255,150 L240,135" stroke="#b45309" strokeWidth="16" strokeLinecap="round" fill="none" />

            {/* Father Head (Beaming with huge smile) */}
            <ellipse cx="180" cy="180" rx="30" ry="36" fill="url(#skinGolden)" />
            <path d="M152,168 C152,145 170,140 185,140 C205,140 210,150 208,168 C195,158 175,155 152,168 Z" fill="#18181b" />
            {/* Joyful Crinkled Eyes */}
            <path d="M162,174 Q170,170 176,175" stroke="#451a03" strokeWidth="2.5" fill="none" />
            <path d="M184,175 Q190,170 198,174" stroke="#451a03" strokeWidth="2.5" fill="none" />
            {/* Big Open Happy Smile */}
            <path d="M164,192 Q180,208 196,192 Z" fill="#451a03" />
            <path d="M168,193 Q180,198 192,193" fill="#ffffff" /> {/* White teeth */}

            {/* ================= CHILD ON SHOULDERS ================= */}
            {/* Child Legs dangling over father shoulders */}
            <rect x="120" y="140" width="16" height="45" rx="8" fill="#d97706" />
            <rect x="224" y="140" width="16" height="45" rx="8" fill="#d97706" />

            {/* Child Torso */}
            <rect x="155" y="70" width="50" height="60" rx="10" fill="#38bdf8" />
            {/* Child Head */}
            <circle cx="180" cy="48" r="22" fill="url(#skinGolden)" />
            {/* Child Caping / Hat */}
            <polygon points="180,10 225,42 135,42" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
            {/* Child Laughing Face */}
            <path d="M168,45 Q174,42 178,45" stroke="#451a03" strokeWidth="2" fill="none" />
            <path d="M182,45 Q186,42 192,45" stroke="#451a03" strokeWidth="2" fill="none" />
            <path d="M172,55 Q180,64 188,55 Z" fill="#451a03" />
          </g>
        </svg>
      </div>

      {/* Floating Golden Dust Particles (Golden Hour Bokeh) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-100/60 shadow-[0_0_8px_#fde047] animate-float"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              top: `${Math.random() * 85 + 5}%`,
              left: `${Math.random() * 90 + 5}%`,
              animationDuration: `${Math.random() * 4 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
