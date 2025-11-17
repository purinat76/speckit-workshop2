// @ts-nocheck
/* eslint-disable no-undef */
/**
 * ALBUM AND PHOTO MANAGER TESTS
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabase } from '../src/lib/storage.js';
import { AlbumManager } from '../src/lib/album-manager.js';
import { PhotoManager } from '../src/lib/photo-manager.js';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '../src/lib/errors.js';

describe('AlbumManager', () => {
  let db;
  let albumManager;

  beforeEach(async () => {
    db = await createDatabase();
    albumManager = new AlbumManager(db);
  });

  afterEach(async () => {
    if (db) await db.close();
  });

  describe('Album CRUD', () => {
    it('should create album with valid data', () => {
      const album = albumManager.createAlbum({
        name: 'Summer 2025',
        group_date: '2025-06',
        sort_index: 0,
      });

      expect(album).toBeDefined();
      expect(album.id).toBeDefined();
      expect(album.name).toBe('Summer 2025');
      expect(album.group_date).toBe('2025-06');
      expect(album.created_at).toBeDefined();
      expect(album.updated_at).toBeDefined();
    });

    it('should throw validation error for empty name', () => {
      expect(() => {
        albumManager.createAlbum({
          name: '',
          group_date: '2025-06',
          sort_index: 0,
        });
      }).toThrow(ValidationError);
    });

    it('should throw validation error for invalid group_date', () => {
      expect(() => {
        albumManager.createAlbum({
          name: 'Test',
          group_date: '2025/06',
          sort_index: 0,
        });
      }).toThrow(ValidationError);
    });

    it('should throw duplicate error for same name in group', () => {
      albumManager.createAlbum({
        name: 'Summer 2025',
        group_date: '2025-06',
        sort_index: 0,
      });

      expect(() => {
        albumManager.createAlbum({
          name: 'Summer 2025',
          group_date: '2025-06',
          sort_index: 1,
        });
      }).toThrow(DuplicateError);
    });

    it('should allow same name in different groups', () => {
      albumManager.createAlbum({
        name: 'Family',
        group_date: '2025-06',
        sort_index: 0,
      });

      const album2 = albumManager.createAlbum({
        name: 'Family',
        group_date: '2025-07',
        sort_index: 0,
      });

      expect(album2).toBeDefined();
      expect(album2.group_date).toBe('2025-07');
    });

    it('should get album by ID', () => {
      const created = albumManager.createAlbum({
        name: 'Test',
        group_date: '2025-06',
        sort_index: 0,
      });

      const retrieved = albumManager.getAlbumById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe('Test');
      expect(retrieved.id).toBe(created.id);
    });

    it('should return null for nonexistent album', () => {
      const album = albumManager.getAlbumById('nonexistent');
      expect(album).toBeNull();
    });

    it('should update album', () => {
      const created = albumManager.createAlbum({
        name: 'Test',
        group_date: '2025-06',
        sort_index: 0,
      });

      const updated = albumManager.updateAlbum(created.id, {
        name: 'Updated',
        sort_index: 5,
      });

      expect(updated.name).toBe('Updated');
      expect(updated.sort_index).toBe(5);
      expect(updated.updated_at).toBeGreaterThan(created.updated_at);
    });

    it('should throw not found error on update', () => {
      expect(() => {
        albumManager.updateAlbum('nonexistent', { name: 'Test' });
      }).toThrow(NotFoundError);
    });

    it('should delete album', () => {
      const created = albumManager.createAlbum({
        name: 'Test',
        group_date: '2025-06',
        sort_index: 0,
      });

      albumManager.deleteAlbum(created.id);
      const retrieved = albumManager.getAlbumById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw not found error on delete', () => {
      expect(() => {
        albumManager.deleteAlbum('nonexistent');
      }).toThrow(NotFoundError);
    });
  });

  describe('Album Organization', () => {
    it('should get all albums', () => {
      albumManager.createAlbum({
        name: 'Album 1',
        group_date: '2025-06',
        sort_index: 0,
      });
      albumManager.createAlbum({
        name: 'Album 2',
        group_date: '2025-07',
        sort_index: 0,
      });

      const albums = albumManager.getAllAlbums();
      expect(albums).toHaveLength(2);
    });

    it('should get albums by group', () => {
      albumManager.createAlbum({
        name: 'Album 1',
        group_date: '2025-06',
        sort_index: 0,
      });
      albumManager.createAlbum({
        name: 'Album 2',
        group_date: '2025-06',
        sort_index: 1,
      });
      albumManager.createAlbum({
        name: 'Album 3',
        group_date: '2025-07',
        sort_index: 0,
      });

      const group = albumManager.getAlbumsByGroup('2025-06');
      expect(group).toHaveLength(2);
      expect(group[0].name).toBe('Album 1');
      expect(group[1].name).toBe('Album 2');
    });

    it('should get groups with counts', () => {
      albumManager.createAlbum({
        name: 'Album 1',
        group_date: '2025-06',
        sort_index: 0,
      });
      albumManager.createAlbum({
        name: 'Album 2',
        group_date: '2025-06',
        sort_index: 1,
      });
      albumManager.createAlbum({
        name: 'Album 3',
        group_date: '2025-07',
        sort_index: 0,
      });

      const groups = albumManager.getGroups();
      expect(groups).toHaveLength(2);
      expect(groups[0].count).toBe(2);
      expect(groups[1].count).toBe(1);
    });

    it('should reorder albums within group', () => {
      const a1 = albumManager.createAlbum({
        name: 'Album 1',
        group_date: '2025-06',
        sort_index: 0,
      });
      const a2 = albumManager.createAlbum({
        name: 'Album 2',
        group_date: '2025-06',
        sort_index: 1,
      });

      const reordered = albumManager.reorderAlbumsInGroup('2025-06', [a2.id, a1.id]);
      expect(reordered[0].id).toBe(a2.id);
      expect(reordered[0].sort_index).toBe(0);
      expect(reordered[1].id).toBe(a1.id);
      expect(reordered[1].sort_index).toBe(1);
    });

    it('should move album to different group', () => {
      const album = albumManager.createAlbum({
        name: 'Test',
        group_date: '2025-06',
        sort_index: 0,
      });

      const moved = albumManager.moveAlbumToGroup(album.id, '2025-07');
      expect(moved.group_date).toBe('2025-07');
    });

    it('should get album with photo count', () => {
      const album = albumManager.createAlbum({
        name: 'Test',
        group_date: '2025-06',
        sort_index: 0,
      });

      const withCount = albumManager.getAlbumWithPhotoCount(album.id);
      expect(withCount.photo_count).toBe(0);
    });
  });
});

describe('PhotoManager', () => {
  let db;
  let albumManager;
  let photoManager;
  let testAlbumId;

  beforeEach(async () => {
    db = await createDatabase();
    albumManager = new AlbumManager(db);
    photoManager = new PhotoManager(db);

    const album = albumManager.createAlbum({
      name: 'Test Album',
      group_date: '2025-06',
      sort_index: 0,
    });
    testAlbumId = album.id;
  });

  afterEach(async () => {
    if (db) await db.close();
  });

  describe('Photo CRUD', () => {
    it('should create photo with valid data', () => {
      const photo = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        width: 1920,
        height: 1080,
        sort_index: 0,
      });

      expect(photo).toBeDefined();
      expect(photo.id).toBeDefined();
      expect(photo.filename).toBe('photo.jpg');
      expect(photo.width).toBe(1920);
      expect(photo.created_at).toBeDefined();
    });

    it('should throw validation error for invalid file_size', () => {
      expect(() => {
        photoManager.createPhoto({
          album_id: testAlbumId,
          filename: 'photo.jpg',
          file_size: -100,
          mime_type: 'image/jpeg',
          sort_index: 0,
        });
      }).toThrow(ValidationError);
    });

    it('should throw duplicate error for same filename in album', () => {
      photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });

      expect(() => {
        photoManager.createPhoto({
          album_id: testAlbumId,
          filename: 'photo.jpg',
          file_size: 2048,
          mime_type: 'image/jpeg',
          sort_index: 1,
        });
      }).toThrow(DuplicateError);
    });

    it('should get photo by ID', () => {
      const created = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });

      const retrieved = photoManager.getPhotoById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.filename).toBe('photo.jpg');
    });

    it('should update photo', () => {
      const created = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });

      const updated = photoManager.updatePhoto(created.id, {
        sort_index: 5,
      });

      expect(updated.sort_index).toBe(5);
    });

    it('should delete photo', () => {
      const created = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });

      photoManager.deletePhoto(created.id);
      const retrieved = photoManager.getPhotoById(created.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Photo Organization', () => {
    it('should get photos by album', () => {
      photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });
      photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo2.jpg',
        file_size: 2048,
        mime_type: 'image/jpeg',
        sort_index: 1,
      });

      const photos = photoManager.getPhotosByAlbum(testAlbumId);
      expect(photos).toHaveLength(2);
      expect(photos[0].filename).toBe('photo1.jpg');
    });

    it('should reorder photos within album', () => {
      const p1 = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });
      const p2 = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo2.jpg',
        file_size: 2048,
        mime_type: 'image/jpeg',
        sort_index: 1,
      });

      const reordered = photoManager.reorderPhotosInAlbum(testAlbumId, [p2.id, p1.id]);
      expect(reordered[0].id).toBe(p2.id);
      expect(reordered[0].sort_index).toBe(0);
    });

    it('should move photo to different album', () => {
      const album2 = albumManager.createAlbum({
        name: 'Album 2',
        group_date: '2025-07',
        sort_index: 0,
      });

      const photo = photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        sort_index: 0,
      });

      const moved = photoManager.movePhotoToAlbum(photo.id, album2.id);
      expect(moved.album_id).toBe(album2.id);
    });

    it('should get photo stats for album', () => {
      photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        width: 1920,
        height: 1080,
        sort_index: 0,
      });
      photoManager.createPhoto({
        album_id: testAlbumId,
        filename: 'photo2.jpg',
        file_size: 2048,
        mime_type: 'image/jpeg',
        width: 3840,
        height: 2160,
        sort_index: 1,
      });

      const stats = photoManager.getPhotoStats(testAlbumId);
      expect(stats.count).toBe(2);
      expect(stats.total_size).toBe(3072);
      expect(stats.avg_width).toBe(2880);
      expect(stats.avg_height).toBe(1620);
    });
  });

  describe('Thumbnail Generation', () => {
    it('should generate thumbnail from data URL', async () => {
      // Create a simple 1x1 pixel PNG data URL
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const thumbnail = await photoManager.generateThumbnail(dataUrl);
      expect(thumbnail).toBeDefined();
      expect(thumbnail.startsWith('data:image')).toBe(true);
    });
  });

  describe('Image Metadata', () => {
    it('should extract image metadata from file', async () => {
      // Create a mock File object
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

      const metadata = await photoManager.extractImageMetadata(file);
      expect(metadata).toBeDefined();
      expect(metadata.file_size).toBe(blob.size);
      expect(metadata.mime_type).toBe('image/jpeg');
    });
  });
});
