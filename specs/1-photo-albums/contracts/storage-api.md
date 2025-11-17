# Storage API Contract: Photo Album Organizer

**Date**: 2025-11-17  
**Feature**: Photo Album Organizer (`1-photo-albums`)  
**Module**: `lib/storage.js`  

---

## Overview

The Storage API is the abstraction layer between the application and SQLite database. It provides CRUD operations for Albums, Photos, and album reordering, with error handling and transaction support.

All operations are async (return Promises) to accommodate future backend migrations or IndexedDB async operations.

---

## Core Types

### Album

```javascript
/**
 * @typedef {Object} Album
 * @property {number} album_id - Unique album identifier
 * @property {string} date_created - ISO date (YYYY-MM-DD)
 * @property {number} photo_count - Count of photos in album
 * @property {number} [cover_photo_id] - ID of cover photo (nullable)
 * @property {number} display_order - Display position (1-based)
 * @property {boolean} is_undated - TRUE if "Undated" album
 * @property {string} last_modified_date - ISO timestamp
 */
```

### Photo

```javascript
/**
 * @typedef {Object} Photo
 * @property {number} photo_id - Unique photo identifier
 * @property {number} album_id - Parent album ID
 * @property {string} file_name - Original filename
 * @property {string} file_path - File URL/path for re-opening
 * @property {number} file_size - Size in bytes
 * @property {string} [date_taken] - ISO datetime (nullable)
 * @property {string} upload_date - ISO timestamp
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {Blob} thumbnail_data - JPEG thumbnail
 * @property {number} thumbnail_width - Thumbnail width
 * @property {number} thumbnail_height - Thumbnail height
 * @property {string} mime_type - MIME type
 * @property {Object} metadata - JSON metadata (EXIF, etc.)
 */
```

### AlbumOrganization

```javascript
/**
 * @typedef {Object} AlbumOrganization
 * @property {number} org_id - Unique record identifier
 * @property {number} album_id - Album being reordered
 * @property {number} position - New display position
 * @property {string} last_updated - ISO timestamp
 */
```

---

## Initialization

### `initialize()`

Initialize storage, load or create database.

**Signature**:
```javascript
async initialize(): Promise<void>
```

**Behavior**:
- Load database from IndexedDB, or create new if not found
- Run schema migrations if needed
- Validate database integrity

**Returns**: Nothing; resolves if successful

**Throws**: 
- `StorageError` if database corrupt or IDB unavailable

**Example**:
```javascript
await storage.initialize();
```

---

## Album Operations

### `getAlbums()`

Fetch all albums in display order.

**Signature**:
```javascript
async getAlbums(): Promise<Album[]>
```

**Behavior**:
- Query: `SELECT * FROM albums ORDER BY display_order ASC`
- Include "Undated" album at end

**Returns**: Array of Album objects, ordered for display

**Performance**: <10ms for 1000 albums

**Example**:
```javascript
const albums = await storage.getAlbums();
// [
//   { album_id: 1, date_created: "2025-11-17", photo_count: 5, display_order: 1, is_undated: false, ... },
//   { album_id: 2, date_created: "2025-11-16", photo_count: 3, display_order: 2, is_undated: false, ... },
//   { album_id: 100, date_created: null, photo_count: 2, display_order: 999, is_undated: true, ... },
// ]
```

### `getAlbum(albumId)`

Fetch a single album by ID.

**Signature**:
```javascript
async getAlbum(albumId: number): Promise<Album | null>
```

**Parameters**:
- `albumId` (number): Album ID

**Returns**: Album object or `null` if not found

**Example**:
```javascript
const album = await storage.getAlbum(1);
```

### `createAlbum(dateTaken, isUndated)`

Create a new album.

**Signature**:
```javascript
async createAlbum(dateTaken: string, isUndated?: boolean): Promise<Album>
```

**Parameters**:
- `dateTaken` (string): ISO date (YYYY-MM-DD)
- `isUndated` (boolean, optional): TRUE for "Undated" album; default FALSE

**Validation**:
- `dateTaken` must be valid ISO date or null
- If `isUndated` TRUE, `dateTaken` ignored

**Returns**: Created Album object with assigned album_id

**Behavior**:
- Assign `display_order` = max(display_order) + 1
- Set `photo_count` to 0
- Set `last_modified_date` to now

**Throws**:
- `ValidationError` if date invalid
- `DuplicateError` if album with same date already exists (and not undated)

