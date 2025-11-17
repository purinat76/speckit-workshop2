// @ts-nocheck
/**
 * APPLICATION CONTROLLER
 * Main app initialization and component orchestration
 */

import { createDatabase } from './lib/storage.js';
import { AlbumManager } from './lib/album-manager.js';
import { PhotoManager } from './lib/photo-manager.js';
import { AppState } from './lib/state.js';
import { AlbumListComponent } from './ui/album-list.js';
import { LightboxComponent } from './ui/lightbox.js';

/**
 * App class - Main application controller
 */
class App {
  constructor() {
    this.db = null;
    this.albumManager = null;
    this.photoManager = null;
    this.appState = null;
    this.albumListComponent = null;
    this.lightboxComponent = null;
  }

  /**
   * Initialize application
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('Initializing Photo Album Organizer...');

      // Initialize database
      this.db = await createDatabase();
      console.log('Database initialized');

      // Initialize managers
      this.albumManager = new AlbumManager(this.db);
      this.photoManager = new PhotoManager(this.db);
      console.log('Managers initialized');

      // Initialize state
      this.appState = new AppState();

      // Initialize UI components
      this._initializeComponents();

      // Load initial data
      await this._loadInitialData();

      // Setup event listeners
      this._setupEventListeners();

      console.log('Application ready');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this._showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Initialize UI components
   * @private
   */
  _initializeComponents() {
    const albumListContainer = document.getElementById('album-list-container');
    const lightboxContainer = document.getElementById('lightbox-container');

    if (!albumListContainer) {
      throw new Error('Album list container not found');
    }

    this.albumListComponent = new AlbumListComponent({
      container: albumListContainer,
      albumManager: this.albumManager,
      appState: this.appState,
      onAlbumSelect: (album) => this._handleAlbumSelect(album),
      onAlbumReorder: (data) => this._handleAlbumReorder(data),
    });

    this.lightboxComponent = new LightboxComponent({
      container: lightboxContainer || document.createElement('div'),
      photoManager: this.photoManager,
      onClose: () => this.appState.setViewMode('grid'),
    });
  }

  /**
   * Load initial data and render
   * @private
   * @async
   */
  async _loadInitialData() {
    try {
      const groups = this.albumManager.getGroups();
      this.appState.setGroups(groups);
      this.albumListComponent.render(groups);
    } catch (error) {
      console.error('Failed to load albums:', error);
      this._showError('Failed to load albums');
    }
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    // Create album button
    const createAlbumBtn = document.getElementById('create-album-btn');
    if (createAlbumBtn) {
      createAlbumBtn.addEventListener('click', () => this._handleCreateAlbum());
    }

    // Upload photos button
    const uploadPhotosBtn = document.getElementById('upload-photos-btn');
    if (uploadPhotosBtn) {
      uploadPhotosBtn.addEventListener('click', () => this._handleUploadPhotos());
    }

    // Subscribe to state changes
    this.appState.subscribe((state) => {
      console.log('State updated:', state);
    });
  }

  /**
   * Handle album selection
   * @private
   */
  _handleAlbumSelect(album) {
    console.log('Album selected:', album.name);
    this.appState.setCurrentAlbum(album);

    // Load photos for album
    const photos = this.photoManager.getPhotosByAlbum(album.id);
    if (photos.length > 0) {
      this.appState.setViewMode('lightbox');
      this.lightboxComponent.open(photos, 0);
    } else {
      this._showInfo(`Album "${album.name}" has no photos yet.`);
    }
  }

  /**
   * Handle album reordering
   * @private
   */
  _handleAlbumReorder(data) {
    console.log('Album reorder:', data);
    // TODO: Implement album reordering logic
  }

  /**
   * Handle create album
   * @private
   */
  _handleCreateAlbum() {
    const name = prompt('Album name:');
    if (!name || !name.trim()) return;

    try {
      const currentDate = new Date();
      const groupDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      this.albumManager.createAlbum({
        name: name.trim(),
        group_date: groupDate,
        sort_index: 0,
      });

      this._loadInitialData();
      this._showInfo(`Album "${name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create album:', error);
      this._showError('Failed to create album');
    }
  }

  /**
   * Handle upload photos
   * @private
   */
  _handleUploadPhotos() {
    // TODO: Implement photo upload
    this._showInfo('Photo upload coming in Phase 2');
  }

  /**
   * Show error message
   * @private
   */
  _showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Show info message
   * @private
   */
  _showInfo(message) {
    const infoElement = document.getElementById('info-message');
    if (infoElement) {
      infoElement.textContent = message;
      infoElement.style.display = 'block';
      setTimeout(() => {
        infoElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Shutdown application
   * @async
   */
  async shutdown() {
    if (this.db) {
      await this.db.close();
    }
  }
}

export { App };
