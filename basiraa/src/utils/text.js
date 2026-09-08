/**
 * Text and script normalization utilities
 */

// Arabic unicode blocks
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const PUNCTUATION_REGEX = /^[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»؛،؟]+|[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»؛،؟]+$/g;

/**
 * Detect whether text is primarily Arabic
 */
export function isArabicText(text) {
  if (!text) return false;
  return ARABIC_REGEX.test(text);
}

/**
 * Conservative normalization preserving speech integrity
 */
export function normalizeTokenText(text) {
  if (!text) return '';
  return text.trim();
}

/**
 * Prepare speech text (stripping excessive punctuation at boundaries while keeping internal letters)
 */
export function prepareSpeechText(text) {
  if (!text) return '';
  const cleaned = text.trim().replace(PUNCTUATION_REGEX, '');
  return cleaned || text.trim();
}

/**
 * Normalize Arabic text for searching or comparison if needed (removes tashkeel)
 */
export function stripArabicDiacritics(text) {
  if (!text) return '';
  return text.replace(ARABIC_DIACRITICS_REGEX, '');
}

/**
 * Determine text direction: 'rtl' or 'ltr'
 */
export function detectDirection(text) {
  return isArabicText(text) ? 'rtl' : 'ltr';
}
