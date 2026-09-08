import { ImageManager } from './image/image-manager.js';
import { HighlightEngine } from './highlight/highlight-engine.js';
import { SpeechEngine } from './speech/speech-engine.js';
import { BrowserSpeechProvider } from './speech/browser-speech.js';
import { OcrEngine } from './ocr/ocr-engine.js';
import { TesseractProvider } from './ocr/tesseract-provider.js';
import { ReaderController } from './reader/reader-controller.js';
import { CameraManager } from './camera/camera.js';
import { openFilePicker } from './camera/image-capture.js';
import { CacheStore } from './storage/cache-store.js';
import { SessionStore } from './storage/session-store.js';
import { AppView } from './ui/app-view.js';
import { ControlsView } from './ui/controls.js';
import { SettingsView } from './ui/settings.js';
import { DiagnosticView } from './ui/diagnostic-view.js';
import { StatusView } from './ui/status.js';
import { logger } from './utils/logger.js';
import { formatErrorMessage } from './utils/errors.js';
import { DocumentModel } from './document/document-model.js';
import { ArabicOCRProvider } from './ocr/arabic-ocr-provider.js';

/**
 * Basira - Main Application Bootstrap
 * Orchestrates OCR metadata extraction, speech engine, highlight overlay, and assistive HUD.
 */
export class BasiraApp {
  constructor() {
    this.imageManager = new ImageManager();
    this.speechProvider = new BrowserSpeechProvider();
    this.speechEngine = new SpeechEngine(this.speechProvider);

    // this.ocrProvider = new TesseractProvider();
    this.ocrProvider = new ArabicOCRProvider();
    this.ocrEngine = new OcrEngine(this.ocrProvider);
    // this.ocrEngine = new OcrEngine(this.ocrProvider);
    this.cameraManager = new CameraManager();
    this.cacheStore = new CacheStore();

    this.currentDocument = null;
    this.currentLanguage = 'eng';
    this.userPrefs = SessionStore.getPreferences();

    this.appView = null;
    this.controlsView = null;
    this.settingsView = null;
    this.diagnosticView = null;
    this.statusView = null;
    this.highlightEngine = null;
    this.readerController = null;
  }

