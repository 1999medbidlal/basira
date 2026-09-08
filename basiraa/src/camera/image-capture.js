import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';

/**
 * File Picker / Camera Input Helper
 */
export function openFilePicker(options = {}) {
  const { accept = 'image/*', capture = null } = options;

  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) {
      input.capture = capture; // e.g. 'environment'
    }

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new BasiraError('No file selected', 'No file selected'));
      }
    };

    input.onerror = (err) => {
      reject(new BasiraError('File selection failed', ERROR_MESSAGES.IMAGE_LOAD_FAILED));
    };

    input.click();
  });
}
