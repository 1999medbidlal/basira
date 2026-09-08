import { READER_STATUS } from '../reader/reader-state.js';

/**
 * Reading & Playback Controls Component
 *
 * Provides responsive controls:
 * - Play / Pause / Stop / Restart / Step Forward / Step Backward
 * - Real-time Audio Frequency Visualizer
 * - Real System Voice Selector with Live Voice Preview
 * - Assistive Speed Range (0.5x to 3.0x) with one-click presets
 */
export class ControlsView {
  constructor(containerElement, callbacks = {}) {
    this.container = containerElement;
    this.callbacks = callbacks;
    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="basira-controls-bar">
        <!-- Main Playback & Stepping Actions -->
        <div class="controls-playback">
          <button type="button" class="btn btn-ctrl btn-icon-step" id="btnRestart" title="Restart from beginning (R)" aria-label="Restart reading" disabled>
            <span>⏮</span>
          </button>

          <button type="button" class="btn btn-ctrl btn-icon-step" id="btnStepBack" title="Step Back 1 Word (←)" aria-label="Step back 1 word" disabled>
            <span>◀</span>
          </button>

          <button type="button" class="btn btn-ctrl btn-play" id="btnPlay" title="Play / Resume (Space)" aria-label="Play reading" disabled>
            <span class="ctrl-icon">▶</span>
            <span class="ctrl-label">Play</span>
          </button>

          <button type="button" class="btn btn-ctrl btn-pause is-hidden" id="btnPause" title="Pause reading (Space)" aria-label="Pause reading">
            <span class="ctrl-icon">⏸</span>
            <span class="ctrl-label">Pause</span>
          </button>

          <button type="button" class="btn btn-ctrl btn-icon-step" id="btnStepForward" title="Step Forward 1 Word (→)" aria-label="Step forward 1 word" disabled>
            <span>▶</span>
          </button>

          <button type="button" class="btn btn-ctrl btn-stop" id="btnStop" title="Stop reading (Esc)" aria-label="Stop reading" disabled>
            <span class="ctrl-icon">⏹</span>
            <span class="ctrl-label">Stop</span>
          </button>
        </div>

        <!-- Real-Time Audio Frequency Waveform Visualizer -->
        <div class="controls-visualizer" id="audioVisualizer" aria-hidden="true" title="Audio Activity Monitor">
          <div class="viz-bar bar-1"></div>
          <div class="viz-bar bar-2"></div>
          <div class="viz-bar bar-3"></div>
          <div class="viz-bar bar-4"></div>
          <div class="viz-bar bar-5"></div>
          <div class="viz-bar bar-6"></div>
          <div class="viz-bar bar-7"></div>
          <div class="viz-bar bar-8"></div>
        </div>

        <!-- Secondary Reading Settings -->
        <div class="controls-options">
          <!-- Language Selector -->
          <div class="option-item">
            <label for="selectLanguage" class="option-label">Language</label>
            <select id="selectLanguage" class="option-select" aria-label="OCR and Speech Language">
              <option value="eng">🇬🇧 English</option>
              <option value="ara">🇸🇦 العربية (Arabic)</option>
              <option value="fra">🇫🇷 Français (French)</option>
            </select>
          </div>

          <!-- Real System Voice Selector -->
          <div class="option-item voice-group">
            <label for="selectVoice" class="option-label">System Voice</label>
            <div class="voice-select-wrapper" style="display: flex; gap: 6px; align-items: center;">
              <select id="selectVoice" class="option-select" aria-label="Detected System Voice" style="min-width: 220px;">
                <option value="">Detecting system voices...</option>
              </select>
              <button type="button" class="btn btn-ctrl" id="btnTestVoice" title="Preview selected voice" aria-label="Test voice" style="padding: 6px 10px; font-size: 13px;">
                🔊
              </button>
            </div>
          </div>

          <!-- Speed Control -->
          <div class="option-item speed-group">
            <div class="speed-header">
              <label for="sliderSpeed" class="option-label">Speed: <span id="speedValue" class="speed-badge">1.0x</span></label>
              <div class="speed-presets">
                <button type="button" class="btn-speed-preset is-active" data-speed="1.0">1.0x</button>
                <button type="button" class="btn-speed-preset" data-speed="1.5">1.5x</button>
                <button type="button" class="btn-speed-preset" data-speed="2.0">2.0x</button>
                <button type="button" class="btn-speed-preset" data-speed="2.5">2.5x</button>
                <button type="button" class="btn-speed-preset" data-speed="3.0">3.0x</button>
              </div>
            </div>
            <input type="range" id="sliderSpeed" min="0.5" max="3.0" step="0.1" value="1.0" class="option-range" aria-label="Playback speed (0.5x to 3.0x)" />
          </div>
        </div>

        <!-- Global Utilities -->
        <div class="controls-utils">
          <button type="button" class="btn btn-icon-only" id="btnSettings" title="Settings" aria-label="Open Settings">
            ⚙️
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnPlay = this.container.querySelector('#btnPlay');
    const btnPause = this.container.querySelector('#btnPause');
    const btnStop = this.container.querySelector('#btnStop');
    const btnRestart = this.container.querySelector('#btnRestart');
    const btnStepBack = this.container.querySelector('#btnStepBack');
    const btnStepForward = this.container.querySelector('#btnStepForward');
    const selectLanguage = this.container.querySelector('#selectLanguage');
    const selectVoice = this.container.querySelector('#selectVoice');
    const btnTestVoice = this.container.querySelector('#btnTestVoice');
    const sliderSpeed = this.container.querySelector('#sliderSpeed');
    const speedValue = this.container.querySelector('#speedValue');
    const btnSettings = this.container.querySelector('#btnSettings');
    const speedPresets = this.container.querySelectorAll('.btn-speed-preset');

    if (btnPlay) {
      btnPlay.onclick = () => this.callbacks.onPlay?.();
    }
    if (btnPause) {
      btnPause.onclick = () => this.callbacks.onPause?.();
    }
    if (btnStop) {
      btnStop.onclick = () => this.callbacks.onStop?.();
    }
    if (btnRestart) {
      btnRestart.onclick = () => this.callbacks.onRestart?.();
    }
    if (btnStepBack) {
      btnStepBack.onclick = () => this.callbacks.onStepBack?.();
    }
    if (btnStepForward) {
      btnStepForward.onclick = () => this.callbacks.onStepForward?.();
    }

    if (selectLanguage) {
      selectLanguage.onchange = (e) => this.callbacks.onLanguageChange?.(e.target.value);
    }
    if (selectVoice) {
      selectVoice.onchange = (e) => this.callbacks.onVoiceChange?.(e.target.value);
    }
    if (btnTestVoice) {
      btnTestVoice.onclick = () => {
        const val = selectVoice?.value;
        const curLang = selectLanguage?.value || 'eng';
        this.callbacks.onTestVoice?.(val, curLang);
      };
    }

    const setSpeedUI = (val) => {
      const formatted = parseFloat(val).toFixed(1);
      if (speedValue) speedValue.textContent = `${formatted}x`;
      if (sliderSpeed) sliderSpeed.value = formatted;
      this.callbacks.onSpeedChange?.(parseFloat(formatted));

      speedPresets.forEach(btn => {
        if (parseFloat(btn.getAttribute('data-speed')).toFixed(1) === formatted) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    };

    if (sliderSpeed) {
      sliderSpeed.oninput = (e) => setSpeedUI(e.target.value);
    }

    speedPresets.forEach((btn) => {
      btn.onclick = () => {
        const targetSpeed = btn.getAttribute('data-speed');
        setSpeedUI(targetSpeed);
      };
    });

    if (btnSettings) {
      btnSettings.onclick = () => this.callbacks.onOpenSettings?.();
    }
  }

  updateState(readerState, hasDocument = false) {
    const btnPlay = this.container.querySelector('#btnPlay');
    const btnPause = this.container.querySelector('#btnPause');
    const btnStop = this.container.querySelector('#btnStop');
    const btnRestart = this.container.querySelector('#btnRestart');
    const btnStepBack = this.container.querySelector('#btnStepBack');
    const btnStepForward = this.container.querySelector('#btnStepForward');
    const visualizer = this.container.querySelector('#audioVisualizer');

    if (!btnPlay || !btnPause || !btnStop) return;

    btnPlay.disabled = !hasDocument;
    btnStop.disabled = !hasDocument || readerState.status === READER_STATUS.IDLE || readerState.status === READER_STATUS.STOPPED;
    if (btnRestart) btnRestart.disabled = !hasDocument;
    if (btnStepBack) btnStepBack.disabled = !hasDocument || readerState.currentIndex <= 0;
    if (btnStepForward) btnStepForward.disabled = !hasDocument || readerState.currentIndex >= (readerState.totalTokens - 1);

    if (readerState.status === READER_STATUS.PLAYING) {
      btnPlay.classList.add('is-hidden');
      btnPause.classList.remove('is-hidden');
      visualizer?.classList.add('is-active');
    } else {
      btnPlay.classList.remove('is-hidden');
      btnPause.classList.add('is-hidden');
      visualizer?.classList.remove('is-active');
    }
  }

  populateVoices(voices, currentLang = 'eng') {
    const selectVoice = this.container.querySelector('#selectVoice');
    if (!selectVoice) return;

    selectVoice.innerHTML = '';

    if (!voices || voices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Default System Voice';
      selectVoice.appendChild(opt);
      return;
    }

    const langTarget = currentLang.startsWith('ar') ? 'ar' : currentLang.startsWith('fr') ? 'fr' : 'en';
    const matchingVoices = voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(langTarget));
    const voiceList = matchingVoices.length > 0 ? matchingVoices : voices;

    for (const v of voiceList) {
      const opt = document.createElement('option');
      opt.value = v.id || v.name;
      opt.textContent = v.name;
      selectVoice.appendChild(opt);
    }

    if (voiceList.length > 0) {
      selectVoice.value = voiceList[0].id || voiceList[0].name;
      this.callbacks.onVoiceChange?.(selectVoice.value);
    }
  }

  setLanguage(lang) {
    const selectLanguage = this.container.querySelector('#selectLanguage');
    if (selectLanguage) {
      selectLanguage.value = lang;
    }
  }
}