  async init() {
    logger.log('APP', 'Initializing Basira Application');

    // 1. Mount UI Views
    const viewportEl = document.getElementById('appViewport');
    const controlsEl = document.getElementById('appControls');
    const statusEl = document.getElementById('appStatus');
    const settingsEl = document.getElementById('settingsModal');
    const diagEl = document.getElementById('diagnosticPanel');

    this.appView = new AppView(viewportEl);
    this.statusView = new StatusView(statusEl);

    // 2. Initialize Highlight & Reader Subsystems
    this.highlightEngine = new HighlightEngine(this.appView.overlay);
    this.readerController = new ReaderController(this.highlightEngine, this.speechEngine);

    // Apply initial highlight preferences
    this.highlightEngine.setStyle({
      color: this.userPrefs.highlightColor,
      borderColor: this.userPrefs.highlightBorderColor,
      mode: this.userPrefs.highlightMode,
    });
    this.highlightEngine.setDiagnosticMode(this.userPrefs.diagnosticMode);

    // 3. Initialize Diagnostics & Settings
    this.diagnosticView = new DiagnosticView(diagEl);
    this.settingsView = new SettingsView(settingsEl, (updated) => this.handleSettingsChange(updated));

    // Handle token clicks in diagnostic view or overlay
    this.highlightEngine.onTokenClick = (token) => {
      this.diagnosticView.setActiveToken(token);
      this.readerController.jumpToToken(token);
    };

    // 4. Initialize Controls
    this.controlsView = new ControlsView(controlsEl, {
      onPlay: () => this.readerController.play(),
      onPause: () => this.readerController.pause(),
      onStop: () => {
        this.readerController.stop();
        this.appView.magnifierHud.clear();
      },
      onRestart: () => this.readerController.restart(),
      onStepBack: () => this.readerController.stepBackward(),
      onStepForward: () => this.readerController.stepForward(),
      onLanguageChange: (lang) => this.handleLanguageChange(lang),
      onVoiceChange: (voiceName) => this.handleVoiceChange(voiceName),
      onTestVoice: (voiceName, lang) => this.handleTestVoice(voiceName, lang),
      onSpeedChange: (speed) => this.readerController.setSpeed(speed),
      onOpenSettings: () => this.settingsView.show(),
    });

    // 5. Connect Reader State to Controls & Magnifier HUD
    this.readerController.state.onChange((state) => {
      this.controlsView.updateState(state, Boolean(this.currentDocument));
      const currentToken = this.readerController.tokenManager.getCurrentToken();
      if (currentToken) {
        this.diagnosticView.setActiveToken(currentToken);
        this.appView.magnifierHud.updateToken(currentToken, state.currentIndex);
      }
    });

    // 6. Connect AppView Document Toolbar Actions
    this.appView.setActionHandler((action) => {
      if (action === 'toggleDiagnostic') {
        const nextDiag = !this.highlightEngine.diagnosticMode;
        this.highlightEngine.setDiagnosticMode(nextDiag);
        this.diagnosticView.toggle(nextDiag);
        SessionStore.savePreferences({ diagnosticMode: nextDiag });
      } else if (action === 'copyText') {
        this.copyDocumentText();
      }
    });

    // 7. Connect OCR Progress to Status View
    this.ocrEngine.onProgress(({ status, progress, message }) => {
      if (status === 'processing' || status === 'initializing') {
        this.statusView.showProgress(progress, message);
      } else if (status === 'complete') {
        this.statusView.clear();
      }
    });

    // 8. Setup Header & Global Buttons
    this.setupHeaderActions();
    this.setupKeyboardShortcuts();

    // 9. Load voices asynchronously and watch for system voice changes
    await this.speechEngine.initialize();
    const updateVoiceList = async () => {
      const voices = await this.speechEngine.getVoices();
      this.controlsView.populateVoices(voices, this.currentLanguage);
    };
    await updateVoiceList();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', updateVoiceList);
    }

