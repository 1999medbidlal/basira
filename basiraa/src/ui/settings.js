import { SessionStore } from '../storage/session-store.js';

/**
 * Settings Modal Component
 */
export class SettingsView {
  constructor(modalElement, onSettingsChange) {
    this.modal = modalElement;
    this.onSettingsChange = onSettingsChange;
    this.prefs = SessionStore.getPreferences();
  }

  show() {
    if (!this.modal) return;
    this.prefs = SessionStore.getPreferences();
    this.render();
    this.modal.classList.remove('is-hidden');
  }

  hide() {
    if (!this.modal) return;
    this.modal.classList.add('is-hidden');
  }

  render() {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div class="modal-backdrop" id="settingsBackdrop"></div>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div class="modal-header">
          <h2 id="settingsTitle">⚙️ Settings</h2>
          <button type="button" class="btn-icon" id="btnCloseSettings" aria-label="Close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="settingHighlightColor">Highlight Color</label>
            <div class="color-presets">
              <button type="button" class="color-dot is-yellow" data-color="rgba(255, 224, 51, 0.45)" data-border="rgba(230, 185, 0, 0.9)"></button>
              <button type="button" class="color-dot is-cyan" data-color="rgba(0, 229, 255, 0.35)" data-border="rgba(0, 184, 212, 0.9)"></button>
              <button type="button" class="color-dot is-green" data-color="rgba(105, 240, 174, 0.35)" data-border="rgba(0, 200, 83, 0.9)"></button>
              <button type="button" class="color-dot is-pink" data-color="rgba(255, 128, 171, 0.35)" data-border="rgba(245, 0, 87, 0.9)"></button>
            </div>
          </div>

          <div class="form-group">
            <label for="settingHighlightMode">Highlight Mode</label>
            <select id="settingHighlightMode" class="form-select">
              <option value="word" ${this.prefs.highlightMode === 'word' ? 'selected' : ''}>Word by Word</option>
              <option value="line" ${this.prefs.highlightMode === 'line' ? 'selected' : ''}>Whole Line</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="settingDiagnostic" ${this.prefs.diagnosticMode ? 'checked' : ''} />
              <span>Enable Developer Diagnostic Bounding Boxes</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="btnSaveSettings">Done</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#btnCloseSettings');
    const backdrop = this.modal.querySelector('#settingsBackdrop');
    const saveBtn = this.modal.querySelector('#btnSaveSettings');
    const diagCheck = this.modal.querySelector('#settingDiagnostic');
    const modeSelect = this.modal.querySelector('#settingHighlightMode');
    const colorDots = this.modal.querySelectorAll('.color-dot');

    const handleClose = () => this.hide();

    if (closeBtn) closeBtn.onclick = handleClose;
    if (backdrop) backdrop.onclick = handleClose;
    if (saveBtn) saveBtn.onclick = handleClose;

    if (diagCheck) {
      diagCheck.onchange = (e) => {
        const checked = e.target.checked;
        this.prefs.diagnosticMode = checked;
        SessionStore.savePreferences({ diagnosticMode: checked });
        if (this.onSettingsChange) this.onSettingsChange({ diagnosticMode: checked });
      };
    }

    if (modeSelect) {
      modeSelect.onchange = (e) => {
        const mode = e.target.value;
        this.prefs.highlightMode = mode;
        SessionStore.savePreferences({ highlightMode: mode });
        if (this.onSettingsChange) this.onSettingsChange({ highlightMode: mode });
      };
    }

    colorDots.forEach((dot) => {
      dot.onclick = () => {
        const color = dot.getAttribute('data-color');
        const borderColor = dot.getAttribute('data-border');
        this.prefs.highlightColor = color;
        this.prefs.highlightBorderColor = borderColor;
        SessionStore.savePreferences({ highlightColor: color, highlightBorderColor: borderColor });
        if (this.onSettingsChange) this.onSettingsChange({ highlightColor: color, highlightBorderColor: borderColor });
      };
    });
  }
}
