# Data Model: Photo Album Organizer

**Date**: 2025-11-17  
**Feature**: Photo Album Organizer (`1-photo-albums`)  
**Storage**: SQLite (via sql.js) with IndexedDB persistence  

---

## Overview

The data model defines three core entities: **Album**, **Photo**, and **AlbumOrganization**, stored in SQLite with normalized schema and optimized indexes for fast queries.

- **Albums** are logical groupings of photos by calendar date (e.g., "November 17, 2025")
- **Photos** are individual image metadata records with thumbnails
- **AlbumOrganization** tracks manual drag-and-drop reordering of albums

---

## Entity: Album

**Purpose**: Represents a collection of photos from a specific calendar date, with a user-defined display order.

### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `album_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for album |
| `date_created` | TEXT | NOT NULL, UNIQUE | Calendar day in ISO format: YYYY-MM-DD (e.g., "2025-11-17") |
| `photo_count` | INTEGER | DEFAULT 0 | Denormalized count of photos in album; updated on photo insert/delete |
| `cover_photo_id` | INTEGER | FOREIGN KEY (photos.photo_id) | ID of representative/first photo for album thumbnail |
| `display_order` | INTEGER | UNIQUE, NOT NULL | User-defined display position (1-based); used for drag-drop reordering |
| `is_undated` | BOOLEAN | DEFAULT FALSE | TRUE if album contains photos with invalid/missing dates |
| `last_modified_date` | TEXT | DEFAULT CURRENT_TIMESTAMP | ISO timestamp of last change to album (for sync/caching) |

### Relationships

- **1-to-Many** with Photo: One album contains many photos (photos.album_id → album.album_id)
- **1-to-1** with AlbumOrganization: Each album has one reorder record (optional, only if user-modified)

### Validation Rules

- `date_created` must be valid ISO date (YYYY-MM-DD); no time component
- `date_created` must be unique (one album per calendar day)
- `photo_count` must be ≥0; set to 0 if album has no photos
- `display_order` must be positive integer; no duplicates
- `is_undated` automatically TRUE if album is named "Undated"; FALSE for date-based albums
- `cover_photo_id` can be NULL if album is empty; must point to valid photo_id

### State Transitions

```
1. CREATE: New album created when first photo with date D is added
   - date_created := D
   - photo_count := 1
   - display_order := auto-increment from max(display_order) + 1
   - is_undated := FALSE (unless D is invalid)
   
2. UPDATE: Album modified when photo added/removed or reordered
   - photo_count incremented on photo insert; decremented on delete
   - last_modified_date := CURRENT_TIMESTAMP
   - display_order can be manually set via drag-drop
   
3. DELETE: Album deleted when last photo is removed
   - Cascade delete to album_organization if reorder record exists
```

### Indexes

```sql
CREATE UNIQUE INDEX idx_album_date ON albums(date_created);
CREATE INDEX idx_album_display_order ON albums(display_order);
CREATE INDEX idx_album_undated ON albums(is_undated);
```

---

## Entity: Photo

**Purpose**: Represents individual photo metadata and thumbnails; the core data unit that users interact with.

### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `photo_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for photo |
| `album_id` | INTEGER | FOREIGN KEY (albums.album_id) | Reference to parent album |
| `file_name` | TEXT | NOT NULL | Original filename (e.g., "DSC_0001.jpg") |
| `file_path` | TEXT | NOT NULL | Relative path or file URL (for re-opening file picker) |
| `file_size` | INTEGER | NOT NULL | File size in bytes |
| `date_taken` | TEXT | DEFAULT NULL | Photo capture date in ISO format (YYYY-MM-DD HH:MM:SS); from EXIF or upload time |
| `upload_date` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When photo was imported into app (ISO timestamp) |
| `width` | INTEGER | NOT NULL | Original image width in pixels |
| `height` | INTEGER | NOT NULL | Original image height in pixels |
| `thumbnail_data` | BLOB | NOT NULL | JPEG thumbnail (200x200px max, quality 0.7); base64-encoded string in JSON export |
| `thumbnail_width` | INTEGER | NOT NULL | Thumbnail actual width |
| `thumbnail_height` | INTEGER | NOT NULL | Thumbnail actual height |
| `mime_type` | TEXT | DEFAULT "image/jpeg" | MIME type (image/jpeg, image/png, image/webp) |
| `metadata` | TEXT | DEFAULT "{}" | JSON object: {exif: {...}, other_tags: {...}} |

