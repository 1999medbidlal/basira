/**
 * Structured Logger for Basira
 */
const LOG_PREFIXES = {
  IMAGE: '[IMAGE]',
  OCR: '[OCR]',
  NORMALIZER: '[OCR-NORMALIZER]',
  READING_ORDER: '[READING-ORDER]',
  SPEECH: '[SPEECH]',
  SYNC: '[SYNC]',
  HIGHLIGHT: '[HIGHLIGHT]',
  CAMERA: '[CAMERA]',
  STORAGE: '[STORAGE]',
  READER: '[READER]',
  APP: '[APP]',
};

class Logger {
  constructor() {
    this.enabled = true;
    this.debugMode = false;
  }

  setDebug(val) {
    this.debugMode = Boolean(val);
  }

  log(category, message, ...data) {
    if (!this.enabled) return;
    const prefix = LOG_PREFIXES[category] || `[${category}]`;
    if (data.length > 0) {
      console.log(`${prefix} ${message}`, ...data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  warn(category, message, ...data) {
    const prefix = LOG_PREFIXES[category] || `[${category}]`;
    console.warn(`${prefix} ⚠️ ${message}`, ...data);
  }

  error(category, message, error) {
    const prefix = LOG_PREFIXES[category] || `[${category}]`;
    console.error(`${prefix} ❌ ${message}`, error || '');
  }

  debug(category, message, ...data) {
    if (!this.debugMode) return;
    const prefix = LOG_PREFIXES[category] || `[${category}]`;
    console.debug(`${prefix} 🔍 ${message}`, ...data);
  }
}

export const logger = new Logger();
export { LOG_PREFIXES };
