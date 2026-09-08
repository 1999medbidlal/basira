/**
 * Pro Voice AI Speech Provider for Basira
 * Strictly supports the 6 curated Studio Voices (2 English, 2 Arabic, 2 French).
 * Features intelligent gender mapping, pitch modulation, and low-latency speech synthesis.
 */

import { SpeechProvider } from './browser-speech.js';
import { logger } from '../utils/logger.js';

export const PRO_VOICES = [
  // ================= 1. ENGLISH (2 VOICES) =================
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew (Man / صوت رجالي)',
    lang: 'en-US',
    languageCode: 'eng',
    gender: 'male',
    description: 'Studio Executive Male'
  },
  {
    id: 'en-US-AvaMultilingualNeural',
    name: 'Ava (Woman / صوت نسائي)',
    lang: 'en-US',
    languageCode: 'eng',
    gender: 'female',
    description: 'Warm Conversational Female'
  },

  // ================= 2. ARABIC (2 VOICES) =================
  {
    id: 'ar-EG-ShakirNeural',
    name: 'Shakir / شاكر (Man / صوت رجالي)',
    lang: 'ar-EG',
    languageCode: 'ara',
    gender: 'male',
    description: 'فصيح وحواري دافئ'
  },
  {
    id: 'ar-EG-SalmaNeural',
    name: 'Salma / سلمى (Woman / صوت نسائي)',
    lang: 'ar-EG',
    languageCode: 'ara',
    gender: 'female',
    description: 'استوديو نقي وفصيح'
  },

  // ================= 3. FRENCH (2 VOICES) =================
  {
    id: 'fr-FR-RemyMultilingualNeural',
    name: 'Remy (Homme / صوت رجالي)',
    lang: 'fr-FR',
    languageCode: 'fra',
    gender: 'male',
    description: 'Moderne & Chaleureux'
  },
  {
    id: 'fr-FR-VivienneMultilingualNeural',
    name: 'Vivienne (Femme / صوت نسائي)',
    lang: 'fr-FR',
    languageCode: 'fra',
    gender: 'female',
    description: 'Élégante Parisienne'
  }
];

export class ProSpeechProvider extends SpeechProvider {
  constructor(serverUrl = 'http://127.0.0.1:8765') {
    super();
    this.serverUrl = serverUrl;
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isPaused = false;
    this.selectedVoice = PRO_VOICES[0];
    this.isServerAvailable = false;
    this.currentUtterance = null;
  }