### Relationships

- **Many-to-1** with Album: Many photos belong to one album

### Validation Rules

- `file_name` must not be empty; must include file extension
- `file_path` must be valid URL or relative path; used to re-open file
- `file_size` > 0
- `date_taken` must be valid ISO datetime or NULL; if NULL, photo assigned to "Undated" album
- `width`, `height` > 0 and reasonable (<=12000px; reject unrealistic dimensions)
- `thumbnail_data` must be valid BLOB (JPEG); not empty
- `thumbnail_width`, `thumbnail_height` must match actual thumbnail dimensions
- `metadata` must be valid JSON; supports arbitrary EXIF fields

### State Transitions

```
1. CREATE: Photo imported/uploaded
   - Read file metadata (EXIF date_taken or use upload_date)
   - Generate thumbnail via Canvas
   - Determine album_id from date_taken (or use "Undated")
   - Insert photo record
   - Update album.photo_count and cover_photo_id
   
2. UPDATE: Photo metadata can be updated (rare; primarily for tagging/notes in future)
   - metadata field can be modified
   - upload_date immutable (creation timestamp)
   
3. DELETE: Photo removed from album
   - Delete photo record
   - Update album.photo_count
   - If album.photo_count == 0, delete album
   - Update cover_photo_id if deleted photo was cover
```

### Indexes

```sql
CREATE INDEX idx_photo_album ON photos(album_id);
CREATE INDEX idx_photo_date_taken ON photos(date_taken);
CREATE INDEX idx_photo_file_name ON photos(file_name);
```

---

## Entity: AlbumOrganization

**Purpose**: Tracks the manually-set display order of albums after user drag-and-drop reordering. Decoupled from Album to support reversions/resets.

### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `org_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for reorder record |
| `album_id` | INTEGER | FOREIGN KEY (albums.album_id), UNIQUE | Reference to album being reordered |
| `position` | INTEGER | NOT NULL | Final display position after drag (1-based) |
| `last_updated` | TEXT | DEFAULT CURRENT_TIMESTAMP | ISO timestamp of reorder operation |

### Relationships

- **1-to-1** with Album: Each album has at most one AlbumOrganization record

### Validation Rules

- `album_id` must reference valid album
- `position` must be positive integer; must not conflict with other positions
- If album is "Undated", it cannot have AlbumOrganization record (always pinned at end)

### State Transitions

```
1. CREATE: User drags album to new position
   - album_id := dragged album's ID
   - position := new display order
   - last_updated := CURRENT_TIMESTAMP
   - Update albums.display_order to match
   
2. UPDATE: User drags same album again (to different position)
   - position := updated position
   - last_updated := CURRENT_TIMESTAMP
   - All albums' display_order recalculated to maintain contiguity
   
3. DELETE: User reverts to date-based order (hypothetical; not in current spec)
   - Delete AlbumOrganization record
   - Recalculate albums.display_order by date_created DESC
```

### Indexes

```sql
CREATE UNIQUE INDEX idx_org_album ON album_organization(album_id);
CREATE INDEX idx_org_position ON album_organization(position);
```

---

## SQLite Schema

```sql
-- Albums table
CREATE TABLE IF NOT EXISTS albums (
  album_id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_created TEXT UNIQUE NOT NULL,
  photo_count INTEGER DEFAULT 0 CHECK (photo_count >= 0),
  cover_photo_id INTEGER REFERENCES photos(photo_id) ON DELETE SET NULL,
  display_order INTEGER UNIQUE NOT NULL,
  is_undated BOOLEAN DEFAULT FALSE,
  last_modified_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL REFERENCES albums(album_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  date_taken TEXT,
  upload_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  width INTEGER NOT NULL CHECK (width > 0 AND width <= 12000),
  height INTEGER NOT NULL CHECK (height > 0 AND height <= 12000),
  thumbnail_data BLOB NOT NULL,
  thumbnail_width INTEGER NOT NULL,
  thumbnail_height INTEGER NOT NULL,
  mime_type TEXT DEFAULT 'image/jpeg',
  metadata TEXT DEFAULT '{}'
);

-- Album organization (reorder tracking)
CREATE TABLE IF NOT EXISTS album_organization (
  org_id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER UNIQUE NOT NULL REFERENCES albums(album_id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_album_date ON albums(date_created);
CREATE INDEX idx_album_display_order ON albums(display_order);
CREATE INDEX idx_album_undated ON albums(is_undated);

CREATE INDEX idx_photo_album ON photos(album_id);
CREATE INDEX idx_photo_date_taken ON photos(date_taken);
CREATE INDEX idx_photo_file_name ON photos(file_name);

CREATE UNIQUE INDEX idx_org_album ON album_organization(album_id);
CREATE INDEX idx_org_position ON album_organization(position);
```

