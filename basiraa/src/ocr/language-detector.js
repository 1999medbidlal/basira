import { isArabicText } from '../utils/text.js';

/**
 * Language Detector Subsystem
 *
 * Detects document primary script (English, French, or Arabic) from token distributions or metadata.
 */
export function detectDocumentLanguage(tokens) {
  if (!tokens || tokens.length === 0) return 'eng';

  let arabicCount = 0;
  let frenchCount = 0;
  let latinCount = 0;

  for (const token of tokens) {
    const text = typeof token === 'string' ? token : token.text;
    if (isArabicText(text)) {
      arabicCount++;
    } else if (/[éèêëàâäôöûüçîïœæ]/i.test(text)) {
      frenchCount++;
    } else if (/[a-zA-Z]/.test(text)) {
      latinCount++;
    }
  }

  if (arabicCount > latinCount + frenchCount) {
    return 'ara';
  }
  if (frenchCount > 0) {
    return 'fra';
  }
  return 'eng';
}

/**
 * Map Tesseract lang code to ISO 639-1 code
 */
export function tesseractLangToIso(lang) {
  if (lang === 'ara') return 'ar';
  if (lang === 'fra') return 'fr';
  if (lang === 'eng') return 'en';
  return 'en';
}

/**
 * Map ISO 639-1 to Tesseract lang code
 */
export function isoToTesseractLang(iso) {
  if (iso === 'ar') return 'ara';
  if (iso === 'fr') return 'fra';
  if (iso === 'en') return 'eng';
  return 'eng';
}
