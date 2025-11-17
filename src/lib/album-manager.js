// @ts-nocheck
/* eslint-disable no-undef */
/**
 * ALBUM MANAGER - Album CRUD Operations and Organization
 * Handles album creation, retrieval, updates, deletion, grouping by date, and reordering
 */

import { Database } from './storage.js';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from './errors.js';

/**
 * Validates album object
 * @param {object} album - Album to validate
 * @param {boolean} requireId - Whether ID is required
 * @throws {ValidationError} If validation fails
 */
function validateAlbum(album, requireId = false) {
  if (requireId && !album.id) {
    throw new ValidationError('Album ID is required', { field: 'id' });
  }

  if (!album.name || typeof album.name !== 'string' || album.name.trim().length === 0) {
    throw new ValidationError('Album name must be a non-empty string', { field: 'name' });
  }

  if (album.name.length > 255) {
    throw new ValidationError('Album name must be 255 characters or less', {
      field: 'name',
      max: 255,
    });
  }

  if (!album.group_date || typeof album.group_date !== 'string') {
    throw new ValidationError('Album group_date must be a valid string (YYYY-MM format)', {
      field: 'group_date',
    });
  }

  // Validate group_date format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(album.group_date)) {
    throw new ValidationError('Album group_date must be in YYYY-MM format', {
      field: 'group_date',
    });
  }

  if (typeof album.sort_index !== 'number' || album.sort_index < 0) {
    throw new ValidationError('Album sort_index must be a non-negative number', {
      field: 'sort_index',
    });
  }
}

/**
 * AlbumManager - Manages album operations
 */
