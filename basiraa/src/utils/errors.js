/**
 * User-friendly error definitions and formatting
 */
export class BasiraError extends Error {
  constructor(message, userMessage, code) {
    super(message);
    this.name = 'BasiraError';
    this.userMessage = userMessage || message;
    this.code = code || 'UNKNOWN_ERROR';
  }
}

export const ERROR_MESSAGES = {
  IMAGE_LOAD_FAILED: "Couldn't open this image. Please try a valid PNG, JPG, or WebP photo.",
  OCR_FAILED: "Couldn't read text from this image. Try taking a clearer photo with better lighting.",
  SPEECH_UNAVAILABLE: "Speech synthesis is not available on this browser or for the selected language.",
  CAMERA_DENIED: "Camera access was denied. You can still upload a photo directly.",
  CAMERA_UNAVAILABLE: "No camera found or camera is busy. Please upload an image instead.",
  EMPTY_DOCUMENT: "No readable words were detected in this image.",
  SESSION_STALE: "Reading session expired.",
};

export function formatErrorMessage(error) {
  if (error instanceof BasiraError && error.userMessage) {
    return error.userMessage;
  }
  if (error?.message && ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message];
  }
  return "An unexpected error occurred. Please try again.";
}