    logger.log('APP', 'Basira is ready');
  }

  setupHeaderActions() {
    const btnUpload = document.getElementById('btnHeaderUpload');
    const btnCamera = document.getElementById('btnHeaderCamera');
    const btnHeroUpload = document.getElementById('btnHeroUpload');
    const btnHeroCamera = document.getElementById('btnHeroCamera');
    const btnCloseCamera = document.getElementById('btnCloseCamera');
    const btnCaptureSnapshot = document.getElementById('btnCaptureSnapshot');

    const handleUploadClick = async () => {
      try {
        const file = await openFilePicker({ accept: 'image/*' });
        if (file) await this.handleImageInput(file);
      } catch (e) {
        // User cancelled or picker error
      }
    };

    const handleCameraClick = async () => {
      try {
        this.appView.openCameraModal();
        await this.cameraManager.startCamera(this.appView.cameraVideo);
      } catch (err) {
        this.appView.closeCameraModal();
        this.statusView.showNotification(formatErrorMessage(err), 'error');
      }
    };

    const handleSampleClick = async (samplePath, lang) => {
      try {
        this.statusView.showNotification(`Loading sample document...`, 'info', 1500);
        this.controlsView.setLanguage(lang);
        this.currentLanguage = lang;
        const res = await fetch(samplePath);
        const blob = await res.blob();
        await this.handleImageInput(blob);
      } catch (err) {
        this.statusView.showNotification('Failed to load sample asset', 'error');
      }
    };

    const btnSampleEnglish = document.getElementById('btnSampleEnglish');
    const btnSampleArabic = document.getElementById('btnSampleArabic');
    const btnSampleFrench = document.getElementById('btnSampleFrench');
    const btnSampleDoc = document.getElementById('btnSampleDoc');

    if (btnSampleEnglish) {
      btnSampleEnglish.onclick = () => handleSampleClick('/assets/sample-english.svg', 'eng');
    }
    if (btnSampleArabic) {
      btnSampleArabic.onclick = () => handleSampleClick('/assets/sample-arabic.svg', 'ara');
    }
    if (btnSampleFrench) {
      btnSampleFrench.onclick = () => handleSampleClick('/assets/sample-french.svg', 'fra');
    }
    if (btnSampleDoc) {
      btnSampleDoc.onclick = () => handleSampleClick('/assets/sample-doc.svg', 'eng');
    }

    if (btnUpload) btnUpload.onclick = handleUploadClick;
    if (btnHeroUpload) btnHeroUpload.onclick = handleUploadClick;

    if (btnCamera) btnCamera.onclick = handleCameraClick;
    if (btnHeroCamera) btnHeroCamera.onclick = handleCameraClick;

    if (btnCloseCamera) {
      btnCloseCamera.onclick = () => {
        this.cameraManager.stopCamera();
        this.appView.closeCameraModal();
      };
    }

    if (btnCaptureSnapshot) {
      btnCaptureSnapshot.onclick = async () => {
        try {
          const snapshotBlob = await this.cameraManager.captureSnapshot();
          this.cameraManager.stopCamera();
          this.appView.closeCameraModal();
          await this.handleImageInput(snapshotBlob);
        } catch (err) {
          this.statusView.showNotification(formatErrorMessage(err), 'error');
        }
      };
    }

    // Drag and Drop on Viewport
    const dropZone = document.getElementById('appViewport');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('is-drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('is-drag-over');
      });
      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('is-drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          await this.handleImageInput(file);
        }
      });
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs/selects
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.readerController.state.status === 'playing') {
          this.readerController.pause();
        } else {
          this.readerController.play();
        }
      } else if (e.code === 'Escape') {
        this.readerController.stop();
        this.appView.magnifierHud.clear();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.readerController.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.readerController.stepBackward();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const curSpeed = this.readerController.state.speed || 1.0;
        const newSpeed = Math.min(3.0, curSpeed + 0.25);
        this.readerController.setSpeed(newSpeed);
        const slider = document.getElementById('sliderSpeed');
        if (slider) slider.value = newSpeed.toFixed(1);
        const badge = document.getElementById('speedValue');
        if (badge) badge.textContent = `${newSpeed.toFixed(1)}x`;
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const curSpeed = this.readerController.state.speed || 1.0;
        const newSpeed = Math.max(0.5, curSpeed - 0.25);
        this.readerController.setSpeed(newSpeed);
        const slider = document.getElementById('sliderSpeed');
        if (slider) slider.value = newSpeed.toFixed(1);
        const badge = document.getElementById('speedValue');
        if (badge) badge.textContent = `${newSpeed.toFixed(1)}x`;
      } else if (e.code === 'KeyR') {
        this.readerController.restart();
      } else if (e.code === 'KeyD') {
        const nextDiag = !this.highlightEngine.diagnosticMode;
        this.highlightEngine.setDiagnosticMode(nextDiag);
        this.diagnosticView.toggle(nextDiag);
      } else if (e.code === 'KeyH') {
        this.appView.magnifierHud.toggle();
      }
    });
  }

  async handleImageInput(source) {
    try {
      this.readerController.stop();
      this.statusView.showNotification('Loading document image...', 'info', 2000);

      const imageState = await this.imageManager.loadImage(source);
      this.appView.showImage(imageState.url);
      this.highlightEngine.setOriginalDimensions(imageState);

      // Trigger OCR recognition or pull from IndexedDB cache
      await this.runOcrPipeline(imageState);
    } catch (err) {
      logger.error('APP', 'Error handling image input', err);
      this.statusView.showNotification(formatErrorMessage(err), 'error');
    }
  }

  async runOcrPipeline(imageState) {
    const cacheKey = this.cacheStore.generateCacheKey(imageState.hash, this.currentLanguage);
    const cachedResult = await this.cacheStore.get(cacheKey);

    if (cachedResult) {
      logger.log('APP', 'Restoring cached document model');
      const doc = new DocumentModel(cachedResult);
      this.setDocument(doc);
      this.statusView.showNotification('âš¡ Ready to read (Loaded from cache)', 'success', 3000);
      return;
    }

    try {
      const documentModel = await this.ocrEngine.processImage(
        imageState.blob || imageState.url,
        {
          width: imageState.width,
          height: imageState.height,
          hash: imageState.hash,
        },
        {
          language: this.currentLanguage,
        }
      );

      // Cache document for instant future loads
      await this.cacheStore.set(cacheKey, documentModel.toJSON());

      this.setDocument(documentModel);
      this.statusView.showNotification(`ðŸ“– Ready! Detected ${documentModel.reading.tokens.length} words.`, 'success', 3500);
    } catch (err) {
      this.statusView.showNotification(formatErrorMessage(err), 'error');
    }
  }

  setDocument(documentModel) {
    this.currentDocument = documentModel;
    this.readerController.loadDocument(documentModel);
    this.diagnosticView.setDocument(documentModel);

    const tokens = documentModel.reading?.tokens || [];
    this.appView.magnifierHud.setTokens(tokens);

    // Apply document direction (e.g. RTL for Arabic documents)
    const isRtl = documentModel.reading?.direction === 'rtl';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    this.controlsView.updateState(this.readerController.state.getSnapshot(), true);
  }

  async handleLanguageChange(lang) {
    this.currentLanguage = lang;
    this.controlsView.setLanguage(lang);
    logger.log('APP', `Language changed to: ${lang}`);

    // Update voice options for this language
    const voices = await this.speechEngine.getVoices();
    this.controlsView.populateVoices(voices, lang);

    // If an image is currently loaded, rerun OCR for the newly selected language
    const imageState = this.imageManager.getState();
    if (imageState.hasImage) {
      await this.runOcrPipeline(imageState);
    }
  }

  async handleVoiceChange(voiceName) {
    const voices = await this.speechEngine.getVoices();
    const voice = voices.find((v) => v.name === voiceName || v.id === voiceName || v.rawName === voiceName);
    this.speechEngine.setVoice(voice || voiceName);
    logger.log('APP', `Switched active voice to: ${voiceName}`);
  }

  async handleTestVoice(voiceName, lang = 'eng') {
    await this.handleVoiceChange(voiceName);
    const samplePhrases = {
      ara: 'مرحباً، هذا هو الصوت الطبيعي المخصص للقراءة.',
      fra: 'Bonjour, voici la voix naturelle sélectionnée pour la lecture.',
      eng: 'Hello, this is the natural system voice selected for reading.'
    };
    const phrase = samplePhrases[lang] || samplePhrases.eng;
    this.statusView.showNotification(`🔊 Previewing voice: ${voiceName}`, 'info', 2500);
    await this.speechEngine.speak(phrase, { language: lang });
  }

  handleSettingsChange(updated) {
    if (updated.highlightColor || updated.highlightBorderColor || updated.highlightMode) {
      this.highlightEngine.setStyle({
        color: this.userPrefs.highlightColor,
        borderColor: this.userPrefs.highlightBorderColor,
        mode: this.userPrefs.highlightMode,
      });
    }

    if (typeof updated.diagnosticMode === 'boolean') {
      this.highlightEngine.setDiagnosticMode(updated.diagnosticMode);
      this.diagnosticView.toggle(updated.diagnosticMode);
    }
  }

  async copyDocumentText() {
    if (!this.currentDocument || !this.currentDocument.reading?.tokens) {
      this.statusView.showNotification('No document text to copy', 'info');
      return;
    }
    const fullText = this.currentDocument.reading.tokens.map((t) => t.text).join(' ');
    try {
      await navigator.clipboard.writeText(fullText);
      this.statusView.showNotification('ðŸ“‹ Text copied to clipboard!', 'success', 2500);
    } catch (err) {
      this.statusView.showNotification('Could not copy text to clipboard', 'error');
    }
  }
}

// Bootstrap on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new BasiraApp();
    app.init().catch((err) => console.error('Failed to initialize Basira', err));
    window.__BASIRA_APP__ = app;
  });
}