**Example**:
```javascript
const album = await storage.createAlbum("2025-11-17", false);
// { album_id: 1, date_created: "2025-11-17", photo_count: 0, display_order: 1, ... }

const undatedAlbum = await storage.createAlbum(null, true);
// { album_id: 100, date_created: null, photo_count: 0, display_order: 999, is_undated: true, ... }
```

### `updateAlbumPhotoCount(albumId, delta)`

Increment/decrement album photo count.

**Signature**:
```javascript
async updateAlbumPhotoCount(albumId: number, delta: number): Promise<Album>
```

**Parameters**:
- `albumId` (number): Album ID
- `delta` (number): Change (+1 on insert, -1 on delete)

**Returns**: Updated Album object

**Behavior**:
- `photo_count` += delta
- `last_modified_date` = now
- Clamp to 0 if result negative

**Example**:
```javascript
await storage.updateAlbumPhotoCount(1, 1); // Add photo
await storage.updateAlbumPhotoCount(1, -1); // Remove photo
```

### `deleteAlbum(albumId)`

Delete an album (if empty).

**Signature**:
```javascript
async deleteAlbum(albumId: number): Promise<void>
```

**Parameters**:
- `albumId` (number): Album ID

**Validation**:
- Album must have photo_count = 0 (reject deletion of non-empty albums)
- Cannot delete "Undated" album if it has photos

**Throws**:
- `ValidationError` if album not empty
- `NotFoundError` if album not found

**Behavior**:
- Delete album record
- Cascade delete album_organization record if exists

**Example**:
```javascript
await storage.deleteAlbum(1); // OK if empty
```

---

## Photo Operations

### `getPhotosByAlbum(albumId)`

Fetch all photos in an album.

**Signature**:
```javascript
async getPhotosByAlbum(albumId: number): Promise<Photo[]>
```

**Parameters**:
- `albumId` (number): Album ID

**Returns**: Array of Photo objects (insertion order)

**Performance**: <50ms for 1000 photos per album

**Example**:
```javascript
const photos = await storage.getPhotosByAlbum(1);
// [
//   { photo_id: 1, album_id: 1, file_name: "DSC_0001.jpg", ... },
//   { photo_id: 2, album_id: 1, file_name: "DSC_0002.jpg", ... },
// ]
```

### `getPhoto(photoId)`

Fetch a single photo by ID.

**Signature**:
```javascript
async getPhoto(photoId: number): Promise<Photo | null>
```

**Parameters**:
- `photoId` (number): Photo ID

**Returns**: Photo object or `null` if not found

### `createPhoto(albumId, fileData, thumbnail)`

Add a photo to an album.

**Signature**:
```javascript
async createPhoto(
  albumId: number,
  fileData: { name, path, size, width, height, dateTaken?, mimeType?, metadata? },
  thumbnail: { data: Blob, width, height }
): Promise<Photo>
```

**Parameters**:
- `albumId` (number): Target album ID
- `fileData` (object):
  - `name` (string): Filename
  - `path` (string): File URL/path
  - `size` (number): File size in bytes
  - `width`, `height` (number): Image dimensions
  - `dateTaken` (string, optional): ISO datetime or null
  - `mimeType` (string, optional): Default "image/jpeg"
  - `metadata` (object, optional): JSON metadata
- `thumbnail` (object):
  - `data` (Blob): JPEG thumbnail
  - `width`, `height` (number): Thumbnail dimensions

**Returns**: Created Photo object with assigned photo_id

**Behavior**:
- Insert photo record
- Update album.photo_count += 1
- Update album.cover_photo_id if first photo
- Set upload_date to now

**Validation**:
- `albumId` must reference valid album
- `width`, `height` > 0 and <=12000
- `file_size` > 0
- Thumbnail must be valid Blob

**Throws**:
- `ValidationError` if invalid parameters
- `NotFoundError` if album not found

**Example**:
```javascript
const photo = await storage.createPhoto(1, {
  name: "DSC_0001.jpg",
  path: "file:///path/to/DSC_0001.jpg",
  size: 2500000,
  width: 5000,
  height: 3333,
  dateTaken: "2025-11-17T14:32:00",
  mimeType: "image/jpeg",
  metadata: { exif: { Make: "Canon" } }
}, {
  data: jpegBlob,
  width: 200,
  height: 133
});
```

