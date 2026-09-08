/**
 * Highlight Styling Configurations
 */

export const HIGHLIGHT_MODES = {
  WORD: 'word',
  LINE: 'line',
  BLOCK: 'block',
};

export const DEFAULT_HIGHLIGHT_STYLE = {
  color: 'rgba(255, 224, 51, 0.45)', // Warm semi-transparent yellow
  borderColor: 'rgba(230, 185, 0, 0.9)',
  borderWidth: 2,
  borderRadius: 4,
  mode: HIGHLIGHT_MODES.WORD,
  spokenColor: 'rgba(200, 230, 201, 0.25)', // Soft green tint for spoken words in multi-mode
  transitionDuration: '0.15s',
};

export function createHighlightStyle(custom = {}) {
  return {
    ...DEFAULT_HIGHLIGHT_STYLE,
    ...custom,
  };
}
