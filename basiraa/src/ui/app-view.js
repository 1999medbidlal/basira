import { Overlay } from '../highlight/overlay.js';
import { MagnifierHud } from './magnifier-hud.js';

/**
 * App View & Image Viewport Component
 *
 * Provides interactive zoom, 90-degree rotation, accessible contrast filters,
 * floating document toolbar, and coupled highlight overlay.
 */
export class AppView {
  constructor(viewportElement) {
    this.viewport = viewportElement;
    this.imageContainer = null;
    this.imageElement = null;
    this.overlay = null;
    this.magnifierHud = null;
    this.placeholderElement = null;
    this.cameraContainer = null;
    this.cameraVideo = null;

    // Viewport transform state
    this.zoomLevel = 1.0;
    this.rotationAngle = 0;
    this.currentFilter = 'none';

    this.onActionCallback = null;

    this.init();
  }

  setActionHandler(cb) {
    this.onActionCallback = cb;
  }

  init() {
    if (!this.viewport) return;

    this.viewport.innerHTML = `
      <div class="basira-viewer-container" id="viewerContainer">
        <!-- Floating Document Action Toolbar (Active when image is loaded) -->
        <aside class="basira-doc-toolbar is-hidden" id="docToolbar" aria-label="Document View Controls">
          <div class="toolbar-group">
            <button type="button" class="btn-tool" id="btnZoomIn" title="Zoom In (+)" aria-label="Zoom in">
              <span>🔍+</span>
            </button>
            <button type="button" class="btn-tool" id="btnZoomOut" title="Zoom Out (-)" aria-label="Zoom out">
              <span>🔍−</span>
            </button>
            <button type="button" class="btn-tool" id="btnZoomReset" title="Reset Fit" aria-label="Reset zoom">
              <span id="zoomLabel">100%</span>
            </button>
          </div>

          <div class="toolbar-separator"></div>

          <div class="toolbar-group">
            <button type="button" class="btn-tool" id="btnRotateDoc" title="Rotate 90° (R)" aria-label="Rotate document">
              <span>🔄</span>
            </button>
            <select class="select-filter" id="selectFilter" title="High-Contrast Visual Filters" aria-label="Document visual filters">
              <option value="none">Normal Photo</option>
              <option value="high-contrast">High Contrast B&W</option>
              <option value="dark-room">Dark Room (Invert)</option>
              <option value="sepia">Warm Sepia</option>
            </select>
          </div>

          <div class="toolbar-separator"></div>

          <div class="toolbar-group">
            <button type="button" class="btn-tool" id="btnToggleHud" title="Toggle Magnifier HUD (H)" aria-label="Toggle Magnifier">
              <span>🔎 HUD</span>
            </button>
            <button type="button" class="btn-tool" id="btnToggleDiag" title="Developer Inspector (D)" aria-label="Toggle Developer Inspector">
              <span>🔲 Inspector</span>
            </button>
            <button type="button" class="btn-tool" id="btnCopyText" title="Copy Extracted Text" aria-label="Copy document text">
              <span>📋 Copy</span>
            </button>
          </div>
        </aside>

        <!-- Empty Placeholder View -->
        <div class="basira-placeholder" id="placeholderView">
          <div class="placeholder-content">
            <div class="placeholder-icon">👁️</div>
            <h2>Bring Any Real Page to Life</h2>
            <p>Upload a photograph or capture any book, document, or article. Basira reads aloud while highlighting exact words on the original photo.</p>

            <div class="placeholder-actions">
              <button type="button" class="btn btn-hero" id="btnHeroUpload">
                <span class="btn-icon">📁</span> Upload Image
              </button>
              <button type="button" class="btn btn-hero btn-secondary" id="btnHeroCamera">
                <span class="btn-icon">📷</span> Open Camera
              </button>
            </div>

            <div class="placeholder-samples">
              <span class="samples-label">Or explore interactive sample documents:</span>
              <div class="sample-buttons">
                <button type="button" class="btn btn-secondary btn-sm" id="btnSampleEnglish">🇬🇧 English Book</button>
                <button type="button" class="btn btn-secondary btn-sm" id="btnSampleArabic">🇲🇦 / 🇸🇦 كتاب عربي</button>
                <button type="button" class="btn btn-secondary btn-sm" id="btnSampleFrench">🇫🇷 Français</button>
                <button type="button" class="btn btn-secondary btn-sm" id="btnSampleDoc">📜 Certificate</button>
              </div>
            </div>

            <div class="placeholder-features">
              <div class="feat-badge"><span>🔒</span> 100% Local & Private</div>
              <div class="feat-badge"><span>🎯</span> Original Image Preserved</div>
              <div class="feat-badge"><span>⚡</span> High-Speed 3.0x Playback</div>
              <div class="feat-badge"><span>🎙️</span> Studio Neural Voices</div>
            </div>
          </div>
        </div>

        <!-- Document Viewer (Coupled Image + Overlay) -->
        <div class="basira-reader-wrapper is-hidden" id="readerWrapper">
          <div class="basira-image-box" id="imageBox">
            <img id="originalImage" alt="Original document photograph" />
            <div class="basira-overlay" aria-hidden="true"></div>
          </div>
        </div>

        <!-- Floating Magnifier HUD Banner -->
        <div class="magnifier-hud-container" id="magnifierContainer"></div>

        <!-- Camera Live Capture Preview Modal -->
        <div class="basira-camera-modal is-hidden" id="cameraModal">
          <div class="camera-card">
            <div class="camera-header">
              <h3>📷 Capture Document Page</h3>
              <button type="button" class="btn-icon" id="btnCloseCamera" aria-label="Close Camera">✕</button>
            </div>
            <div class="camera-stream-wrapper">
              <video id="cameraVideo" autoplay playsinline muted></video>
              <div class="camera-guidelines">
                <div class="guide-box"></div>
              </div>
            </div>
            <div class="camera-footer">
              <button type="button" class="btn btn-primary btn-lg" id="btnCaptureSnapshot">
                📸 Take Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.imageContainer = this.viewport.querySelector('#imageBox');
    this.imageElement = this.viewport.querySelector('#originalImage');
    this.placeholderElement = this.viewport.querySelector('#placeholderView');
    this.readerWrapper = this.viewport.querySelector('#readerWrapper');
    this.docToolbar = this.viewport.querySelector('#docToolbar');
    this.cameraModal = this.viewport.querySelector('#cameraModal');
    this.cameraVideo = this.viewport.querySelector('#cameraVideo');
    this.zoomLabel = this.viewport.querySelector('#zoomLabel');
    this.selectFilter = this.viewport.querySelector('#selectFilter');

    this.overlay = new Overlay(this.imageContainer, this.imageElement);
    this.magnifierHud = new MagnifierHud(this.viewport.querySelector('#magnifierContainer'));

    this.bindToolbarEvents();
  }

  bindToolbarEvents() {
    const btnZoomIn = this.viewport.querySelector('#btnZoomIn');
    const btnZoomOut = this.viewport.querySelector('#btnZoomOut');
    const btnZoomReset = this.viewport.querySelector('#btnZoomReset');
    const btnRotateDoc = this.viewport.querySelector('#btnRotateDoc');
    const btnToggleHud = this.viewport.querySelector('#btnToggleHud');
    const btnToggleDiag = this.viewport.querySelector('#btnToggleDiag');
    const btnCopyText = this.viewport.querySelector('#btnCopyText');

    if (btnZoomIn) {
      btnZoomIn.onclick = () => this.adjustZoom(0.15);
    }
    if (btnZoomOut) {
      btnZoomOut.onclick = () => this.adjustZoom(-0.15);
    }
    if (btnZoomReset) {
      btnZoomReset.onclick = () => this.resetZoom();
    }
    if (btnRotateDoc) {
      btnRotateDoc.onclick = () => this.rotate90();
    }
    if (this.selectFilter) {
      this.selectFilter.onchange = (e) => this.setFilter(e.target.value);
    }
    if (btnToggleHud) {
      btnToggleHud.onclick = () => this.magnifierHud.toggle();
    }
    if (btnToggleDiag) {
      btnToggleDiag.onclick = () => this.onActionCallback?.('toggleDiagnostic');
    }
    if (btnCopyText) {
      btnCopyText.onclick = () => this.onActionCallback?.('copyText');
    }
  }

  adjustZoom(delta) {
    this.zoomLevel = Math.max(0.5, Math.min(2.5, this.zoomLevel + delta));
    this.applyTransform();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.rotationAngle = 0;
    this.applyTransform();
  }

  rotate90() {
    this.rotationAngle = (this.rotationAngle + 90) % 360;
    this.applyTransform();
  }

  setFilter(filterName) {
    this.currentFilter = filterName;
    if (this.imageElement) {
      this.imageElement.className = `filter-${filterName}`;
    }
  }

  applyTransform() {
    if (this.imageContainer) {
      this.imageContainer.style.transform = `scale(${this.zoomLevel}) rotate(${this.rotationAngle}deg)`;
      this.imageContainer.style.transformOrigin = 'center center';
      this.imageContainer.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    if (this.zoomLabel) {
      this.zoomLabel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
    setTimeout(() => {
      this.overlay?.updateGeometry();
    }, 220);
  }

  showImage(url) {
    if (this.placeholderElement) this.placeholderElement.classList.add('is-hidden');
    if (this.readerWrapper) this.readerWrapper.classList.remove('is-hidden');
    if (this.docToolbar) this.docToolbar.classList.remove('is-hidden');

    if (this.imageElement) {
      this.imageElement.src = url;
    }
    this.resetZoom();
  }

  showPlaceholder() {
    if (this.placeholderElement) this.placeholderElement.classList.remove('is-hidden');
    if (this.readerWrapper) this.readerWrapper.classList.add('is-hidden');
    if (this.docToolbar) this.docToolbar.classList.add('is-hidden');
    if (this.imageElement) this.imageElement.src = '';
    if (this.overlay) this.overlay.clear();
    if (this.magnifierHud) this.magnifierHud.clear();
  }

  openCameraModal() {
    if (this.cameraModal) this.cameraModal.classList.remove('is-hidden');
  }

  closeCameraModal() {
    if (this.cameraModal) this.cameraModal.classList.add('is-hidden');
  }
}