  async initialize() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.isServerAvailable = true;
        logger.log('SPEECH', 'Pro Voice AI Universal Server is ONLINE at ' + this.serverUrl);
      }
    } catch (e) {
      this.isServerAvailable = false;
      logger.log('SPEECH', 'Pro Voice server offline on localhost:8765, using Web Speech API fallback');
    }
  }

  async getVoices(languageCode = null) {
    if (!languageCode) return PRO_VOICES;
    const target = languageCode.toLowerCase();
    return PRO_VOICES.filter(v => 
      v.languageCode === target || 
      (target.startsWith('ar') && v.languageCode === 'ara') ||
      (target.startsWith('fr') && v.languageCode === 'fra') ||
      (target.startsWith('en') && v.languageCode === 'eng')
    );
  }

  setVoice(voice) {
    if (typeof voice === 'string') {
      const found = PRO_VOICES.find(v => v.id === voice || v.name === voice);
      if (found) this.selectedVoice = found;
    } else if (voice && voice.id) {
      this.selectedVoice = voice;
    }
    logger.log('SPEECH', `Selected studio voice: ${this.selectedVoice?.name} (${this.selectedVoice?.gender})`);
  }

  supports(language) {
    return true;
  }

  findBestBrowserVoice(activeVoice) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const browserVoices = window.speechSynthesis.getVoices();
    if (!browserVoices || browserVoices.length === 0) return null;

    const langCode = (activeVoice.lang || 'en-US').slice(0, 2).toLowerCase();
    const isFemaleTarget = activeVoice.gender === 'female';

    const femaleKeywords = ['female', 'hazel', 'susan', 'zira', 'salma', 'ava', 'vivienne', 'catherine', 'victoria', 'julie', 'hortense', 'clara', 'mary', 'samantha', 'karen', 'moira', 'tessa'];
    const maleKeywords = ['male', 'george', 'david', 'mark', 'shakir', 'remy', 'richard', 'guy', 'daniel', 'james', 'brian', 'paul'];

    // 1. Exact language match + exact gender match
    const langMatches = browserVoices.filter(v => (v.lang || '').toLowerCase().startsWith(langCode));
    if (langMatches.length > 0) {
      const genderMatches = langMatches.filter(v => {
        const name = (v.name || '').toLowerCase();
        return isFemaleTarget ? femaleKeywords.some(k => name.includes(k)) : maleKeywords.some(k => name.includes(k));
      });
      if (genderMatches.length > 0) return genderMatches[0];
      return langMatches[0];
    }

    // 2. Fallback to any voice with matching gender
    const globalGenderMatches = browserVoices.filter(v => {
      const name = (v.name || '').toLowerCase();
      return isFemaleTarget ? femaleKeywords.some(k => name.includes(k)) : maleKeywords.some(k => name.includes(k));
    });
    if (globalGenderMatches.length > 0) return globalGenderMatches[0];

    return browserVoices[0];
  }

  async speak(text, options = {}) {
    const {
      language = 'eng',
      rate = 1.0,
      pitch = 1.0,
      onStart,
      onBoundary,
      onEnd,
      onError
    } = options;

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Determine matching voice for language
    let activeVoice = this.selectedVoice;
    const langPrefix = language.startsWith('ar') ? 'ara' : language.startsWith('fr') ? 'fra' : 'eng';
    if (!activeVoice || activeVoice.languageCode !== langPrefix) {
      const matching = PRO_VOICES.filter(v => v.languageCode === langPrefix);
      activeVoice = matching[0] || PRO_VOICES[0];
    }

    // Try Pro Voice Server first if online
    if (this.isServerAvailable) {
      try {
        const cacheKey = `${activeVoice.id}_${rate}_${text}`;
        let audioBlob = this.audioCache.get(cacheKey);

        if (!audioBlob) {
          const res = await fetch(`${this.serverUrl}/v1/audio/speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: text,
              voice: activeVoice.id,
              speed: rate
            })
          });

          if (!res.ok) throw new Error('Speech synthesis failed: ' + res.statusText);
          audioBlob = await res.blob();
          this.audioCache.set(cacheKey, audioBlob);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        audio.playbackRate = Math.min(4.0, Math.max(0.5, rate));

        return new Promise((resolve) => {
          audio.onplay = () => {
            if (onStart) onStart();
          };
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            if (onEnd) onEnd();
            resolve();
          };
          audio.onerror = (err) => {
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            if (onError) onError(err);
            if (onEnd) onEnd();
            resolve();
          };
          audio.play().catch((err) => {
            if (onError) onError(err);
            if (onEnd) onEnd();
            resolve();
          });
        });
      } catch (err) {
        logger.warn('SPEECH', 'Pro Voice server error, falling back to Web Speech API', err);
      }
    }

    // Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return new Promise((resolve) => {
        let isResolved = false;
        const done = () => {
          if (!isResolved) {
            isResolved = true;
            this.currentUtterance = null;
            if (onEnd) onEnd();
            resolve();
          }
        };

        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        utterance.rate = Math.min(3.5, Math.max(0.5, rate));
        
        // Intelligent pitch shaping based on selected studio voice gender
        const basePitch = activeVoice.gender === 'female' ? 1.25 : 0.88;
        utterance.pitch = Math.min(1.8, Math.max(0.6, basePitch * pitch));
        utterance.lang = activeVoice.lang;

        const bestVoice = this.findBestBrowserVoice(activeVoice);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.onstart = () => {
          if (onStart) onStart();
        };

        utterance.onboundary = (e) => {
          if (e.name === 'word' && onBoundary) {
            onBoundary(e.charIndex, e.charLength || 1);
          }
        };

        utterance.onend = () => {
          done();
        };

        utterance.onerror = (e) => {
          // If canceled during pause or stop, resolve gracefully
          done();
        };

        // Safety timeout so playback never hangs
        const expectedDuration = Math.max(250, (text.length * 80) / rate) + 2000;
        setTimeout(done, expectedDuration);

        window.speechSynthesis.speak(utterance);
      });
    }

    // Platform without speech
    if (onStart) onStart();
    const duration = Math.max(100, (text.length * 50) / rate);
    await new Promise((r) => setTimeout(r, duration));
    if (onEnd) onEnd();
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPaused = true;
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPaused = false;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}
