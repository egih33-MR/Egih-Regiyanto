// Professional Web Audio & Indonesian Voiceover Narration Engine

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private activeOscillators: { stop: () => void }[] = [];
  private ambientNoiseNode: AudioNode | null = null;
  private isSpeechSupported: boolean = false;
  private speechSynth: SpeechSynthesis | null = null;
  private indonesianVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSpeechSupported = 'speechSynthesis' in window;
      if (this.isSpeechSupported) {
        this.speechSynth = window.speechSynthesis;
        this.loadVoices();
        if (this.speechSynth.onvoiceschanged !== undefined) {
          this.speechSynth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    // Look for Indonesian voice (id-ID or id)
    this.indonesianVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('Indonesian')) || 
                           voices.find(v => v.lang.includes('MS') || v.lang.includes('ms')) || 
                           voices[0] || null;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // Audio context might fail on non-interactive load
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : vol, this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    if (muted && this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  public stopAllSounds() {
    this.activeOscillators.forEach(o => {
      try { o.stop(); } catch { /* empty */ }
    });
    this.activeOscillators = [];
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  // Play cinematic music chord progressions based on scene
  public playSceneAmbience(sceneIndex: number) {
    this.init();
    if (!this.ctx || !this.musicGain || !this.sfxGain || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopAllSounds();
    const now = this.ctx.currentTime;

    if (sceneIndex === 0) {
      // Scene 1: Cold low refrigerator drone + Melancholic single D-minor piano chord
      this.createDrone(65, 0.15, 3.5); // Refrigerator/Room Tone
      this.createPianoNote(146.83, now, 3.0, 0.3); // D3
      this.createPianoNote(174.61, now + 0.6, 2.5, 0.25); // F3
      this.createPianoNote(220.00, now + 1.2, 2.5, 0.2); // A3
    } else if (sceneIndex === 1) {
      // Scene 2: Metal shutter slam foley + rising cello tension (F Major to G)
      this.createMetallicImpact(now + 0.4);
      this.createCelloNote(87.31, now + 0.8, 3.2, 0.35); // F2
      this.createCelloNote(130.81, now + 1.2, 3.0, 0.3); // C3
      this.createCelloNote(164.81, now + 2.0, 2.5, 0.35); // E3 (Hope rising)
    } else if (sceneIndex === 2) {
      // Scene 3: Sawah nature breeze, morning bird chirps + Pentatonic bamboo flute/Kacapi resonance + splash
      this.createNatureWind(4.5);
      this.createBirdChirp(now + 0.6);
      this.createBirdChirp(now + 2.2);
      this.createWaterSplash(now + 0.8);
      // Traditional emotional melody (Pelog/Slendro feel transposed to soothing modal strings)
      this.createSulingNote(293.66, now + 0.2, 2.0); // D4
      this.createSulingNote(329.63, now + 1.0, 2.0); // E4
      this.createSulingNote(392.00, now + 1.8, 2.2); // G4
      this.createSulingNote(440.00, now + 2.6, 2.5); // A4
    } else if (sceneIndex === 3) {
      // Scene 4: Golden hour triumphant emotional crescendo + warm laughter harmonics + grand resolution
      this.createWarmBreeze(5.0);
      this.createGrandChords(now);
      this.createChimeArpeggio(now + 1.0);
    }
  }

  private createPianoNote(freq: number, startTime: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
    this.activeOscillators.push({ stop: () => { try { osc.stop(); } catch { /* empty */ } } });
  }

  private createCelloNote(freq: number, startTime: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, startTime);
    filter.frequency.linearRampToValueAtTime(800, startTime + duration * 0.5);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
    this.activeOscillators.push({ stop: () => { try { osc.stop(); } catch { /* empty */ } } });
  }

  private createSulingNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle breath vibrato
    vibrato.frequency.setValueAtTime(5, startTime);
    vibratoGain.gain.setValueAtTime(4, startTime);
    vibrato.connect(osc.frequency);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    vibrato.start(startTime);
    osc.start(startTime);
    vibrato.stop(startTime + duration);
    osc.stop(startTime + duration);
    this.activeOscillators.push({ stop: () => { try { osc.stop(); vibrato.stop(); } catch { /* empty */ } } });
  }

  private createGrandChords(now: number) {
    if (!this.ctx || !this.musicGain) return;
    // D Major to G Major sweeping cinematic resolution
    const chordNotes = [
      { f: 146.83, delay: 0 },   // D3
      { f: 220.00, delay: 0.1 }, // A3
      { f: 293.66, delay: 0.2 }, // D4
      { f: 369.99, delay: 0.3 }, // F#4
      { f: 440.00, delay: 0.4 }, // A4
      { f: 587.33, delay: 0.5 }, // D5
    ];

    chordNotes.forEach(item => {
      this.createPianoNote(item.f, now + item.delay, 4.5, 0.22);
    });
  }

  private createDrone(freq: number, volume: number, duration: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
    this.activeOscillators.push({ stop: () => { try { osc.stop(); } catch { /* empty */ } } });
  }

  private createMetallicImpact(startTime: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Rolling shutter slam metallic sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.35);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  }

  private createWaterSplash(startTime: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, startTime);
    osc.frequency.linearRampToValueAtTime(80, startTime + 0.25);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }

  private createBirdChirp(startTime: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, startTime);
    osc.frequency.linearRampToValueAtTime(3600, startTime + 0.08);
    osc.frequency.linearRampToValueAtTime(2800, startTime + 0.15);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  private createNatureWind(duration: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Filtered noise for wind
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  private createWarmBreeze(duration: number) {
    this.createNatureWind(duration);
  }

  private createChimeArpeggio(startTime: number) {
    if (!this.ctx || !this.musicGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.createPianoNote(freq, startTime + i * 0.18, 2.0, 0.15);
    });
  }

  // Indonesian Voiceover Speech Synthesis with emotional cadence
  public speakIndonesianNarration(
    text: string, 
    speed: number = 0.88, 
    pitch: number = 0.95,
    onBoundary?: (charIndex: number) => void,
    onEnd?: () => void
  ) {
    if (!this.isSpeechSupported || !this.speechSynth || this.isMuted) {
      if (onEnd) setTimeout(onEnd, 3000);
      return;
    }

    this.speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.indonesianVoice) {
      utterance.voice = this.indonesianVoice;
    }
    utterance.lang = 'id-ID';
    utterance.rate = speed; // measured, deep, deliberate director pacing
    utterance.pitch = pitch; // slightly warm/deep baritone
    utterance.volume = 1.0;

    if (onBoundary) {
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          onBoundary(e.charIndex);
        }
      };
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.speechSynth.speak(utterance);
  }
}

export const audioEngine = new CinematicAudioEngine();
