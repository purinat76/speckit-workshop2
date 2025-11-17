// @ts-nocheck
/* eslint-disable no-undef */
/**
 * PHOTO MANAGER - Photo CRUD Operations, Thumbnails, and Metadata
 * Handles photo creation, retrieval, updates, deletion, thumbnail generation, and metadata extraction
 */

import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from './errors.js';

/**
 * Validates photo object
 * @param {object} photo - Photo to validate
 * @param {boolean} requireId - Whether ID is required
 * @throws {ValidationError} If validation fails
 */
function validatePhoto(photo, requireId = false) {
  if (requireId && !photo.id) {
    throw new ValidationError('Photo ID is required', { field: 'id' });
  }

  if (!photo.album_id || typeof photo.album_id !== 'string') {
    throw new ValidationError('Photo album_id must be a non-empty string', { field: 'album_id' });
  }

  if (!photo.filename || typeof photo.filename !== 'string' || photo.filename.trim().length === 0) {
    throw new ValidationError('Photo filename must be a non-empty string', { field: 'filename' });
  }

  if (typeof photo.file_size !== 'number' || photo.file_size <= 0) {
    throw new ValidationError('Photo file_size must be a positive number', { field: 'file_size' });
  }

  if (!photo.mime_type || typeof photo.mime_type !== 'string') {
    throw new ValidationError('Photo mime_type must be a non-empty string', { field: 'mime_type' });
  }

  if (photo.width !== undefined && photo.width !== null && (typeof photo.width !== 'number' || photo.width <= 0)) {
    throw new ValidationError('Photo width must be a positive number', { field: 'width' });
  }

  if (photo.height !== undefined && photo.height !== null && (typeof photo.height !== 'number' || photo.height <= 0)) {
    throw new ValidationError('Photo height must be a positive number', { field: 'height' });
  }

  if (typeof photo.sort_index !== 'number' || photo.sort_index < 0) {
    throw new ValidationError('Photo sort_index must be a non-negative number', {
      field: 'sort_index',
    });
  }
}

/**
 * PhotoManager - Manages photo operations
 */
class PhotoManager {
  /**
   * @param {object} db - Database instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new photo
   * @param {object} photo - Photo object {album_id, filename, file_size, mime_type, width?, height?, sort_index?, metadata?}
   * @returns {object} Created photo with id, created_at, updated_at
   * @throws {ValidationError} If photo is invalid
   * @throws {DuplicateError} If filename already exists in album
   */
  createPhoto(photo) {
    validatePhoto(photo, false);

    // Check for duplicate filename in album
    const existing = this.db.query(
      'SELECT id FROM photos WHERE album_id = ? AND filename = ?',
      [photo.album_id, photo.filename.trim()]
    );

    if (existing.length > 0) {
      throw new DuplicateError(
        `Photo "${photo.filename}" already exists in album`,
        { filename: photo.filename, album_id: photo.album_id }
      );
    }

    const id = this._generateId();
    const now = Date.now();

    this.db.exec(
      `INSERT INTO photos (id, album_id, filename, file_size, mime_type, width, height, created_at, updated_at, sort_index, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        photo.album_id,
        photo.filename.trim(),
        photo.file_size,
        photo.mime_type,
        photo.width || null,
        photo.height || null,
        now,
        now,
        photo.sort_index || 0,
        photo.metadata ? JSON.stringify(photo.metadata) : null,
      ]
    );

    return this.getPhotoById(id);
  }

  /**
   * Get photo by ID
   * @param {string} id - Photo ID
   * @returns {object|null} Photo object or null if not found
   */
  getPhotoById(id) {
    const photo = this.db.getById('photos', id);
    return photo ? this._parsePhoto(photo) : null;
  }

  /**
   * Get all photos
   * @param {string} orderBy - ORDER BY clause (default: "sort_index ASC")
   * @returns {object[]} Array of photo objects
   */
  getAllPhotos(orderBy = 'sort_index ASC') {
    const photos = this.db.getAll('photos', orderBy);
    return photos.map((p) => this._parsePhoto(p));
  }

  /**
   * Get photos by album
   * @param {string} albumId - Album ID
   * @returns {object[]} Array of photos in album, ordered by sort_index
   */
  getPhotosByAlbum(albumId) {
    const photos = this.db.query(
      'SELECT * FROM photos WHERE album_id = ? ORDER BY sort_index ASC',
      [albumId]
    );
    return photos.map((p) => this._parsePhoto(p));
  }

  /**
   * Update photo
   * @param {string} id - Photo ID
   * @param {object} updates - Fields to update {filename?, width?, height?, sort_index?, metadata?}
   * @returns {object} Updated photo
   * @throws {NotFoundError} If photo not found
   * @throws {ValidationError} If updates are invalid
   */
  updatePhoto(id, updates) {
    const photo = this.getPhotoById(id);
    if (!photo) {
      throw new NotFoundError(`Photo not found: ${id}`, { id });
    }

    const merged = { ...photo, ...updates, id, album_id: photo.album_id };
    validatePhoto(merged, true);

    const now = Date.now();
    const updateFields = [];
    const params = [];

    if (updates.filename !== undefined) {
      updateFields.push('filename = ?');
      params.push(updates.filename.trim());
    }

    if (updates.width !== undefined) {
      updateFields.push('width = ?');
      params.push(updates.width);
    }

    if (updates.height !== undefined) {
      updateFields.push('height = ?');
      params.push(updates.height);
    }

    if (updates.sort_index !== undefined) {
      updateFields.push('sort_index = ?');
      params.push(updates.sort_index);
    }

    if (updates.metadata !== undefined) {
      updateFields.push('metadata = ?');
      params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }

    if (updateFields.length === 0) {
      return photo; // No updates
    }

    updateFields.push('updated_at = ?');
    params.push(now);
    params.push(id);

    this.db.exec(
      `UPDATE photos SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    return this.getPhotoById(id);
  }

  /**
   * Delete photo
   * @param {string} id - Photo ID
   * @returns {object} Deleted photo
   * @throws {NotFoundError} If photo not found
   */
  deletePhoto(id) {
    const photo = this.getPhotoById(id);
    if (!photo) {
      throw new NotFoundError(`Photo not found: ${id}`, { id });
    }

    this.db.exec('DELETE FROM photos WHERE id = ?', [id]);
    return photo;
  }

  /**
   * Reorder photos within an album
   * @param {string} albumId - Album ID
   * @param {string[]} photoIds - Ordered array of photo IDs
   * @returns {object[]} Updated photos in new order
   * @throws {ValidationError} If photo IDs don't all belong to the album
   */
  reorderPhotosInAlbum(albumId, photoIds) {
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      throw new ValidationError('photoIds must be a non-empty array', { photoIds });
    }

    // Verify all photos exist in the album
    const existing = this.db.query(
      'SELECT id FROM photos WHERE album_id = ? ORDER BY sort_index ASC',
      [albumId]
    );
    const existingIds = new Set(existing.map((p) => p.id));

    for (const id of photoIds) {
      if (!existingIds.has(id)) {
        throw new ValidationError(
          `Photo ${id} does not belong to album ${albumId}`,
          { id, albumId }
        );
      }
    }

    // Update sort_index for each photo
    this.db.begin();
    try {
      photoIds.forEach((id, index) => {
        this.db.exec('UPDATE photos SET sort_index = ?, updated_at = ? WHERE id = ?', [
          index,
          Date.now(),
          id,
        ]);
      });
      this.db.commit();
    } catch (error) {
      this.db.rollback();
      throw error;
    }

    return this.getPhotosByAlbum(albumId);
  }

