// @ts-nocheck
/**
 * APPLICATION STATE MANAGER
 * Manages global application state and event subscription
 */

class AppState {
  constructor() {
    this.state = {
      albums: [],
      currentAlbum: null,
      groups: [],
      selectedPhotos: new Set(),
      viewMode: 'grid', // 'grid' or 'lightbox'
      isLoading: false,
      error: null,
    };

    this.listeners = new Set();
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit state change to all listeners
   * @private
   */
  _notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Get current state
   * @returns {object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set albums
   * @param {object[]} albums - Album list
   */
  setAlbums(albums) {
    this.state.albums = albums;
    this._notify();
  }

  /**
   * Set groups
   * @param {object[]} groups - Group list with albums
   */
  setGroups(groups) {
    this.state.groups = groups;
    this._notify();
  }

  /**
   * Set current album
   * @param {object|null} album - Album or null
   */
  setCurrentAlbum(album) {
    this.state.currentAlbum = album;
    this._notify();
  }

  /**
   * Select photo
   * @param {string} photoId - Photo ID
   */
  selectPhoto(photoId) {
    this.state.selectedPhotos.add(photoId);
    this._notify();
  }

  /**
   * Deselect photo
   * @param {string} photoId - Photo ID
   */
  deselectPhoto(photoId) {
    this.state.selectedPhotos.delete(photoId);
    this._notify();
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.state.selectedPhotos.clear();
    this._notify();
  }

  /**
   * Toggle photo selection
   * @param {string} photoId - Photo ID
   */
  togglePhotoSelection(photoId) {
    if (this.state.selectedPhotos.has(photoId)) {
      this.deselectPhoto(photoId);
    } else {
      this.selectPhoto(photoId);
    }
  }

  /**
   * Set view mode
   * @param {string} mode - View mode ('grid' or 'lightbox')
   */
  setViewMode(mode) {
    if (['grid', 'lightbox'].includes(mode)) {
      this.state.viewMode = mode;
      this._notify();
    }
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.state.isLoading = loading;
    this._notify();
  }

  /**
   * Set error
   * @param {Error|null} error - Error or null
   */
  setError(error) {
    this.state.error = error;
    this._notify();
  }
}

export { AppState };
