/**
 * CUSTOM ERROR CLASSES FOR STORAGE LAYER
 * Defines domain-specific errors for database operations
 */

/**
 * Base error class for storage operations
 * @class StorageError
 * @extends Error
 */
class StorageError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code for categorization
   * @param {*} details - Additional error details
   */
  constructor(message, code = 'STORAGE_ERROR', details = null) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error thrown when validation fails
 * @class ValidationError
 * @extends StorageError
 */
class ValidationError extends StorageError {
  /**
   * @param {string} message - Error message
   * @param {*} details - Validation details (field, value, etc.)
   */
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a record is not found
 * @class NotFoundError
 * @extends StorageError
 */
class NotFoundError extends StorageError {
  /**
   * @param {string} message - Error message
   * @param {*} details - Details about the missing record
   */
  constructor(message, details = null) {
    super(message, 'NOT_FOUND_ERROR', details);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when a duplicate record is encountered
 * @class DuplicateError
 * @extends StorageError
 */
class DuplicateError extends StorageError {
  /**
   * @param {string} message - Error message
   * @param {*} details - Details about the duplicate
   */
  constructor(message, details = null) {
    super(message, 'DUPLICATE_ERROR', details);
    this.name = 'DuplicateError';
  }
}

/**
 * Error thrown when a transaction fails
 * @class TransactionError
 * @extends StorageError
 */
class TransactionError extends StorageError {
  /**
   * @param {string} message - Error message
   * @param {*} details - Transaction error details
   */
  constructor(message, details = null) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

/**
 * Error thrown when IndexedDB operations fail
 * @class IndexedDBError
 * @extends StorageError
 */
class IndexedDBError extends StorageError {
  /**
   * @param {string} message - Error message
   * @param {*} details - IndexedDB error details
   */
  constructor(message, details = null) {
    super(message, 'INDEXEDDB_ERROR', details);
    this.name = 'IndexedDBError';
  }
}

export {
  StorageError,
  ValidationError,
  NotFoundError,
  DuplicateError,
  TransactionError,
  IndexedDBError,
};