  /**
   * Move photo to different album
   * @param {string} id - Photo ID
   * @param {string} newAlbumId - Target album ID
   * @returns {object} Updated photo
   */
  movePhotoToAlbum(id, newAlbumId) {
    const photo = this.getPhotoById(id);
    if (!photo) {
      throw new NotFoundError(`Photo not found: ${id}`, { id });
    }

    // Get max sort_index in new album
    const maxSort = this.db.query(
      'SELECT MAX(sort_index) as max FROM photos WHERE album_id = ?',
      [newAlbumId]
    )[0].max;

    const newSortIndex = (maxSort || 0) + 1;

    this.db.exec(
      'UPDATE photos SET album_id = ?, sort_index = ?, updated_at = ? WHERE id = ?',
      [newAlbumId, newSortIndex, Date.now(), id]
    );

    return this.getPhotoById(id);
  }

  /**
   * Generate thumbnail from image data using Canvas API
   * Resizes image to target dimensions and returns as data URL
   * @param {string} imageDataUrl - Image data URL or blob URL
   * @param {number} maxWidth - Maximum width (default: 200)
   * @param {number} maxHeight - Maximum height (default: 200)
   * @returns {Promise<string>} Thumbnail data URL
   */
  async generateThumbnail(imageDataUrl, maxWidth = 200, maxHeight = 200) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Create canvas and draw thumbnail
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnailUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail generation'));
      };

      img.src = imageDataUrl;
    });
  }

  /**
   * Extract image dimensions from File or Blob
   * @param {File|Blob} file - Image file
   * @returns {Promise<{width: number, height: number}>} Image dimensions
   */
  async extractImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = event.target?.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract EXIF metadata from image (simplified - returns basic metadata)
   * @param {File|Blob} file - Image file
   * @returns {Promise<object>} Metadata {width, height, size, mime_type}
   */
  async extractImageMetadata(file) {
    const dimensions = await this.extractImageDimensions(file);

    return {
      width: dimensions.width,
      height: dimensions.height,
      file_size: file.size,
      mime_type: file.type || 'image/jpeg',
      last_modified: file.lastModified,
    };
  }

  /**
   * Get photo statistics for an album
   * @param {string} albumId - Album ID
   * @returns {object} Stats {count, total_size, avg_width, avg_height}
   */
  getPhotoStats(albumId) {
    const stats = this.db.query(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(file_size), 0) as total_size,
        ROUND(AVG(width), 0) as avg_width,
        ROUND(AVG(height), 0) as avg_height
       FROM photos WHERE album_id = ?`,
      [albumId]
    )[0];

    return {
      count: stats.count || 0,
      total_size: stats.total_size || 0,
      avg_width: stats.avg_width || 0,
      avg_height: stats.avg_height || 0,
    };
  }

  /**
   * Parse photo from database row
   * @private
   */
  _parsePhoto(row) {
    return {
      id: row.id,
      album_id: row.album_id,
      filename: row.filename,
      file_size: row.file_size,
      mime_type: row.mime_type,
      width: row.width || null,
      height: row.height || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sort_index: row.sort_index,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    };
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    return `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { PhotoManager };
