/**
 * Basira Magnifier & Assistive Context HUD
 *
 * Provides a high-contrast, magnified reading banner showing the currently spoken
 * word in large crystal-clear typography with adjacent contextual tokens.
 * Crucial for low-vision readers, dyslexic users, and focused read-along mode.
 */

export class MagnifierHud {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = options;
    this.isVisible = true;
    this.currentToken = null;
    this.allTokens = [];
    this.currentIndex = 0;
    this.totalTokens = 0;

    this.hudElement = null;
    this.init();
  }

  init() {
    if (!this.container) return;

    let hud = this.container.querySelector('.basira-magnifier-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.className = 'basira-magnifier-hud';
      hud.setAttribute('role', 'region');
      hud.setAttribute('aria-label', 'Magnified Reading Context');
      this.container.appendChild(hud);
    }
    this.hudElement = hud;
    this.render();
  }

  setTokens(tokens) {
    this.allTokens = tokens || [];
    this.totalTokens = this.allTokens.length;
    this.render();
  }

  updateToken(token, index) {
    this.currentToken = token;
    this.currentIndex = index;
    this.render();
  }

  toggle(forceVisible) {
    this.isVisible = typeof forceVisible === 'boolean' ? forceVisible : !this.isVisible;
    if (this.hudElement) {
      this.hudElement.classList.toggle('is-hidden', !this.isVisible);
    }
  }

  clear() {
    this.currentToken = null;
    this.currentIndex = 0;
    this.render();
  }

  render() {
    if (!this.hudElement) return;

    if (!this.currentToken || this.allTokens.length === 0) {
      this.hudElement.innerHTML = `
        <div class="hud-inner is-idle">
          <div class="hud-prompt">
            <span class="hud-icon">🔎</span>
            <span class="hud-text">Press <strong>Play</strong> or click any word on the document to start reading</span>
          </div>
        </div>
      `;
      return;
    }

    const idx = this.currentIndex;
    const isRtl = this.currentToken.language === 'ara' || document.documentElement.getAttribute('dir') === 'rtl';

    // Extract surrounding context (2 words before, 2 words after)
    const prev2 = idx > 1 ? this.allTokens[idx - 2]?.text : '';
    const prev1 = idx > 0 ? this.allTokens[idx - 1]?.text : '';
    const current = this.currentToken.text || '';
    const next1 = idx < this.totalTokens - 1 ? this.allTokens[idx + 1]?.text : '';
    const next2 = idx < this.totalTokens - 2 ? this.allTokens[idx + 2]?.text : '';

    const progressPct = Math.round(((idx + 1) / Math.max(1, this.totalTokens)) * 100);

    this.hudElement.innerHTML = `
      <div class="hud-inner ${isRtl ? 'is-rtl' : 'is-ltr'}">
        <div class="hud-meta">
          <span class="hud-badge-lang">${isRtl ? '🇲🇦 العربية' : '🇬🇧 English'}</span>
          <span class="hud-progress-text">Word ${idx + 1} of ${this.totalTokens} (${progressPct}%)</span>
        </div>

        <div class="hud-stream" dir="${isRtl ? 'rtl' : 'ltr'}">
          ${prev2 ? `<span class="hud-word is-dim">${prev2}</span>` : ''}
          ${prev1 ? `<span class="hud-word is-context">${prev1}</span>` : ''}
          <span class="hud-word is-active" id="hudActiveWord">${current}</span>
          ${next1 ? `<span class="hud-word is-context">${next1}</span>` : ''}
          ${next2 ? `<span class="hud-word is-dim">${next2}</span>` : ''}
        </div>

        <div class="hud-progress-bar">
          <div class="hud-progress-fill" style="width: ${progressPct}%"></div>
        </div>
      </div>
    `;
  }
}
