// @ts-nocheck
/**
 * LIGHTBOX COMPONENT
 * Displays photos in fullscreen view with navigation and keyboard controls
 */

/**
 * LightboxComponent - Photo viewer with carousel
 */
class LightboxComponent {
  /**
   * @param {object} options
   * @param {HTMLElement} options.container - Container element
   * @param {PhotoManager} options.photoManager - Photo manager instance
   * @param {Function} options.onClose - Callback when lightbox closed
   */
  constructor({ container, photoManager, onClose }) {
    this.container = container;
    this.photoManager = photoManager;
    this.onClose = onClose;
    this.photos = [];
    this.currentIndex = 0;
    this.isOpen = false;
  }

  /**
   * Open lightbox with photos
   * @param {object[]} photos - Array of photos
   * @param {number} startIndex - Starting photo index (default: 0)
   * @returns {void}
   */
  open(photos, startIndex = 0) {
    this.photos = photos;
    this.currentIndex = Math.min(startIndex, photos.length - 1);
    this.isOpen = true;

    this._render();
    this._attachEventHandlers();
  }

  /**
   * Close lightbox
   * @returns {void}
   */
  close() {
    this.isOpen = false;
    this.container.innerHTML = '';
    this.onClose?.();
  }

  /**
   * Show next photo
   * @returns {void}
   */
  next() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
      this._updatePhoto();
    }
  }

  /**
   * Show previous photo
   * @returns {void}
   */
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._updatePhoto();
    }
  }

  /**
   * Go to specific photo index
   * @param {number} index - Photo index
   * @returns {void}
   */
  goToIndex(index) {
    if (index >= 0 && index < this.photos.length) {
      this.currentIndex = index;
      this._updatePhoto();
    }
  }

  /**
   * Render lightbox
   * @private
   */
  _render() {
    this.container.innerHTML = `
      <div class="lightbox" role="dialog" aria-label="Photo viewer">
        <div class="lightbox__overlay"></div>
        <div class="lightbox__content">
          <button class="lightbox__close" aria-label="Close lightbox">
            <span>×</span>
          </button>
          <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous photo">
            <span>❮</span>
          </button>
          <div class="lightbox__photo-container">
            <img class="lightbox__photo" alt="Photo" />
          </div>
          <button class="lightbox__nav lightbox__nav--next" aria-label="Next photo">
            <span>❯</span>
          </button>
          <div class="lightbox__footer">
            <div class="lightbox__info">
              <span class="lightbox__counter"><span class="lightbox__counter-current">1</span> / <span class="lightbox__counter-total">${this.photos.length}</span></span>
              <span class="lightbox__title"></span>
            </div>
            <div class="lightbox__thumbnails"></div>
          </div>
        </div>
      </div>
    `;

    this._updatePhoto();
  }

  /**
   * Update photo display
   * @private
   */
  _updatePhoto() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    const img = this.container.querySelector('.lightbox__photo');
    const title = this.container.querySelector('.lightbox__title');
    const counter = this.container.querySelector('.lightbox__counter-current');

    img.src = photo.data_url || '';
    img.alt = photo.filename;
    title.textContent = photo.filename;
    counter.textContent = this.currentIndex + 1;

    // Update thumbnail highlight
    this._updateThumbnails();

    // Update nav button states
    this._updateNavButtons();
  }

  /**
   * Update thumbnail selection
   * @private
   */
  _updateThumbnails() {
    const thumbnailsContainer = this.container.querySelector('.lightbox__thumbnails');
    thumbnailsContainer.innerHTML = '';

    this.photos.forEach((photo, index) => {
      const thumbButton = document.createElement('button');
      thumbButton.className = 'lightbox__thumbnail';
      if (index === this.currentIndex) {
        thumbButton.classList.add('lightbox__thumbnail--active');
      }
      thumbButton.setAttribute('aria-label', `Photo ${index + 1}: ${photo.filename}`);
      thumbButton.addEventListener('click', () => this.goToIndex(index));

      const img = document.createElement('img');
      img.src = photo.thumbnail_url || photo.data_url || '';
      img.alt = '';
      thumbButton.appendChild(img);

      thumbnailsContainer.appendChild(thumbButton);
    });
  }

  /**
   * Update navigation button states
   * @private
   */
  _updateNavButtons() {
    const prevButton = this.container.querySelector('.lightbox__nav--prev');
    const nextButton = this.container.querySelector('.lightbox__nav--next');

    prevButton.disabled = this.currentIndex === 0;
    nextButton.disabled = this.currentIndex === this.photos.length - 1;
  }

  /**
   * Attach event handlers
   * @private
   */
  _attachEventHandlers() {
    const closeButton = this.container.querySelector('.lightbox__close');
    const prevButton = this.container.querySelector('.lightbox__nav--prev');
    const nextButton = this.container.querySelector('.lightbox__nav--next');
    const overlay = this.container.querySelector('.lightbox__overlay');

    closeButton?.addEventListener('click', () => this.close());
    prevButton?.addEventListener('click', () => this.prev());
    nextButton?.addEventListener('click', () => this.next());
    overlay?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => this._handleKeyboard(e));
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeyboard(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case ' ':
        event.preventDefault();
        this.next();
        break;
      default:
        break;
    }
  }
}

export { LightboxComponent };
