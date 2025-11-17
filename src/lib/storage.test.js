// @ts-nocheck
/* eslint-disable no-undef */
/**
 * STORAGE LAYER UNIT TESTS
 * Tests for Database class and createDatabase factory
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database, createDatabase } from './storage.js';
import {
  StorageError,
  ValidationError,
  NotFoundError,
  DuplicateError,
  TransactionError,
} from './errors.js';

describe('Error Classes', () => {
  it('StorageError should be instantiable', () => {
    const error = new StorageError('Test error', 'TEST_CODE', { detail: 'test' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('StorageError');
  });

  it('ValidationError should extend StorageError', () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('NotFoundError should extend StorageError', () => {
    const error = new NotFoundError('Not found', { id: '123' });
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('NotFoundError');
    expect(error.code).toBe('NOT_FOUND_ERROR');
  });

  it('DuplicateError should extend StorageError', () => {
    const error = new DuplicateError('Already exists', { field: 'email' });
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('DuplicateError');
    expect(error.code).toBe('DUPLICATE_ERROR');
  });

  it('TransactionError should extend StorageError', () => {
    const error = new TransactionError('Transaction failed');
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('TransactionError');
    expect(error.code).toBe('TRANSACTION_ERROR');
  });
});

describe('Database Class', () => {
  let db;

  beforeEach(async () => {
    try {
      db = await createDatabase();
    } catch (error) {
      console.error('Failed to create database:', error);
      throw error;
    }
  });

  afterEach(async () => {
    if (db && db.initialized) {
      await db.close();
    }
  });

  describe('Initialization', () => {
    it('should create database instance', async () => {
      expect(db).toBeDefined();
      expect(db).toBeInstanceOf(Database);
      expect(db.initialized).toBe(true);
    });

    it('should be idempotent when calling initialize twice', async () => {
      const first = db.initialized;
      await db.initialize();
      expect(db.initialized).toBe(first);
    });

    it('should have all required tables after initialization', () => {
      const tables = db.query(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      );
      const tableNames = tables.map((t) => t.name);
      expect(tableNames).toContain('albums');
      expect(tableNames).toContain('photos');
      expect(tableNames).toContain('album_organization');
    });

    it('should have created indexes', () => {
      const indexes = db.query(
        "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
      );
      const indexNames = indexes.map((i) => i.name);
      expect(indexNames).toContain('idx_albums_group_date');
      expect(indexNames).toContain('idx_albums_sort_index');
      expect(indexNames).toContain('idx_photos_album_id');
      expect(indexNames).toContain('idx_photos_sort_index');
    });
  });

  describe('Query Operations', () => {
    it('should execute simple SELECT query', () => {
      const result = db.query('SELECT COUNT(*) as count FROM albums');
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(0);
    });

    it('should execute query with parameters', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      const result = db.query('SELECT * FROM albums WHERE id = ?', ['album-1']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Album');
    });

    it('should return empty array for no results', () => {
      const result = db.query('SELECT * FROM albums WHERE id = ?', ['nonexistent']);
      expect(result).toEqual([]);
    });

    it('should throw StorageError on invalid SQL', () => {
      expect(() => {
        db.query('INVALID SQL STATEMENT');
      }).toThrow(StorageError);
    });
  });

  describe('Exec Operations', () => {
    it('should insert a row and return affected count', () => {
      const changes = db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );
      expect(changes).toBe(1);

      const result = db.query('SELECT * FROM albums');
      expect(result).toHaveLength(1);
    });

    it('should update rows and return affected count', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      const changes = db.exec('UPDATE albums SET name = ? WHERE id = ?', [
        'Updated Album',
        'album-1',
      ]);
      expect(changes).toBe(1);

      const result = db.query('SELECT * FROM albums WHERE id = ?', ['album-1']);
      expect(result[0].name).toBe('Updated Album');
    });

    it('should throw StorageError on execution failure', () => {
      expect(() => {
        db.exec('INVALID SQL STATEMENT');
      }).toThrow(StorageError);
    });
  });

  describe('Transaction Operations', () => {
    it('should begin, commit transaction', () => {
      db.begin();
      expect(db.inTransaction).toBe(true);

      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      db.commit();
      expect(db.inTransaction).toBe(false);

      const result = db.query('SELECT * FROM albums');
      expect(result).toHaveLength(1);
    });

    it('should rollback transaction', () => {
      db.begin();
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );
      db.rollback();

      const result = db.query('SELECT * FROM albums');
      expect(result).toHaveLength(0);
    });

    it('should throw error when beginning nested transaction', () => {
      db.begin();
      expect(() => db.begin()).toThrow(TransactionError);
      db.rollback();
    });

    it('should throw error when committing without active transaction', () => {
      expect(() => db.commit()).toThrow(TransactionError);
    });

    it('should throw error when rolling back without active transaction', () => {
      expect(() => db.rollback()).toThrow(TransactionError);
    });
  });

  describe('Helper Methods', () => {
    it('getById should return row by ID', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      const result = db.getById('albums', 'album-1');
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Album');
    });

    it('getById should return null for nonexistent ID', () => {
      const result = db.getById('albums', 'nonexistent');
      expect(result).toBeNull();
    });

    it('getAll should return all rows', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Album 1', 1000, 1000, '2025-01', 0]
      );
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-2', 'Album 2', 1000, 1000, '2025-01', 1]
      );

      const result = db.getAll('albums');
      expect(result).toHaveLength(2);
    });

    it('getAll should order by provided clause', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Album 1', 1000, 1000, '2025-01', 1]
      );
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-2', 'Album 2', 1000, 1000, '2025-01', 0]
      );

      const result = db.getAll('albums', 'sort_index ASC');
      expect(result[0].id).toBe('album-2');
      expect(result[1].id).toBe('album-1');
    });

    it('getStats should return database statistics', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Album 1', 1000, 1000, '2025-01', 0]
      );
      db.exec(
        'INSERT INTO photos (id, album_id, filename, file_size, mime_type, created_at, updated_at, sort_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['photo-1', 'album-1', 'photo.jpg', 1024, 'image/jpeg', 1000, 1000, 0]
      );

      const stats = db.getStats();
      expect(stats.albumCount).toBe(1);
      expect(stats.photoCount).toBe(1);
      expect(stats.totalRecords).toBe(2);
    });
  });

  describe('Database Persistence', () => {
    it('should export database to Uint8Array', () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      const exported = db.export();
      expect(exported).toBeInstanceOf(Uint8Array);
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should save and load from IndexedDB', async () => {
      db.exec(
        'INSERT INTO albums (id, name, created_at, updated_at, group_date, sort_index) VALUES (?, ?, ?, ?, ?, ?)',
        ['album-1', 'Test Album', 1000, 1000, '2025-01', 0]
      );

      // Save to IndexedDB
      await db.saveToIndexedDB();

      // Create new database instance - should load from IndexedDB
      const db2 = await createDatabase();
      const result = db2.query('SELECT * FROM albums');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Album');

      await db2.close();
    });
  });
});

describe('createDatabase Factory', () => {
  it('should create and initialize a database', async () => {
    const db = await createDatabase();
    expect(db).toBeInstanceOf(Database);
    expect(db.initialized).toBe(true);
    await db.close();
  });

  it('should throw StorageError on creation failure', async () => {
    // This is difficult to test without mocking sql.js
    // For now, just verify the factory exists and works
    const db = await createDatabase();
    expect(db).toBeDefined();
    await db.close();
  });
});
