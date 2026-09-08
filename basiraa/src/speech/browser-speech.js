import { getAvailableVoices, isSpeechSynthesisSupported } from './speech-capabilities.js';
import { logger } from '../utils/logger.js';

/**
 * Base Abstract Speech Provider Interface
 */
export class SpeechProvider {
  async initialize() {}
  async speak(text, options) {}
  pause() {}
  resume() {}
  stop() {}
  async getVoices() { return []; }
  supports(language) { return false; }
}

/**
 * System Speech Provider
 *
 * Directly detects and utilizes real, native, high-quality voices installed on the user's
 * operating system and browser (e.g. Microsoft Natural, Google, Apple Siri/Samantha, Windows SAPI).
 * Zero robotic artificial pitch shifting — 100% natural, crystal-clear speech.
 */
export class BrowserSpeechProvider extends SpeechProvider {
  constructor() {
    super();
    this.systemVoices = [];
    this.selectedVoice = null;
    this.currentUtterance = null;
  }

  async initialize() {
    if (!isSpeechSynthesisSupported()) {
      logger.warn('SPEECH', 'Web Speech API is not supported in this environment');
      return;
    }

    this.systemVoices = await getAvailableVoices();
    logger.log('SPEECH', `Detected ${this.systemVoices.length} real system voices on device`);

    if (this.systemVoices.length > 0 && !this.selectedVoice) {
      this.selectedVoice = this.systemVoices[0];
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.systemVoices = window.speechSynthesis.getVoices() || [];
        logger.log('SPEECH', `System voices updated: ${this.systemVoices.length} available`);
      };
    }
  }

  async getVoices(languageCode = null) {
    if (!isSpeechSynthesisSupported()) return [];
    
    if (this.systemVoices.length === 0) {
      this.systemVoices = await getAvailableVoices();
    }

    if (!languageCode) {
      return this.formatVoiceList(this.systemVoices);
    }

    const targetLang = languageCode.startsWith('ar') ? 'ar' : languageCode.startsWith('fr') ? 'fr' : 'en';

    const matching = this.systemVoices.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang.startsWith(targetLang);
    });

    // If matching language voices exist, return them; otherwise return all installed voices as fallback
    const list = matching.length > 0 ? matching : this.systemVoices;
    return this.formatVoiceList(list);
  }

  formatVoiceList(rawVoices) {
    return rawVoices.map((v) => {
      const isNatural = v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online');
      const isFemale = /female|woman|hazel|susan|zira|salma|ava|vivienne|catherine|victoria|julie|hortense|clara|mary|samantha|karen|moira|tessa/i.test(v.name);
      const isMale = /male|man|george|david|mark|shakir|remy|richard|guy|daniel|james|brian|paul/i.test(v.name);
      const genderIcon = isFemale ? '👩' : isMale ? '👨' : '🎙️';

      return {
        id: v.name,
        name: `${genderIcon} ${v.name} (${v.lang})`,
        rawName: v.name,
        lang: v.lang,
        languageCode: (v.lang || '').startsWith('ar') ? 'ara' : (v.lang || '').startsWith('fr') ? 'fra' : 'eng',
        gender: isFemale ? 'female' : isMale ? 'male' : 'neutral',
        isNatural,
        rawVoice: v,
      };
    });
  }

  setVoice(voice) {
    if (!voice) return;

    if (typeof voice === 'string') {
      const found = this.systemVoices.find((v) => v.name === voice || v.voiceURI === voice);
      if (found) {
        this.selectedVoice = found;
        logger.log('SPEECH', `Active system voice set to: ${found.name}`);
        return;
      }
    } else if (voice.rawVoice) {
      this.selectedVoice = voice.rawVoice;
      logger.log('SPEECH', `Active system voice set to: ${voice.rawVoice.name}`);
      return;
    } else if (voice.name) {
      const found = this.systemVoices.find((v) => v.name === voice.name);
      if (found) {
        this.selectedVoice = found;
        logger.log('SPEECH', `Active system voice set to: ${found.name}`);
        return;
      }
      this.selectedVoice = voice;
    }
  }

  supports(language) {
    return isSpeechSynthesisSupported();
  }

  async speak(text, options = {}) {
    const {
      language = 'eng',
      rate = 1.0,
      pitch = 1.0,
      onStart,
      onBoundary,
      onEnd,
      onError,
    } = options;

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

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
        utterance.pitch = 1.0; // 100% natural system voice pitch - zero artificial warping

        // Select exact system voice
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
          utterance.lang = this.selectedVoice.lang || (language.startsWith('ar') ? 'ar-SA' : 'en-US');
        } else {
          const targetLang = language.startsWith('ar') ? 'ar' : language.startsWith('fr') ? 'fr' : 'en';
          const matched = this.systemVoices.find((v) => (v.lang || '').toLowerCase().startsWith(targetLang));
          if (matched) {
            utterance.voice = matched;
            utterance.lang = matched.lang;
          }
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
          done();
        };

        // Safety timeout so playback never hangs
        const maxDuration = Math.max(300, (text.length * 90) / rate) + 2000;
        setTimeout(done, maxDuration);

        window.speechSynthesis.speak(utterance);
      });
    }

    if (onStart) onStart();
    await new Promise((r) => setTimeout(r, Math.max(120, (text.length * 60) / rate)));
    if (onEnd) onEnd();
  }

  pause() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}
