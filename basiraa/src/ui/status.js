/**
 * Status and Notification UI Component
 */
export class StatusView {
  constructor(element) {
    this.element = element;
  }

  showProgress(percentage, message) {
    if (!this.element) return;
    this.element.innerHTML = `
      <div class="basira-status-progress" role="status" aria-live="polite">
        <div class="status-header">
          <span class="status-spinner"></span>
          <span class="status-text">${message || 'Processing...'}</span>
          <span class="status-percent">${percentage}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    this.element.classList.remove('is-hidden');
  }

  showNotification(message, type = 'info', timeoutMs = 4000) {
    if (!this.element) return;
    this.element.innerHTML = `
      <div class="basira-notification type-${type}" role="status" aria-live="polite">
        <span class="notif-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="notif-text">${message}</span>
      </div>
    `;
    this.element.classList.remove('is-hidden');

    if (timeoutMs > 0) {
      setTimeout(() => {
        this.clear();
      }, timeoutMs);
    }
  }

  clear() {
    if (!this.element) return;
    this.element.innerHTML = '';
    this.element.classList.add('is-hidden');
  }
}
