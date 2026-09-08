import { BrowserSpeechProvider } from './browser-speech.js';
import { logger } from '../utils/logger.js';

/**
 * Speech Engine Orchestrator for Basira
 * Directly interfaces with detected system voices for natural, fluid reading.
 */
export class SpeechEngine {
  constructor(provider = null) {
    this.provider = provider || new BrowserSpeechProvider();
    this.rate = 1.0;
    this.pitch = 1.0;
    this.selectedVoice = null;
  }

  async initialize() {
    if (this.provider?.initialize) {
      await this.provider.initialize();
    }
  }

  setProvider(provider) {
    this.provider = provider;
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(3.5, Number(rate) || 1.0));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.5, Math.min(1.5, Number(pitch) || 1.0));
  }

  setVoice(voice) {
    this.selectedVoice = voice;
    if (this.provider?.setVoice) {
      this.provider.setVoice(voice);
    }
  }

  async getVoices(languageCode = null) {
    if (this.provider?.getVoices) {
      return await this.provider.getVoices(languageCode);
    }
    return [];
  }

  async speak(text, options = {}) {
    if (!this.provider) return;
    return await this.provider.speak(text, {
      rate: this.rate,
      pitch: this.pitch,
      ...options,
    });
  }

  pause() {
    if (this.provider?.pause) {
      this.provider.pause();
    }
  }

  resume() {
    if (this.provider?.resume) {
      this.provider.resume();
    }
  }

  stop() {
    if (this.provider?.stop) {
      this.provider.stop();
    }
  }
}
