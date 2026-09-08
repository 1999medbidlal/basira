import { logger } from '../utils/logger.js';
import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';

/**
 * Camera Subsystem
 *
 * Provides live video preview and snapshot capture via WebRTC / getUserMedia.
 */
export class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.isActive = false;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  /**
   * Starts camera video stream attached to a video DOM element
   */
  async startCamera(videoElement) {
    if (!this.isSupported()) {
      throw new BasiraError('Camera not supported', ERROR_MESSAGES.CAMERA_UNAVAILABLE);
    }

    this.stopCamera();
    this.videoElement = videoElement;

    logger.log('CAMERA', 'Requesting camera stream');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Back camera preferred for books/documents
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      this.isActive = true;
      logger.log('CAMERA', 'Camera stream active');
      return this.stream;
    } catch (err) {
      logger.error('CAMERA', 'Failed to start camera', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new BasiraError('Permission denied', ERROR_MESSAGES.CAMERA_DENIED);
      }
      throw new BasiraError('Camera unavailable', ERROR_MESSAGES.CAMERA_UNAVAILABLE);
    }
  }

  /**
   * Captures a high-resolution snapshot from the active camera stream into a Blob
   */
  captureSnapshot() {
    if (!this.isActive || !this.videoElement) {
      throw new BasiraError('Camera is not active', ERROR_MESSAGES.CAMERA_UNAVAILABLE);
    }

    logger.log('CAMERA', 'Capturing snapshot');

    const video = this.videoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          logger.log('CAMERA', 'Snapshot captured successfully', { size: blob.size });
          resolve(blob);
        } else {
          reject(new BasiraError('Snapshot capture failed', ERROR_MESSAGES.IMAGE_LOAD_FAILED));
        }
      }, 'image/jpeg', 0.95);
    });
  }

  /**
   * Stops the camera stream and releases media hardware
   */
  stopCamera() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      for (const track of tracks) {
        track.stop();
      }
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isActive = false;
    logger.log('CAMERA', 'Camera stream stopped');
  }
}