---

## Query Examples

### Get all albums sorted by display order

```sql
SELECT * FROM albums 
ORDER BY display_order ASC;
-- Used for: Main album list view
-- Performance: O(n) but typically <100 albums; instantaneous
```

### Get all photos in album

```sql
SELECT * FROM photos 
WHERE album_id = ? 
ORDER BY rowid ASC; -- preserve insertion order
-- Used for: Album detail view (tile grid)
-- Performance: O(n) per album; index on album_id; <100 photos typical
```

### Get photos from a date range (month view)

```sql
SELECT p.* FROM photos p
JOIN albums a ON p.album_id = a.album_id
WHERE a.date_created BETWEEN ? AND ? 
ORDER BY a.display_order, p.rowid;
-- Used for: Month/year filtering (Phase 2 feature)
-- Performance: <50ms with indexes on albums.date_created and display_order
```

### Get "Undated" album

```sql
SELECT * FROM albums WHERE is_undated = TRUE;
-- Used for: Finding "Undated" album (usually just one)
-- Performance: O(1) with index on is_undated
```

### Update album order after drag-drop

```sql
-- Transaction: reorder two albums
BEGIN TRANSACTION;
  UPDATE albums SET display_order = ? WHERE album_id = ?;
  UPDATE albums SET display_order = ? WHERE album_id = ?;
  INSERT INTO album_organization (album_id, position) 
    VALUES (?, ?) 
    ON CONFLICT(album_id) DO UPDATE SET position = excluded.position;
COMMIT;
-- Used for: Persist drag-drop reordering
-- Performance: <10ms for small album counts
```

### Delete photo and cascade cleanup

```sql
DELETE FROM photos WHERE photo_id = ?;
-- Cascade: album.photo_count decremented by trigger OR app-side logic
-- If album.photo_count == 0: DELETE FROM albums WHERE album_id = ?;
-- Used for: Remove photo; clean up empty albums
-- Performance: <10ms
```

---

## Data Persistence & Serialization

### Persistence Layer (sql.js + IndexedDB)

1. **On App Load**:
   - Fetch database blob from IndexedDB key `"photo_db"`
   - Deserialize with `sql.js.Database(blob)`
   - If not found, create new empty database

2. **On Data Change**:
   - Execute SQL mutations
   - Export database: `db.export()` → Uint8Array
   - Serialize to IndexedDB immediately (atomic write)
   - Prevent data loss if browser crashes

3. **On App Unload** (optional):
   - Force final export to IndexedDB
   - Clear in-memory database

### Export/Import for Backup

- Export: `db.export()` → Blob → download as `.db` file
- Import: File picker → `FileReader` → `Database(new Uint8Array(...))` → restore

### Thumbnail Serialization

- Stored in SQLite BLOB column as binary data
- On render: `BLOB → Blob → ObjectURL → img.src`
- On export: Base64-encoded in JSON export (for manual inspection)

---

## Relationships Diagram

```
┌─────────────────┐
│    Album        │
├─────────────────┤
| album_id (PK)   │◄─┐
| date_created    │  │ 1
| photo_count     │  │
| cover_photo_id  │┐ │
| display_order   │ │ │
| is_undated      │ │ │
| last_modified   │ │ │
└─────────────────┘ │ │
        ▲           │ │
        │ 1         │ │ N
        │           │ └────────┐
        │           │          │
        │      ┌────┴──────────┴─────┐
        │      │                     │
        │  ┌───────────────┐    ┌────────────────┐
        │  │  Photo        │    │ AlbumOrg       │
        │  ├───────────────┤    ├────────────────┤
        └──│ photo_id (PK) │    │ org_id (PK)    │
           │ album_id (FK) │    │ album_id (FK)  │
           │ file_name     │    │ position       │
           │ file_path     │    │ last_updated   │
           │ date_taken    │    └────────────────┘
           │ thumbnail     │
           │ width/height  │
           │ metadata      │
           └───────────────┘

Constraints:
- Album.cover_photo_id → Photo.photo_id (nullable; SET NULL on delete)
- Photo.album_id → Album.album_id (required; CASCADE on delete)
- AlbumOrg.album_id → Album.album_id (unique; CASCADE on delete)
```