### `deletePhoto(photoId)`

Remove a photo from album.

**Signature**:
```javascript
async deletePhoto(photoId: number): Promise<void>
```

**Parameters**:
- `photoId` (number): Photo ID

**Returns**: Nothing; resolves if successful

**Behavior**:
- Delete photo record
- Update parent album.photo_count -= 1
- If album now empty (photo_count = 0), delete album
- Update album.cover_photo_id if deleted photo was cover

**Throws**:
- `NotFoundError` if photo not found

**Example**:
```javascript
await storage.deletePhoto(1);
```

---

## Album Reordering Operations

### `setAlbumOrder(albumId, newPosition)`

Reorder an album after user drag-and-drop.

**Signature**:
```javascript
async setAlbumOrder(albumId: number, newPosition: number): Promise<Album>
```

**Parameters**:
- `albumId` (number): Album being moved
- `newPosition` (number): New display position (1-based)

**Validation**:
- `albumId` must reference valid album
- `newPosition` must be valid (>= 1, <= total album count)
- Cannot reorder "Undated" album (pinned at end)

**Behavior**:
- Transaction:
  - Update album.display_order to newPosition
  - Insert/update album_organization record
  - Recompact display_order values across all albums (maintain 1...n sequence)
- Persist to IndexedDB

**Throws**:
- `ValidationError` if album is "Undated" or position invalid
- `NotFoundError` if album not found

**Example**:
```javascript
await storage.setAlbumOrder(2, 1); // Move album 2 to position 1
// Result: Albums reordered, album_organization record created/updated
```

### `getAlbumOrganization(albumId)`

Check if album has manual reorder record.

**Signature**:
```javascript
async getAlbumOrganization(albumId: number): Promise<AlbumOrganization | null>
```

**Returns**: AlbumOrganization object or `null` if not reordered

### `resetAlbumOrder()`

Reset all albums to date-based order (hypothetical future feature).

**Signature**:
```javascript
async resetAlbumOrder(): Promise<void>
```

**Behavior**:
- Delete all album_organization records
- Recalculate albums.display_order by date_created DESC
- Persist

**Example**:
```javascript
await storage.resetAlbumOrder();
```

---

## Transaction & Persistence

### `persistToStorage()`

Manually save database to IndexedDB.

**Signature**:
```javascript
async persistToStorage(): Promise<void>
```

**Behavior**:
- Export sql.js database
- Write to IndexedDB key "photo_db"
- Atomic operation (all-or-nothing)

**Returns**: Nothing; resolves if successful

**Throws**:
- `StorageError` if IDB write fails

**Usage**: Called automatically on mutations; can be called manually for force-save

**Example**:
```javascript
await storage.persistToStorage();
```

### `transaction(callback)`

Execute operations within a database transaction.

**Signature**:
```javascript
async transaction<T>(callback: (db: Database) => T): Promise<T>
```

**Parameters**:
- `callback` (function): Function receiving sql.js Database instance

**Returns**: Result of callback

**Behavior**:
- BEGIN TRANSACTION
- Execute callback
- COMMIT on success; ROLLBACK on error
- Auto-persist after commit

**Example**:
```javascript
await storage.transaction((db) => {
  db.run("UPDATE albums SET display_order = 1 WHERE album_id = 1");
  db.run("UPDATE albums SET display_order = 2 WHERE album_id = 2");
});
```

---

## Error Handling

### Error Types

```javascript
class StorageError extends Error { } // General storage failure
class ValidationError extends StorageError { } // Invalid input
class NotFoundError extends StorageError { } // Record not found
class DuplicateError extends StorageError { } // Unique constraint violation
```

**Example**:
```javascript
try {
  await storage.createAlbum("invalid-date");
} catch (err) {
  if (err instanceof ValidationError) {
    console.error("Invalid date format");
  }
}
```

---

## Implementation Notes

- All operations use prepared statements (prevent SQL injection)
- Indexes optimized for common queries (album list, photo access, date ranges)
- Denormalized fields (e.g., photo_count) must be kept in sync via app logic
- Thumbnail BLOBs stored in database; exported as base64 in JSON backups

---

## Test Coverage

Contract tests verify:
- ✅ CRUD operations return correct types
- ✅ Input validation catches errors
- ✅ Transactions maintain consistency
- ✅ Cascade deletes work correctly
- ✅ Queries return expected data
- ✅ Persistence survives page reload
