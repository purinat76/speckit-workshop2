/* eslint-disable no-undef */
/* eslint-disable jsdoc/check-types */
/**
 * STORAGE LAYER - SQLite Database Wrapper
 * Provides SQLite database management using sql.js with IndexedDB persistence
 *
 * Architecture:
 * - sql.js provides in-memory SQLite database
 * - IndexedDB provides browser-based persistence
 * - All operations are synchronous after DB initialization
 * - ACID transactions supported via SQL BEGIN/COMMIT/ROLLBACK
 */

// @ts-expect-error - sql.js types not available in strict mode
import initSqlJs from 'sql.js';
import {
  TransactionError,
  IndexedDBError,
  StorageError,
} from './errors.js';

const INDEXEDDB_NAME = 'photo-album-organizer';
const INDEXEDDB_STORE = 'database';
const INDEXEDDB_KEY = 'db';

/**
 * Database class - Manages SQLite database lifecycle and operations
 * @class Database
 */
class Database {
  /**
   * @param {any} sqlJs - sql.js module instance
   * @param {any} db - sql.js Database instance (in-memory)
   */
  constructor(sqlJs, db) {
    this.sqlJs = sqlJs;
    this.db = db;
    this.initialized = false;
    this.inTransaction = false;
  }

  /**
   * Initialize database: create schema if not exists
   * @async
   * @returns {Promise<void>}
   * @throws {StorageError} If schema creation fails
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Load existing database from IndexedDB if available
      await this.loadFromIndexedDB();

      // Create schema if tables don't exist
      this.createSchema();

      this.initialized = true;
    } catch (/** @type {any} */ error) {
      throw new StorageError(
        `Failed to initialize database: ${error?.message || 'Unknown error'}`,
        'INIT_ERROR',
        { cause: error }
      );
    }
  }

  /**
   * Create database schema with all required tables
   * Called during initialization; idempotent (uses CREATE TABLE IF NOT EXISTS)
   * @private
   * @returns {void}
   */
  createSchema() {
    // Albums table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        group_date TEXT NOT NULL,
        sort_index INTEGER NOT NULL DEFAULT 0,
        metadata TEXT
      )
    `);

    // Photos table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        album_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        sort_index INTEGER NOT NULL DEFAULT 0,
        metadata TEXT,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
      )
    `);

    // Album organization table (stores album grouping and ordering)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS album_organization (
        id TEXT PRIMARY KEY,
        groups TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT
      )
    `);

    // Create indexes for performance
    this.db.run('CREATE INDEX IF NOT EXISTS idx_albums_group_date ON albums(group_date)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_albums_sort_index ON albums(sort_index)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_photos_sort_index ON photos(sort_index)');
  }

  /**
   * Begin a transaction
   * @throws {TransactionError} If transaction is already active
   * @returns {void}
   */
  begin() {
    if (this.inTransaction) {
      throw new TransactionError('Transaction already in progress');
    }
    this.db.run('BEGIN TRANSACTION');
    this.inTransaction = true;
  }

  /**
   * Commit current transaction
   * @throws {TransactionError} If no transaction is active
   * @returns {void}
   */
  commit() {
    if (!this.inTransaction) {
      throw new TransactionError('No transaction in progress');
    }
    this.db.run('COMMIT');
    this.inTransaction = false;
  }

  /**
   * Rollback current transaction
   * @throws {TransactionError} If no transaction is active
   * @returns {void}
   */
  rollback() {
    if (!this.inTransaction) {
      throw new TransactionError('No transaction in progress');
    }
    this.db.run('ROLLBACK');
    this.inTransaction = false;
  }

  /**
   * Execute a raw SQL query and return results
   * @param {string} sql - SQL query string
   * @param {any[]} params - Query parameters
   * @returns {any[]} Array of result rows
   * @throws {StorageError} If query execution fails
   */
  query(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results = [];

      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }

      stmt.free();
      return results;
    } catch (/** @type {any} */ error) {
      throw new StorageError(
        `Query failed: ${error?.message || 'Unknown error'}`,
        'QUERY_ERROR',
        { sql, params, cause: error }
      );
    }
  }

  /**
   * Execute a raw SQL statement (INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL statement
   * @param {any[]} params - Statement parameters
   * @returns {number} Number of affected rows
   * @throws {StorageError} If execution fails
   */
  exec(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      const changes = this.db.getRowsModified();
      stmt.free();
      return changes;
    } catch (/** @type {any} */ error) {
      throw new StorageError(
        `Execution failed: ${error?.message || 'Unknown error'}`,
        'EXEC_ERROR',
        { sql, params, cause: error }
      );
    }
  }

  /**
   * Get single row by ID
   * @param {string} table - Table name
   * @param {string} id - Row ID
   * @returns {any|null} Row object or null if not found
   */
  getById(table, id) {
    const result = this.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all rows from table
   * @param {string} table - Table name
   * @param {string|null} orderBy - Optional ORDER BY clause (e.g., "sort_index ASC")
   * @returns {any[]} Array of rows
   */
  getAll(table, orderBy = null) {
    const sql = `SELECT * FROM ${table}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
    return this.query(sql);
  }

  /**
   * Save database to IndexedDB for persistence
   * @async
   * @returns {Promise<void>}
   * @throws {IndexedDBError} If save fails
   */
  async saveToIndexedDB() {
    try {
      const data = this.db.export();
      // In browser environment, use Uint8Array directly instead of Buffer.from
      const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);

      /** @type {Promise<void>} */
      const request = new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(INDEXEDDB_NAME, 1);

        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction(INDEXEDDB_STORE, 'readwrite');
          const store = transaction.objectStore(INDEXEDDB_STORE);
          const putRequest = store.put(buffer, INDEXEDDB_KEY);

          putRequest.onerror = () => reject(putRequest.error);
          transaction.oncomplete = () => {
            resolve();
          };
        };

        openRequest.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(INDEXEDDB_STORE)) {
            db.createObjectStore(INDEXEDDB_STORE);
          }
        };
      });

      await request;
    } catch (/** @type {any} */ error) {
      throw new IndexedDBError(
        `Failed to save database to IndexedDB: ${error?.message || 'Unknown error'}`,
        { cause: error }
      );
    }
  }

  /**
   * Load database from IndexedDB
   * @async
   * @private
   * @returns {Promise<void>}
   */
  async loadFromIndexedDB() {
    try {
      /** @type {Promise<any>} */
      const buffer = await new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(INDEXEDDB_NAME, 1);

        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction(INDEXEDDB_STORE, 'readonly');
          const store = transaction.objectStore(INDEXEDDB_STORE);
          const getRequest = store.get(INDEXEDDB_KEY);

          getRequest.onerror = () => reject(getRequest.error);
          getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
          };
        };

        openRequest.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(INDEXEDDB_STORE)) {
            db.createObjectStore(INDEXEDDB_STORE);
          }
        };
      });

      if (buffer) {
        const data = new Uint8Array(buffer);
        this.db = new this.sqlJs.Database(data);
      }
    } catch (/** @type {any} */ error) {
      // Silently continue if IndexedDB is empty (first run)
      // or if there's an error loading (DB corruption - start fresh)
      console.warn('Could not load database from IndexedDB:', error?.message);
    }
  }

  /**
   * Export database for backup/debugging
   * @returns {Uint8Array} Database binary data
   */
  export() {
    return this.db.export();
  }

  /**
   * Get database statistics
   * @returns {object} Stats object with table counts
   */
  getStats() {
    const albumCount = this.query('SELECT COUNT(*) as count FROM albums')[0].count;
    const photoCount = this.query('SELECT COUNT(*) as count FROM photos')[0].count;

    return {
      albumCount,
      photoCount,
      totalRecords: albumCount + photoCount,
    };
  }

  /**
   * Close database connection
   * Saves to IndexedDB before closing
   * @async
   * @returns {Promise<void>}
   */
  async close() {
    if (this.initialized) {
      await this.saveToIndexedDB();
      this.initialized = false;
    }
  }
}

/**
 * Factory function to create and initialize a Database instance
 * @async
 * @returns {Promise<Database>} Initialized Database instance
 * @throws {StorageError} If initialization fails
 */
export async function createDatabase() {
  try {
    const SQL = await initSqlJs();
    const sqlDb = new SQL.Database();
    const db = new Database(SQL, sqlDb);
    await db.initialize();
    return db;
  } catch (/** @type {any} */ error) {
    throw new StorageError(
      `Failed to create database: ${error?.message || 'Unknown error'}`,
      'CREATE_ERROR',
      { cause: error }
    );
  }
}

export { Database };