---

## Design Decisions & Rationale

### 1. Denormalized `photo_count` in Albums

**Decision**: Store count as column rather than compute on-the-fly.

**Rationale**:
- Album list view queries frequently; computing count = expensive GROUP BY
- Denormalization with triggers/app-side logic updates keeps queries fast
- Tradeoff: minimal consistency risk (user must ensure counts accurate on import)

**Maintenance**: 
- Increments on photo insert; decrements on delete
- Can be recalculated via: `UPDATE albums SET photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = albums.album_id)`

### 2. Separate `AlbumOrganization` Table

**Decision**: Track reorder state separately from album metadata.

**Rationale**:
- Allows "reset to date-based order" in future (delete all AlbumOrganization records)
- Decouples user intent (reorder) from system state (date grouping)
- Simpler queries: "show reordered albums" vs "show all albums in date order"

**Alternative**: Store `display_order` directly in albums table (simpler but less flexible)

### 3. `date_taken` (nullable) + `is_undated` Flag

**Decision**: Allow NULL date_taken; use is_undated flag for "Undated" album.

**Rationale**:
- Photos without EXIF data have NULL date_taken
- "Undated" album is special (pinned at end, not reorderable)
- is_undated flag makes queries efficient (WHERE is_undated = TRUE)

**Alternative**: Always require date; reject photos without dates (bad UX)

### 4. BLOB for Thumbnails

**Decision**: Store JPEG-compressed thumbnail as BLOB in database.

**Rationale**:
- Self-contained database (no external file references)
- Persists with album/photo data (no orphaned files)
- Query return includes thumbnail (no separate image fetch)
- Size manageable: 5-50KB per photo * 10,000 = 50-500MB (within IndexedDB limits)

**Alternative**: Store thumbnails as separate files (requires file system or cloud storage; out of scope)

### 5. Metadata as JSON Text Column

**Decision**: Store EXIF and other metadata as JSON string.

**Rationale**:
- Flexible: supports any EXIF tags without schema changes
- Queryable: can extract specific fields with SQL JSON functions
- Human-readable: easy to inspect and debug

**Example**:
```json
{
  "exif": {
    "Make": "Canon",
    "Model": "EOS 5D Mark IV",
    "DateTimeOriginal": "2025-11-17T14:32:00",
    "FNumber": "2.8",
    "ExposureTime": "1/500"
  },
  "iptc": {
    "Caption": "Fall landscape"
  }
}
```

---

## Performance Characteristics

| Operation | Complexity | Typical Time | Notes |
|-----------|-----------|--------------|-------|
| Load all albums | O(n) | <10ms for 1000 albums | Sorted by display_order |
| Get album photos | O(n) | <50ms for 1000 photos | Single album; index on album_id |
| Drag reorder | O(1) | <10ms | Update 2-3 rows; minimal transaction |
| Insert photo | O(1) | <5ms per photo | Thumbnail generation separate (100ms) |
| Delete photo | O(1) | <5ms | Cascade updates album.photo_count |
| Month view query | O(n) | <50ms | Range query on date_created with index |

---

## Schema Evolution

**Current Version**: 1.0 (2025-11-17)

If future versions require schema changes:
1. Add migration scripts in `migrations/` folder
2. Bump schema version in database metadata table
3. Run migrations on app load if version mismatch

Example migration:
```sql
-- migrations/001_add_tags.sql (hypothetical future feature)
ALTER TABLE photos ADD COLUMN tags TEXT DEFAULT '[]';
```

---

## Next Steps

1. **Implement Storage Layer** (`lib/storage.js`): Wrapper around sql.js Database
2. **Create Type Definitions** (JSDoc): Album, Photo, AlbumOrganization types
3. **Write CRUD Tests**: Unit tests for all queries and mutations
4. **Benchmark**: Verify performance targets with test data (10,000 photos)