class AlbumManager {
  /**
   * @param {Database} db - Database instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new album
   * @param {object} album - Album object {name, group_date, sort_index, metadata?}
   * @returns {object} Created album with id, created_at, updated_at
   * @throws {ValidationError} If album is invalid
   * @throws {DuplicateError} If album name already exists in group
   */
  createAlbum(album) {
    validateAlbum(album, false);

    // Check for duplicate album name in same group
    const existing = this.db.query(
      'SELECT id FROM albums WHERE name = ? AND group_date = ?',
      [album.name.trim(), album.group_date]
    );

    if (existing.length > 0) {
      throw new DuplicateError(
        `Album "${album.name}" already exists in ${album.group_date}`,
        { name: album.name, group_date: album.group_date }
      );
    }

    const id = this._generateId();
    const now = Date.now();

    this.db.exec(
      `INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        album.name.trim(),
        now,
        now,
        album.group_date,
        album.sort_index || 0,
        album.metadata ? JSON.stringify(album.metadata) : null,
      ]
    );

    return this.getAlbumById(id);
  }

  /**
   * Get album by ID
   * @param {string} id - Album ID
   * @returns {object|null} Album object or null if not found
   */
  getAlbumById(id) {
    const album = this.db.getById('albums', id);
    return album ? this._parseAlbum(album) : null;
  }

  /**
   * Get all albums
   * @param {string} orderBy - ORDER BY clause (default: "group_date DESC, sort_index ASC")
   * @returns {object[]} Array of album objects
   */
  getAllAlbums(orderBy = 'group_date DESC, sort_index ASC') {
    const albums = this.db.getAll('albums', orderBy);
    return albums.map((a) => this._parseAlbum(a));
  }

  /**
   * Get albums by group date
   * @param {string} groupDate - Group date (YYYY-MM format)
   * @returns {object[]} Array of albums in that group, ordered by sort_index
   */
  getAlbumsByGroup(groupDate) {
    const albums = this.db.query(
      'SELECT * FROM albums WHERE group_date = ? ORDER BY sort_index ASC',
      [groupDate]
    );
    return albums.map((a) => this._parseAlbum(a));
  }

  /**
   * Get all groups with album counts
   * @returns {object[]} Array of groups {group_date, count, albums: Album[]}
   */
  getGroups() {
    const groups = this.db.query(
      `SELECT group_date, COUNT(*) as count FROM albums 
       GROUP BY group_date ORDER BY group_date DESC`
    );

    return groups.map((g) => ({
      group_date: g.group_date,
      count: g.count,
      albums: this.getAlbumsByGroup(g.group_date),
    }));
  }

  /**
   * Update album
   * @param {string} id - Album ID
   * @param {object} updates - Fields to update {name?, sort_index?, metadata?}
   * @returns {object} Updated album
   * @throws {NotFoundError} If album not found
   * @throws {ValidationError} If updates are invalid
   */
  updateAlbum(id, updates) {
    const album = this.getAlbumById(id);
    if (!album) {
      throw new NotFoundError(`Album not found: ${id}`, { id });
    }

    const merged = { ...album, ...updates, id, group_date: album.group_date };
    validateAlbum(merged, true);

    const now = Date.now();
    const updateFields = [];
    const params = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      params.push(updates.name.trim());
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
      return album; // No updates
    }

    updateFields.push('updated_at = ?');
    params.push(now);
    params.push(id);

    this.db.exec(
      `UPDATE albums SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    return this.getAlbumById(id);
  }

  /**
   * Delete album and all its photos
   * @param {string} id - Album ID
   * @returns {number} Number of photos deleted
   * @throws {NotFoundError} If album not found
   */
  deleteAlbum(id) {
    const album = this.getAlbumById(id);
    if (!album) {
      throw new NotFoundError(`Album not found: ${id}`, { id });
    }

    // Get photo count before deletion
    const photoCount = this.db.query('SELECT COUNT(*) as count FROM photos WHERE album_id = ?', [
      id,
    ])[0].count;

    // Delete album (cascade deletes photos due to foreign key)
    this.db.exec('DELETE FROM albums WHERE id = ?', [id]);

    return photoCount;
  }

  /**
   * Reorder albums within a group
   * Updates sort_index for albums based on provided order
   * @param {string} groupDate - Group date (YYYY-MM format)
   * @param {string[]} albumIds - Ordered array of album IDs in desired sort order
   * @returns {object[]} Updated albums in new order
   * @throws {ValidationError} If album IDs don't all belong to the group
   */
  reorderAlbumsInGroup(groupDate, albumIds) {
    if (!Array.isArray(albumIds) || albumIds.length === 0) {
      throw new ValidationError('albumIds must be a non-empty array', { albumIds });
    }

    // Verify all albums exist in the group
    const existing = this.db.query(
      `SELECT id FROM albums WHERE group_date = ? ORDER BY sort_index ASC`,
      [groupDate]
    );
    const existingIds = new Set(existing.map((a) => a.id));

    for (const id of albumIds) {
      if (!existingIds.has(id)) {
        throw new ValidationError(
          `Album ${id} does not belong to group ${groupDate}`,
          { id, groupDate }
        );
      }
    }

    // Update sort_index for each album
    this.db.begin();
    try {
      albumIds.forEach((id, index) => {
        this.db.exec('UPDATE albums SET sort_index = ?, updated_at = ? WHERE id = ?', [
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

    return this.getAlbumsByGroup(groupDate);
  }

  /**
   * Move album to different group
   * @param {string} id - Album ID
   * @param {string} newGroupDate - New group date (YYYY-MM format)
   * @returns {object} Updated album
   */
  moveAlbumToGroup(id, newGroupDate) {
    if (!/^\d{4}-\d{2}$/.test(newGroupDate)) {
      throw new ValidationError('newGroupDate must be in YYYY-MM format', {
        field: 'newGroupDate',
      });
    }

    const album = this.getAlbumById(id);
    if (!album) {
      throw new NotFoundError(`Album not found: ${id}`, { id });
    }

    // Get max sort_index in new group
    const maxSort = this.db.query(
      'SELECT MAX(sort_index) as max FROM albums WHERE group_date = ?',
      [newGroupDate]
    )[0].max;

    const newSortIndex = (maxSort || 0) + 1;

    this.db.exec(
      'UPDATE albums SET group_date = ?, sort_index = ?, updated_at = ? WHERE id = ?',
      [newGroupDate, newSortIndex, Date.now(), id]
    );

    return this.getAlbumById(id);
  }

  /**
   * Get album with photo count
   * @param {string} id - Album ID
   * @returns {object|null} Album with photo_count property
   */
  getAlbumWithPhotoCount(id) {
    const album = this.getAlbumById(id);
    if (!album) return null;

    const photoCount = this.db.query('SELECT COUNT(*) as count FROM photos WHERE album_id = ?', [
      id,
    ])[0].count;

    return { ...album, photo_count: photoCount };
  }

  /**
   * Get all albums with photo counts
   * @returns {object[]} Albums with photo_count property
   */
  getAllAlbumsWithPhotoCounts() {
    const albums = this.getAllAlbums();
    return albums.map((album) => {
      const photoCount = this.db.query(
        'SELECT COUNT(*) as count FROM photos WHERE album_id = ?',
        [album.id]
      )[0].count;
      return { ...album, photo_count: photoCount };
    });
  }

  /**
   * Parse album from database row
   * @private
   */
  _parseAlbum(row) {
    return {
      id: row.id,
      name: row.name,
      group_date: row.group_date,
      sort_index: row.sort_index,
      created_at: row.created_at,
      updated_at: row.updated_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    };
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    return `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { AlbumManager };
