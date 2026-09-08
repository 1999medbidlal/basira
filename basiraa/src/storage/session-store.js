/**
 * LocalStorage User Settings & Preferences
 */

const PREFS_KEY = 'basira_user_preferences';

const DEFAULT_PREFERENCES = {
  language: 'eng', // 'eng' | 'ara'
  speed: 1.0,
  pitch: 1.0,
  highlightColor: 'rgba(255, 224, 51, 0.45)',
  highlightBorderColor: 'rgba(230, 185, 0, 0.9)',
  highlightMode: 'word',
  autoScroll: true,
  diagnosticMode: false,
};

export class SessionStore {
  static getPreferences() {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFERENCES };
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch (e) {
      // Fallback
    }
    return { ...DEFAULT_PREFERENCES };
  }

  static savePreferences(prefs) {
    if (typeof localStorage === 'undefined') return;
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    } catch (e) {
      // Fallback
    }
  }
}
