/**
 * Speech Capabilities & Voice Detection
 */

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Enumerates voices available on the client device
 */
export async function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voiceschanged event if initially empty (standard browser async behavior)
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      voices = window.speechSynthesis.getVoices();
      resolve(voices || []);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout fallback if event never fires
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 1000);
  });
}

/**
 * Finds the best matching voice for a language code (e.g. 'en', 'ar', 'ara', 'eng')
 */
export function findBestVoice(voices, languageCode = 'en') {
  if (!voices || voices.length === 0) return null;

  const targetLang = languageCode.startsWith('ar') ? 'ar' : 'en';

  // 1. Exact or prefix language match
  const matched = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang.startsWith(targetLang);
  });

  if (matched.length > 0) {
    // Prefer local/native voices over remote if possible
    const localVoice = matched.find((v) => v.localService);
    return localVoice || matched[0];
  }

  // Fallback to default system voice
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0];
}
