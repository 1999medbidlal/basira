/**
 * Developer Diagnostic View Component
 */
export class DiagnosticView {
  constructor(containerElement) {
    this.container = containerElement;
    this.activeToken = null;
    this.documentModel = null;
    this.isVisible = false;
  }

  toggle(visible) {
    this.isVisible = typeof visible === 'boolean' ? visible : !this.isVisible;
    if (this.container) {
      if (this.isVisible) {
        this.container.classList.remove('is-hidden');
        this.render();
      } else {
        this.container.classList.add('is-hidden');
      }
    }
  }

  setDocument(doc) {
    this.documentModel = doc;
    this.render();
  }

  setActiveToken(token) {
    this.activeToken = token;
    this.render();
  }

  render() {
    if (!this.container || !this.isVisible) return;

    const doc = this.documentModel;
    const token = this.activeToken || doc?.reading?.tokens?.[0];

    this.container.innerHTML = `
      <div class="diagnostic-panel">
        <div class="diag-header">
          <h3>🛠️ Diagnostic Mode</h3>
          <button type="button" class="btn-diag-close" id="btnDiagClose" aria-label="Close Diagnostics">✕</button>
        </div>
        <div class="diag-meta">
          <div><strong>Tokens:</strong> ${doc?.reading?.tokens?.length || 0}</div>
          <div><strong>Direction:</strong> ${(doc?.reading?.direction || 'ltr').toUpperCase()}</div>
          <div><strong>OCR Confidence:</strong> ${doc?.ocr?.confidence || 0}%</div>
          <div><strong>Original Size:</strong> ${doc?.source?.width || 0} × ${doc?.source?.height || 0}px</div>
        </div>

        ${
          token
            ? `
          <div class="diag-token-card">
            <h4>Active Token [#${token.readingOrder}]</h4>
            <div class="diag-token-text">"${token.text}"</div>
            <table class="diag-table">
              <tr><td>Language</td><td>${token.language}</td></tr>
              <tr><td>Direction</td><td>${token.direction}</td></tr>
              <tr><td>Confidence</td><td>${token.confidence}%</td></tr>
              <tr><td>Line ID</td><td>${token.lineId}</td></tr>
              <tr><td>Original bbox</td><td>x: ${token.bbox.x}, y: ${token.bbox.y}, w: ${token.bbox.width}, h: ${token.bbox.height}</td></tr>
              <tr><td>Speech text</td><td>"${token.speechText}"</td></tr>
            </table>
          </div>
        `
            : '<div class="diag-empty">No active token</div>'
        }
      </div>
    `;

    const closeBtn = this.container.querySelector('#btnDiagClose');
    if (closeBtn) {
      closeBtn.onclick = () => this.toggle(false);
    }
  }
}
