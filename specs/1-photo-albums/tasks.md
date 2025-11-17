# Implementation Tasks: Photo Album Organizer

**Branch**: `1-photo-albums` | **Date**: 2025-11-17  
**Specification**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Constitution Check**: ✅ PASS (all 4 principles)

---

## Overview

Task breakdown organized by **Phase** and **User Story Priority**. Each task includes:
- **Acceptance Criteria**: Observable, testable outcomes
- **Files**: Specific source files to create/modify
- **Dependencies**: Other tasks that must complete first
- **Constitutional Gate**: Code quality, testing, accessibility, performance compliance
- **Estimate**: T-shirt size (XS, S, M, L, XL)

### Release Structure

| Phase | Goal | Tasks | Stories | Status |
|-------|------|-------|---------|--------|
| **0: Foundation** | Dev environment, storage layer, core utilities | TASK-001 to TASK-010 | N/A | 🔄 Not Started |
| **1: P1 Features** | View Albums, Drag Reorder, Photo Tiles | TASK-011 to TASK-030 | US-1, US-2, US-3 | ⏳ Blocked |
| **2: P2 Features** | Navigation, filters, polish | TASK-031 to TASK-040 | US-4 | ⏳ Blocked |
| **3: Testing & QA** | Integration, accessibility, performance | TASK-041 to TASK-050 | All | ⏳ Blocked |

---

## PHASE 0: Foundation (Dev Environment & Storage Layer)

**Goal**: Set up project skeleton, configure build tooling, implement persistence layer with comprehensive tests.

**Constitutional Gates**:
- ✅ Code Quality: ESLint, Prettier, modular structure
- ✅ Testing: 100% coverage on storage layer (non-negotiable foundation)
- ✅ Accessibility: Design tokens, CSS variables, semantic HTML structure ready
- ✅ Performance: SQLite indexes, query optimization baseline

### TASK-001: Initialize Project Structure & Tooling
**Priority**: CRITICAL (blocks all others)  
**Estimate**: M

**Description**:
Set up Vite project with npm dependencies, build configuration, linting, and formatting tools. Initialize git branch structure and verify build pipeline.

**Acceptance Criteria**:
- [ ] `package.json` created with all dependencies (Vite, Vitest, ESLint, Prettier, sql.js)
- [ ] `vite.config.js` configured with correct entry point and build output
- [ ] `vitest.config.js` configured for unit testing with coverage thresholds (≥80%)
- [ ] `.eslintrc.js` configured with recommended + a11y rules; zero warnings on src/
- [ ] `.prettierrc` configured; all source files formatted
- [ ] `npm run dev` starts dev server at http://localhost:5173 with HMR
- [ ] `npm run build` generates optimized bundle in dist/
- [ ] `npm test` runs all unit tests and reports coverage
- [ ] `npm run lint` reports zero errors
- [ ] `npm run format` auto-fixes formatting issues
- [ ] Git branch `1-photo-albums` set up and tracking origin

**Files to Create**:
```
package.json                 # Dependencies, scripts
vite.config.js              # Build config
vitest.config.js            # Test config
.eslintrc.js                # Linting rules
.prettierrc                  # Formatting rules
.gitignore                   # Exclude node_modules, dist, .coverage
tsconfig.json              # JSDoc type checking (optional but recommended)
src/index.html             # Entry HTML; basic layout structure
```

**Dependencies**: None (first task)

**Constitutional Compliance**:
- **Code Quality**: ✅ ESLint + Prettier configured; enforces standards from start
- **Testing**: ✅ Vitest configured with coverage reporting
- **UX Consistency**: ✅ Design token CSS variables placeholder in index.html
- **Performance**: ✅ Vite optimized build; code splitting ready

**Notes**:
- Use `npm create vite@latest photo-album -- --template vanilla` as base
- Install additional packages: `vitest`, `@vitest/ui`, `@vitest/coverage-v8`, `eslint-plugin-a11y`, `prettier`
- Configure ESLint to ignore node_modules and dist

---

### TASK-002: Create Base HTML Structure & Design Tokens
**Priority**: CRITICAL (blocks UI tasks)  
**Estimate**: S

**Description**:
Set up semantic HTML5 structure with ARIA roles, design tokens as CSS variables, and responsive breakpoint configuration.

**Acceptance Criteria**:
- [ ] `src/index.html` contains semantic HTML structure (header, main, footer)
- [ ] All interactive elements have proper ARIA roles (button, navigation, region)
- [ ] CSS variables defined for colors (primary, secondary, neutral), spacing, typography, z-indexes
- [ ] Responsive breakpoints defined: mobile 320px, tablet 768px, desktop 1200px
- [ ] Base CSS reset applied (box-sizing, margin, padding normalization)
- [ ] Focus indicators visible on all interactive elements (3px outline with 2px offset)
- [ ] Color contrast verified: 4.5:1 for text, 3:1 for UI components (WCAG AA)
- [ ] No layout shifts when loading fonts or images (CLS optimization)
- [ ] Lighthouse accessibility score ≥95 on base HTML

**Files to Create/Modify**:
```
src/index.html              # Semantic structure, ARIA, meta tags
src/styles/base.css         # Design tokens, CSS variables, reset
src/styles/layout.css       # Responsive grid, flexbox, breakpoints
src/styles/accessibility.css # Focus states, skip links, ARIA helpers
```

**Dependencies**: TASK-001 (Vite config)

**Constitutional Compliance**:
- **Code Quality**: ✅ Semantic markup; no inline styles
- **Testing**: ✅ HTML structure testable with axe-core
- **UX Consistency**: ✅ Design tokens centralized; accessible defaults
- **Performance**: ✅ No unnecessary reflows; minimal initial CSS

**Notes**:
- Use semantic HTML5: `<main>`, `<nav>`, `<article>`, `<section>`
- Include skip-to-main link for keyboard users
- Define CSS custom properties: `--color-primary`, `--spacing-unit`, `--font-size-base`, etc.

---

### TASK-003: Implement Storage Layer (SQLite Wrapper)
**Priority**: CRITICAL (blocks album/photo management)  
**Estimate**: L

**Description**:
Implement SQLite database wrapper using sql.js with IndexedDB persistence. Set up database initialization, schema migration, transaction support, and error handling.

**Acceptance Criteria**:
- [ ] `lib/storage.js` exports Database class with initialize() method
- [ ] SQLite database created with schema: Albums table, Photos table, AlbumOrganization table
- [ ] All tables include required indexes: album_id, date_created, display_order, date_taken
- [ ] Database persists to IndexedDB on every write (saveToIndexedDB function)
- [ ] Database loads from IndexedDB on app start (loadFromIndexedDB function)
- [ ] Transaction support: begin(), commit(), rollback() methods
- [ ] Error handling: ValidationError, NotFoundError, DuplicateError, StorageError classes
- [ ] JSDoc type definitions for all public methods and return types
- [ ] Zero TypeScript/JSDoc errors (`npm run check`)
- [ ] Unit test coverage ≥90% (CRITICAL: storage is foundation)
- [ ] All CRUD operations tested: create, read, update, delete
- [ ] Edge cases tested: null values, duplicate dates, concurrent access, persistence across sessions

**Files to Create**:
```
lib/storage.js              # Database class, CRUD operations, transactions
lib/errors.js               # Custom error classes
tests/unit/storage.test.js  # Comprehensive storage tests
```

**Dependencies**: TASK-001 (Vite, Vitest)

**Constitutional Compliance**:
- **Code Quality**: ✅ JSDoc types, modular CRUD methods (<50 lines each), no magic numbers
- **Testing**: ✅ 90%+ coverage on all storage operations; TDD approach
- **UX Consistency**: ✅ Error messages user-friendly and actionable
- **Performance**: ✅ Indexed queries; batch operations support; <50ms query target

**Implementation Notes**:
- Use sql.js library: `npm install sql.js`
- Schema (from data-model.md):
  ```sql
  CREATE TABLE albums (
    album_id TEXT PRIMARY KEY,
    date_created DATE UNIQUE NOT NULL,
    photo_count INTEGER DEFAULT 0,
    display_order INTEGER NOT NULL,
    is_undated BOOLEAN DEFAULT 0,
    cover_photo_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE photos (
    photo_id TEXT PRIMARY KEY,
    album_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    date_taken DATE,
    width INTEGER,
    height INTEGER,
    thumbnail_data BLOB,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE
  );
  
  CREATE TABLE album_organization (
    org_id TEXT PRIMARY KEY,
    album_id TEXT NOT NULL UNIQUE,
    position INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE
  );
  
  CREATE INDEX idx_album_date ON albums(date_created);
  CREATE INDEX idx_album_order ON albums(display_order);
  CREATE INDEX idx_photo_album ON photos(album_id);
  CREATE INDEX idx_photo_date ON photos(date_taken);
  ```
- Implement transaction pattern: wrap multi-statement operations in begin/commit
- Handle IndexedDB quota exceeded errors gracefully (suggest cleanup)

---

### TASK-004: Implement Storage API (Album CRUD)
**Priority**: CRITICAL (blocks album features)  
**Estimate**: M

**Description**:
Implement Album CRUD operations on top of storage layer. Includes getAlbums(), createAlbum(), updateAlbumPhotoCount(), deleteAlbum(), and reordering methods.

**Acceptance Criteria**:
- [ ] `lib/album-manager.js` exports functions: getAlbums(), createAlbum(), updateAlbumPhotoCount(), deleteAlbum(), setAlbumOrder()
- [ ] getAlbums() returns all albums sorted by display_order; includes cover photo ID
- [ ] createAlbum(dateTaken, isUndated) creates new album with auto-assigned display_order
- [ ] updateAlbumPhotoCount(albumId, count) updates denormalized photo_count
- [ ] deleteAlbum(albumId) removes album and all photos via cascade delete
- [ ] setAlbumOrder(albumId, newPosition) reorders album and updates display_order for affected albums
- [ ] "Undated" album always at end of list (immovable)
- [ ] All methods return Album type with JSDoc annotations
- [ ] Validation: dates in ISO format, album IDs non-empty, positions within range
- [ ] Unit tests ≥85% coverage on all album operations
- [ ] Integration tests verify photo count stays in sync after album operations

**Files to Create**:
```
lib/album-manager.js        # Album CRUD and reordering
tests/unit/album-manager.test.js
```

**Dependencies**: TASK-003 (storage layer)

**Constitutional Compliance**:
- **Code Quality**: ✅ Pure functions where possible; single responsibility
- **Testing**: ✅ All code paths tested; edge cases (empty albums, duplicate dates)
- **UX Consistency**: ✅ Consistent error handling and validation
- **Performance**: ✅ Queries indexed; O(n) reordering acceptable for <1000 albums

**Implementation Notes**:
- Album IDs: UUID v4 or timestamp-based
- display_order: integer starting at 0, incremented for new albums
- Undated album: create on first album creation if none exists; always positioned at max display_order
- Reordering: atomic transaction updating affected albums' display_order

---

### TASK-005: Implement Storage API (Photo CRUD & Thumbnails)
**Priority**: CRITICAL (blocks photo display)  
**Estimate**: M

**Description**:
Implement Photo CRUD operations including getPhotosByAlbum(), getPhoto(), createPhoto() with thumbnail generation, and deletePhoto(). Thumbnails generated on client using Canvas API.

**Acceptance Criteria**:
- [ ] `lib/photo-manager.js` exports functions: getPhotosByAlbum(), getPhoto(), createPhoto(), deletePhoto()
- [ ] getPhotosByAlbum(albumId) returns all photos for album; includes thumbnail data
- [ ] getPhoto(photoId) returns single photo with full metadata and thumbnail
- [ ] createPhoto(albumId, fileData, originalImage) generates thumbnail via Canvas, stores both
- [ ] Thumbnail generation: JPEG compression 0.7 quality, max 200x200 dimensions
- [ ] Thumbnails stored as BLOB in photos.thumbnail_data column
- [ ] deletePhoto(photoId) removes photo and updates album.photo_count; deletes album if empty
- [ ] Metadata extracted from image: width, height, EXIF date (if available)
- [ ] All methods return Photo type with JSDoc annotations
- [ ] Unit tests ≥85% coverage including thumbnail edge cases (various formats, corrupted images)
- [ ] Performance: thumbnail generation <500ms per photo on desktop

**Files to Create**:
```
lib/photo-manager.js        # Photo CRUD, thumbnail generation
lib/image-utils.js          # Canvas thumbnail generation, EXIF parsing
tests/unit/photo-manager.test.js
tests/unit/image-utils.test.js
```

**Dependencies**: TASK-003 (storage layer), TASK-004 (album manager)

**Constitutional Compliance**:
- **Code Quality**: ✅ Canvas operations isolated in image-utils; testable via canvas mocking
- **Testing**: ✅ Thumbnail generation tested with sample images; edge cases (PNG, WEBP, corrupted)
- **UX Consistency**: ✅ Consistent photo metadata across application
- **Performance**: ✅ <500ms thumbnail generation; lazy-load full-res images

**Implementation Notes**:
- Use Canvas API to generate thumbnails: `canvas.getContext('2d').drawImage()`
- Compress with `canvas.toBlob(..., 'image/jpeg', 0.7)`
- EXIF date extraction: use exifjs or manual parsing of JPEG headers
- Store thumbnail as data URL or raw BLOB in database

---

### TASK-006: Implement Application State Management
**Priority**: HIGH (blocks UI rendering)  
**Estimate**: S

**Description**:
Implement centralized application state object tracking current album, drag state, viewport size, and UI mode. Use event-driven updates without framework.

**Acceptance Criteria**:
- [ ] `lib/state.js` exports AppState class with getters/setters for currentAlbum, dragState, viewportSize, uiMode
- [ ] State changes emit custom events (statechange:currentAlbum, statechange:drag, etc.)
- [ ] Drag state includes: sourceAlbumId, targetPosition, isActive, offset
- [ ] Viewport state includes: width, height, breakpoint (mobile/tablet/desktop)
- [ ] UI modes: ALBUM_LIST, ALBUM_DETAIL, LIGHTBOX, LOADING
- [ ] State persisted to sessionStorage for navigation preservation
- [ ] All state transitions validated (no invalid combinations)
- [ ] TypeScript/JSDoc type definitions for all state properties
- [ ] Unit tests verify state consistency and event emissions
- [ ] No direct state mutations; all changes through setters

**Files to Create**:
```
lib/state.js                # AppState class
tests/unit/state.test.js
```

**Dependencies**: TASK-001 (Vite config)

**Constitutional Compliance**:
- **Code Quality**: ✅ Centralized state; predictable mutations
- **Testing**: ✅ All state transitions tested
- **UX Consistency**: ✅ Single source of truth for UI state
- **Performance**: ✅ Efficient event listeners; no excessive re-renders

**Notes**:
- Use EventTarget mixin pattern or custom EventEmitter for state change events
- Example: `state.addEventListener('statechange:currentAlbum', handler)`

---

### TASK-007: Implement Date Formatting & Utilities
**Priority**: MEDIUM (used by album display)  
**Estimate**: S

**Description**:
Implement date parsing, formatting, and grouping utilities. Convert date_taken → "November 17, 2025" format, handle invalid dates, group photos by calendar day.

**Acceptance Criteria**:
- [ ] `utils/date-format.js` exports: formatDateFull(), formatDateShort(), parseDate(), groupByDate()
- [ ] formatDateFull(date) returns "November 17, 2025" format
- [ ] formatDateShort(date) returns "Nov 17" format
- [ ] parseDate(string) handles ISO 8601, common formats, invalid input; returns Date or null
- [ ] groupByDate(photos) returns Map<dateString, Photo[]> grouped by calendar day
- [ ] Invalid/null dates grouped under "Undated" key
- [ ] All functions handle edge cases: leap years, DST, timezones
- [ ] Unit tests ≥90% coverage on edge cases (null, invalid, boundary dates)
- [ ] Performance: format 1000 dates in <10ms

**Files to Create**:
```
utils/date-format.js        # Date utilities
tests/unit/date-format.test.js
```

**Dependencies**: TASK-001 (Vite config)

**Constitutional Compliance**:
- **Code Quality**: ✅ Pure functions; no side effects
- **Testing**: ✅ Comprehensive edge case coverage
- **UX Consistency**: ✅ Consistent date formatting across app
- **Performance**: ✅ Fast formatting; cached formatters

**Notes**:
- Use native Date/Intl APIs; no date library initially (prefer native first)
- Handle timezone correctly: use YYYY-MM-DD for consistency

---

### TASK-008: Implement Keyboard & Accessibility Utilities
**Priority**: HIGH (required by constitution)  
**Estimate**: S

**Description**:
Implement keyboard event handling, focus management, and screen reader support utilities per WCAG 2.1 AA.

**Acceptance Criteria**:
- [ ] `utils/keyboard.js` exports: isKey(), handleTabbing(), setFocus(), announceToScreenReader()
- [ ] isKey(event, 'Enter', 'Space') detects keyboard events
- [ ] handleTabbing(elements, event) manages focus trap (cycling through elements)
- [ ] setFocus(element) sets focus with smooth scroll if needed
- [ ] announceToScreenReader(message, priority='polite'|'assertive') updates ARIA live region
- [ ] All functions handle edge cases: null elements, document not ready, no focus support
- [ ] Unit tests verify keyboard event detection and focus management
- [ ] Integration tests verify screen reader announcements in JSDOM
- [ ] Accessibility checklist: Tab/Enter/Escape all handled; focus visible

**Files to Create**:
```
utils/keyboard.js           # Keyboard and focus utilities
tests/unit/keyboard.test.js
tests/integration/keyboard.integration.test.js
```

**Dependencies**: TASK-001 (Vite config)

**Constitutional Compliance**:
- **Code Quality**: ✅ Modular utility functions
- **Testing**: ✅ Keyboard interactions tested
- **UX Consistency**: ✅ WCAG 2.1 AA compliance
- **Performance**: ✅ Efficient event delegation

**Notes**:
- Create persistent ARIA live region in index.html for announcements
- Focus management: use el.focus() or el.scrollIntoView({ behavior: 'smooth' })

---

### TASK-009: Implement Performance Monitoring Utilities
**Priority**: MEDIUM (required for constitutional SLOs)  
**Estimate**: S

**Description**:
Implement custom performance timers and metrics tracking for SLO monitoring (album load <1s, drag latency <100ms).

**Acceptance Criteria**:
- [ ] `utils/perf.js` exports: mark(), measure(), report()
- [ ] mark(label) creates named performance mark
- [ ] measure(label, startMark, endMark) creates named performance measure
- [ ] report() returns JSON of all measures for console logging or analytics
- [ ] Tracks key metrics: albumListLoad, albumDetailLoad, dragLatency, thumbnailGeneration
- [ ] SLO thresholds defined: album load <1s, drag <100ms, photo tile render <100ms
- [ ] Warnings logged when thresholds exceeded
- [ ] Unit tests verify mark/measure accuracy
- [ ] Integration tests verify SLOs met during actual operations

**Files to Create**:
```
utils/perf.js               # Performance monitoring
tests/unit/perf.test.js
```

**Dependencies**: TASK-001 (Vite config)

**Constitutional Compliance**:
- **Code Quality**: ✅ Clean API for performance tracking
- **Testing**: ✅ Timing accuracy tested
- **UX Consistency**: ✅ Consistent monitoring across app
- **Performance**: ✅ No overhead <1% of operation time

**Notes**:
- Use Web Performance API: performance.mark() and performance.measure()
- Log warnings to console if thresholds exceeded

---

### TASK-010: Write Unit Tests for Foundation Tasks (TASK-001 to TASK-009)
**Priority**: CRITICAL (constitutional gate)  
**Estimate**: L

**Description**:
Comprehensive unit test suite for all foundation tasks. Minimum 80% coverage; verify all TASK-001 through TASK-009 code paths.

**Acceptance Criteria**:
- [ ] All storage layer tests: CRUD, transactions, error handling (TASK-003)
- [ ] All album manager tests: create, read, update, delete, reorder (TASK-004)
- [ ] All photo manager tests: CRUD, thumbnail generation, metadata extraction (TASK-005)
- [ ] State management tests: transitions, events, persistence (TASK-006)
- [ ] Date formatting tests: parsing, formatting, grouping, edge cases (TASK-007)
- [ ] Keyboard utility tests: event detection, focus management (TASK-008)
- [ ] Performance monitor tests: mark/measure accuracy (TASK-009)
- [ ] Build config tests: ESLint, Prettier enforced (TASK-001)
- [ ] HTML/CSS tests: axe-core accessibility scan ≥95 score (TASK-002)
- [ ] **Overall coverage**: ≥80% across all files
- [ ] All tests passing: `npm test` returns exit code 0
- [ ] Test execution time <5s for all foundation tests
- [ ] Coverage report generated in `coverage/` directory

**Files Modified**:
```
tests/unit/storage.test.js           # From TASK-003
tests/unit/album-manager.test.js     # From TASK-004
tests/unit/photo-manager.test.js     # From TASK-005
tests/integration/keyboard.integration.test.js  # From TASK-008
tests/unit/state.test.js             # From TASK-006
tests/unit/date-format.test.js       # From TASK-007
tests/unit/perf.test.js              # From TASK-009
tests/a11y/html-structure.test.js    # New: axe-core scan of index.html
```

**Dependencies**: All TASK-001 through TASK-009

**Constitutional Compliance**:
- **Code Quality**: ✅ 80%+ coverage enforces quality
- **Testing**: ✅ Mandatory gate; TDD approach
- **UX Consistency**: ✅ Accessibility tests included
- **Performance**: ✅ Performance utilities tested

**Notes**:
- Install @vitest/coverage-v8 for coverage reporting
- Use vitest configuration to fail if coverage <80%
- Mock Canvas API for thumbnail tests (use canvas mock library)
- Mock IndexedDB for storage persistence tests

---

## PHASE 1: P1 Features (View Albums, Drag Reorder, Photo Tiles)

**Goal**: Implement core user stories 1-3 (album viewing, drag-and-drop, photo grid).

**Blocked By**: All PHASE 0 tasks (TASK-001 through TASK-010)

**Constitutional Gates**:
- ✅ Code Quality: All UI code reviewed for complexity, JSDoc, modularity
- ✅ Testing: TDD for all UI logic; 80%+ coverage including event handlers
- ✅ Accessibility: WCAG 2.1 AA keyboard and screen reader throughout
- ✅ Performance: Album load <1s, drag latency <100ms, tile render <100ms

### TASK-011: Implement Album List View Component
**Priority**: P1 (core feature)  
**Estimate**: M

**Description**:
Create album list component rendering all albums in responsive grid with album cards showing cover photo, date, and photo count.

**Acceptance Criteria**:
- [ ] `ui/album-list.js` exports renderAlbumList(albums, container)
- [ ] Album cards display: cover photo thumbnail, formatted date, photo count
- [ ] Responsive grid: 6 columns desktop (≥1200px), 3 tablet (768-1199px), 2 mobile (<768px)
- [ ] Album cards have hover/focus states with visual feedback
- [ ] Click handler: navigate to album detail view, update state.currentAlbum
- [ ] Empty state message when no albums (helpful guidance to add photos)
- [ ] Loading state with skeleton cards while albums load
- [ ] Drag-start handler attached to album cards (calls drag-handler)
- [ ] Undated album clearly labeled and positioned at end
- [ ] All interactive elements keyboard-accessible (Tab, Enter, Escape)
- [ ] Screen reader announcements for album count and current view
- [ ] JSDoc type definitions for all functions and parameters
- [ ] Unit tests ≥80% covering render, click handlers, empty state
- [ ] Integration tests verify album navigation flow
- [ ] Performance: render 1000 albums in <1s

**Files to Create**:
```
ui/album-list.js            # Album list component
ui/album-card.js            # Reusable album card component
styles/components.css       # Album card styles (create/extend)
tests/unit/album-list.test.js
tests/integration/album-list.integration.test.js
```

**Dependencies**: TASK-004 (album manager), TASK-002 (base HTML/CSS)

**Constitutional Compliance**:
- **Code Quality**: ✅ Modular component structure; JSDoc types
- **Testing**: ✅ TDD for all render paths
- **UX Consistency**: ✅ Responsive design token-based; accessible defaults
- **Performance**: ✅ Virtual scrolling for 1000+ albums if needed

**Implementation Notes**:
- Use DOM API: document.createElement(), appendChild()
- CSS Grid for responsive layout: use CSS variables for column count per breakpoint
- Album card template: `<article class="album-card" data-album-id="..."><img /><h3 /><p /></article>`

---

### TASK-012: Implement Album Detail View Component
**Priority**: P1 (core feature)  
**Estimate**: M

**Description**:
Create album detail component rendering all photos within album as responsive tile grid with photo click handlers.

**Acceptance Criteria**:
- [ ] `ui/album-detail.js` exports renderAlbumDetail(album, photos, container)
- [ ] Photo tiles display: thumbnail image, aspect ratio maintained, uniform sizing
- [ ] Responsive grid: 6 columns desktop, 3 tablet, 2 mobile (same as album list)
- [ ] Click handler on tile: open lightbox with current photo
- [ ] Album header: back button, album title/date, photo count
- [ ] Empty album message if no photos
- [ ] Tile hover/focus states with visual feedback
- [ ] Keyboard navigation: Tab through tiles, Enter to open lightbox, Escape to go back
- [ ] Screen reader announcement: "Album November 17, 2025 with 42 photos"
- [ ] Lazy-load thumbnail images on scroll (intersection observer)
- [ ] All interactive elements keyboard-accessible
- [ ] JSDoc type definitions for all functions
- [ ] Unit tests ≥80% covering render, click handlers, lazy-load
- [ ] Integration tests verify photo opening in lightbox
- [ ] Performance: render 500 photos in <2s; lazy-load thumbnails

**Files to Create**:
```
ui/album-detail.js          # Album detail component
ui/photo-tile.js            # Reusable photo tile component
ui/back-navigation.js       # Back button and breadcrumb navigation
styles/components.css       # Photo tile styles (extend)
tests/unit/album-detail.test.js
tests/integration/album-detail.integration.test.js
```

**Dependencies**: TASK-005 (photo manager), TASK-011 (album list)

**Constitutional Compliance**:
- **Code Quality**: ✅ Lazy loading implemented; minimal reflows
- **Testing**: ✅ Intersection observer mocked in tests
- **UX Consistency**: ✅ Responsive tiles; accessible navigation
- **Performance**: ✅ Lazy-load reduces initial load; tile render <100ms

**Implementation Notes**:
- Use IntersectionObserver for lazy-load: observe img elements, set src when visible
- Photo tile template: `<div class="photo-tile"><img data-src="..." /></div>`
- CSS aspect-ratio property for uniform tiles: `aspect-ratio: 1 / 1`

---

### TASK-013: Implement Lightbox (Photo Viewer) Component
**Priority**: P1 (core feature)  
**Estimate**: M

**Description**:
Create fullscreen lightbox modal for viewing single photo with next/previous navigation and keyboard/touch controls.

**Acceptance Criteria**:
- [ ] `ui/lightbox.js` exports openLightbox(photoId, albumPhotos, container)
- [ ] Lightbox displays full-resolution photo (or resized version if large)
- [ ] Navigation: previous/next buttons, keyboard arrows (←/→), touch swipe (left/right)
- [ ] Photo counter display: "3 of 42"
- [ ] Close button (X) and Escape key to close
- [ ] Photo info: filename, dimensions, date taken (if available)
- [ ] Prevent body scroll when lightbox open
- [ ] Smooth transitions between photos (fade or slide)
- [ ] Keyboard accessible: Tab to close button, arrow keys to navigate, Enter to close
- [ ] Screen reader announcement: current photo number and count
- [ ] Touch swipe: left swipe → next, right swipe → previous (50px threshold)
- [ ] Performance: <100ms to display next photo
- [ ] JSDoc type definitions
- [ ] Unit tests ≥80% covering navigation, keyboard, swipe, close
- [ ] Integration tests verify lightbox lifecycle (open → navigate → close)

**Files to Create**:
```
ui/lightbox.js              # Lightbox component
styles/lightbox.css         # Fullscreen lightbox styles (create/extend)
utils/swipe-gesture.js      # Touch swipe detection utility
tests/unit/lightbox.test.js
tests/integration/lightbox.integration.test.js
```

**Dependencies**: TASK-012 (album detail), TASK-008 (keyboard utils)

**Constitutional Compliance**:
- **Code Quality**: ✅ Gesture detection isolated in utility; modular
- **Testing**: ✅ Keyboard and swipe inputs tested
- **UX Consistency**: ✅ WCAG 2.1 AA keyboard navigation; focus trap
- **Performance**: ✅ <100ms photo navigation; CSS transforms for smoothness

**Implementation Notes**:
- Lightbox template: `<div class="lightbox"><img /><nav><button>prev</button><button>next</button></nav></div>`
- Swipe detection: track touchstart/touchmove/touchend; calculate distance and direction
- Prevent default scroll: add `overflow: hidden` to body when lightbox open
- Z-index management: lightbox >1000, other elements <100

---

### TASK-014: Implement Drag-and-Drop Handler (Mouse)
**Priority**: P1 (core feature)  
**Estimate**: L

**Description**:
Implement mouse-based drag-and-drop for album reordering. Use vanilla HTML5 drag events with visual feedback and drop zone detection.

**Acceptance Criteria**:
- [ ] `ui/drag-handler.js` exports registerDragHandlers(albumCards, onReorder)
- [ ] dragstart event: capture source album, set drag image, update drag state
- [ ] dragover event: detect drop zones, prevent default, show drop indicator
- [ ] drop event: calculate target position, call onReorder(sourceId, targetPosition)
- [ ] dragend event: cleanup, reset drag state, remove drop indicators
- [ ] Drop indicator visualization: line or highlight showing drop position
- [ ] Undated album: not draggable; dragstart prevented
- [ ] Reorder callback: calls album-manager.setAlbumOrder() and updates UI
- [ ] Animation on drop: smooth transition to new position
- [ ] Keyboard accessible: Alt+Arrow keys as drag fallback (TASK-015)
- [ ] Touch-friendly: coordinates work across devices
- [ ] JSDoc type definitions
- [ ] Unit tests ≥80% covering drag lifecycle, drop calculation
- [ ] Integration tests verify full drag-and-drop flow with UI update
- [ ] Performance: <100ms drag latency; smooth 60fps animation

**Files to Create**:
```
ui/drag-handler.js          # Drag-and-drop handler
styles/drag-feedback.css    # Drag visual feedback styles (create/extend)
tests/unit/drag-handler.test.js
tests/integration/drag-handler.integration.test.js
```

**Dependencies**: TASK-004 (album manager), TASK-011 (album list)

**Constitutional Compliance**:
- **Code Quality**: ✅ Drag logic isolated; event handlers tested separately
- **Testing**: ✅ All drag states tested
- **UX Consistency**: ✅ Visual feedback; accessible keyboard alternative
- **Performance**: ✅ <100ms latency; GPU-accelerated transforms

**Implementation Notes**:
- HTML5 drag events: dragstart, dragover, drop, dragend, dragleave
- Set dragImage for visual feedback: `event.dataTransfer.setDragImage(imageElement, 0, 0)`
- Drop zone detection: compare event.clientY to album card positions
- CSS transforms for drag preview: `transform: translateY(offset)` during drag
- Undated album data attribute: `data-album-id="undated"` or `data-undatable="true"`

---

### TASK-015: Implement Drag-and-Drop Handler (Keyboard & Touch)
**Priority**: P1 (accessibility required)  
**Estimate**: M

**Description**:
Implement keyboard-based drag alternative (Alt+Arrow keys) and touch-based drag (long-press 500ms + finger drag).

**Acceptance Criteria**:
- [ ] `ui/drag-handler-keyboard.js` exports registerKeyboardDragHandlers(albumCards, onReorder)
- [ ] Keyboard flow: Focus album card → Alt+Up/Down arrow keys → move album
- [ ] Visual feedback: album highlighted during keyboard drag, feedback message
- [ ] Enter to confirm position, Escape to cancel
- [ ] Touch flow: Long-press album card 500ms → enter drag mode → finger drag → release
- [ ] Touch visual feedback: album lifts, drop indicator shows during drag
- [ ] Touch coordinates calculated from event.touches[0]
- [ ] Fallback for browsers without pointer events: use touch + mouse events
- [ ] All three input methods (mouse, keyboard, touch) call same setAlbumOrder() function
- [ ] JSDoc type definitions
- [ ] Unit tests ≥80% covering keyboard input, long-press detection
- [ ] Integration tests verify keyboard and touch drag complete flows
- [ ] Performance: <100ms response to keyboard input, <500ms long-press timeout

**Files to Create/Modify**:
```
ui/drag-handler-keyboard.js # Keyboard drag handler
ui/drag-handler-touch.js    # Touch drag handler
ui/drag-handler.js          # Modified to coordinate all handlers
tests/unit/drag-handler-keyboard.test.js
tests/unit/drag-handler-touch.test.js
tests/integration/drag-handler-keyboard.integration.test.js
tests/integration/drag-handler-touch.integration.test.js
```

**Dependencies**: TASK-014 (mouse drag), TASK-008 (keyboard utils)

**Constitutional Compliance**:
- **Code Quality**: ✅ Three input handlers coordinated; common interface
- **Testing**: ✅ Each input method tested separately
- **UX Consistency**: ✅ WCAG 2.1 AA keyboard and touch support
- **Performance**: ✅ <100ms input response; timeout configurable

**Implementation Notes**:
- Keyboard: listen for alt+arrowup/arrowdown while album has focus
- Long-press: use pointerdown + setTimeout for 500ms timeout
- Touch drag: track pointermove; calculate distance and direction
- All handlers call same state.setDragState() and onReorder() callback

---

### TASK-016: Implement Responsive Layout (CSS Grid & Media Queries)
**Priority**: P1 (core feature)  
**Estimate**: M

**Description**:
Implement responsive CSS grid layout for album and photo grids. Adjust column count, spacing, tile size per breakpoint.

**Acceptance Criteria**:
- [ ] Breakpoints defined: mobile <768px, tablet 768-1199px, desktop ≥1200px
- [ ] Album grid: 6 columns desktop, 3 tablet, 2 mobile (FR-013)
- [ ] Photo tile grid: 6 columns desktop, 3 tablet, 2 mobile (same)
- [ ] Tile sizing: responsive; gaps adjust per breakpoint
- [ ] Aspect ratio maintained: tiles use CSS aspect-ratio property
- [ ] No layout shift during resize (CLS optimization)
- [ ] Breakpoint transitions smooth (no jarring jumps)
- [ ] CSS variables for spacing: --gap-desktop, --gap-tablet, --gap-mobile
- [ ] All styles in CSS files; no inline styles
- [ ] Tested on common device sizes: 375px (mobile), 768px (tablet), 1920px (desktop)
- [ ] Performance: resize handler debounced; <100ms resize response
- [ ] JSDoc comments explaining grid logic in CSS or utils
- [ ] Unit tests verify grid calculation logic
- [ ] Integration tests verify layout at each breakpoint

**Files to Modify**:
```
styles/layout.css           # Grid layout styles (create/extend)
utils/responsive.js         # Viewport size tracking, breakpoint detection
tests/integration/responsive.integration.test.js
```

**Dependencies**: TASK-002 (base CSS), TASK-011 (album list), TASK-012 (album detail)

**Constitutional Compliance**:
- **Code Quality**: ✅ CSS grid best practices; CSS variables for consistency
- **Testing**: ✅ Layout calculations tested
- **UX Consistency**: ✅ Responsive design per specification
- **Performance**: ✅ No CLS; efficient media queries

**Implementation Notes**:
- CSS Grid template: `grid-template-columns: repeat(var(--columns), 1fr)`
- Dynamic column count via CSS variables and media queries
- ResizeObserver to detect container resizes (more reliable than window resize)
- Debounce resize handler: wait 200ms after last resize event

---

### TASK-017: Implement Navigation & State Management
**Priority**: P1 (core feature)  
**Estimate**: S

**Description**:
Implement navigation between album list and album detail views. Update state and render appropriate UI based on current view.

**Acceptance Criteria**:
- [ ] `main.js` implements router logic for three views: ALBUM_LIST, ALBUM_DETAIL, LIGHTBOX
- [ ] Navigation function: navigate(target, params) updates state and re-renders
- [ ] Browser history: back/forward buttons work correctly
- [ ] URL-like state: hash-based routes (#albums, #album/123, #photo/456)
- [ ] State persistence: scroll position, album order preserved on back
- [ ] Breadcrumb navigation: "Albums" → "November 17" → (lightbox shows album breadcrumb)
- [ ] Back button: visible in detail and lightbox views; navigates to previous view
- [ ] All navigation keyboard-accessible: back button Tab-focusable, Escape closes lightbox
- [ ] Screen reader announcement: view changes announced
- [ ] JSDoc type definitions for navigation functions
- [ ] Unit tests ≥80% covering state transitions
- [ ] Integration tests verify navigation flows (album list → detail → lightbox → back)

**Files to Create/Modify**:
```
main.js                     # Router and navigation logic (create/modify)
lib/state.js               # Extend with navigation state
ui/navigation.js           # Back button and breadcrumb component
tests/unit/router.test.js
tests/integration/navigation.integration.test.js
```

**Dependencies**: TASK-006 (state management), TASK-011 (album list), TASK-012 (album detail)

**Constitutional Compliance**:
- **Code Quality**: ✅ Router logic centralized; predictable navigation
- **Testing**: ✅ All state transitions tested
- **UX Consistency**: ✅ Keyboard accessible; screen reader support
- **Performance**: ✅ Efficient re-renders on navigation

**Implementation Notes**:
- Simple router: track state.uiMode and render corresponding view
- History management: use window.history.pushState() for history support
- State preservation: store scroll position in state before navigation

---

### TASK-018: Implement Photo Loading & File Handling
**Priority**: P1 (core feature)  
**Estimate**: M

**Description**:
Implement file input and photo loading. Accept image files from file picker or drag-drop, extract metadata, create thumbnails, and store in database.

**Acceptance Criteria**:
- [ ] `utils/file-reader.js` exports loadPhotosFromFiles(files) → Promise<Photo[]>
- [ ] File input accepts: JPEG, PNG, WebP, GIF
- [ ] Drag-drop zone on album list for adding photos
- [ ] Extract metadata: filename, filesize, dimensions, date taken (EXIF if available)
- [ ] Generate thumbnail via Canvas (TASK-005 photo manager)
- [ ] Store photo in database via photo-manager.createPhoto()
- [ ] Group photo into album by date; create album if needed
- [ ] Progress feedback: loading bar or status message during batch import
- [ ] Error handling: invalid files skipped with warning; show count of loaded
- [ ] Performance: batch load 100 photos in <5s
- [ ] Accessibility: file input labeled properly; drag-drop area announced
- [ ] JSDoc type definitions
- [ ] Unit tests ≥80% covering file parsing, metadata extraction, error handling
- [ ] Integration tests verify photo creation flow (file → album → tile display)

**Files to Create**:
```
utils/file-reader.js        # File loading and metadata extraction
ui/file-input.js            # File input and drag-drop component
tests/unit/file-reader.test.js
tests/integration/file-upload.integration.test.js
```

**Dependencies**: TASK-005 (photo manager), TASK-004 (album manager)

**Constitutional Compliance**:
- **Code Quality**: ✅ File handling isolated; clean error handling
- **Testing**: ✅ File parsing and metadata extraction tested
- **UX Consistency**: ✅ Accessible file input; clear feedback
- **Performance**: ✅ Batch loading; background processing

**Implementation Notes**:
- File input: `<input type="file" accept="image/*" multiple />`
- Drag-drop: dragover, drop event listeners on main container
- EXIF parsing: use exifjs library or manual JPEG header parsing
- Metadata: `image.width`, `image.height`, `image.naturalWidth`
- Error handling: try-catch around file reading; show errors in toast/modal

---

### TASK-019: Implement Settings/Preferences (Optional P1)
**Priority**: LOW (P2 feature, included for completeness)  
**Estimate**: S

**Description**:
Implement user preferences for layout, theme, and view options. Store in localStorage or database.

**Acceptance Criteria**:
- [ ] Settings object: columns preference, theme (light/dark), grouping (date/month)
- [ ] Settings UI: gear icon on album list; modal/drawer for preferences
- [ ] Columns preference: override default (always 6/3/2) with custom counts
- [ ] Theme preference: light/dark mode toggle; apply to CSS variables
- [ ] Grouping preference: by date (FR-001) or by month (future enhancement)
- [ ] Settings persist to localStorage across sessions
- [ ] Keyboard accessible: Tab, Enter, Escape in settings modal
- [ ] Screen reader support: settings labeled and announced
- [ ] Unit tests verify settings storage and retrieval
- [ ] Integration tests verify settings applied to UI

**Files to Create**:
```
lib/preferences.js          # Settings storage and retrieval
ui/settings-modal.js        # Settings UI component
tests/unit/preferences.test.js
```

**Dependencies**: TASK-006 (state management), TASK-002 (base CSS)

**Constitutional Compliance**:
- **Code Quality**: ✅ Settings isolated; clean interface
- **Testing**: ✅ Settings tested
- **UX Consistency**: ✅ Accessible preferences
- **Performance**: ✅ LocalStorage efficient

---

### TASK-020: Write Unit & Integration Tests for PHASE 1 (TASK-011 to TASK-019)
**Priority**: CRITICAL (constitutional gate)  
**Estimate**: L

**Description**:
Comprehensive test suite for all P1 features. Minimum 80% coverage; verify all render, navigation, drag, and file handling code paths.

**Acceptance Criteria**:
- [ ] All component tests: album list, album detail, lightbox (TASK-011, TASK-012, TASK-013)
- [ ] All drag handler tests: mouse, keyboard, touch (TASK-014, TASK-015)
- [ ] Navigation and state tests: all view transitions (TASK-017)
- [ ] File loading tests: file parsing, metadata, error handling (TASK-018)
- [ ] Layout responsiveness tests: grid at all breakpoints (TASK-016)
- [ ] Settings tests: preference storage and application (TASK-019)
- [ ] **Overall coverage**: ≥80% across all Phase 1 files
- [ ] All tests passing: `npm test` returns exit code 0
- [ ] Integration tests cover full user journeys:
  - Load photos → albums appear grouped by date
  - Click album → photos display in tiles
  - Click photo → lightbox opens
  - Keyboard/touch drag album → reorder persists on reload
  - Back button → return to album list
- [ ] Performance tests verify SLOs:
  - Album list render 1000 albums <1s
  - Album detail render 500 photos <2s
  - Drag latency <100ms
  - Tile click → lightbox open <100ms
- [ ] Test execution time <10s for all Phase 1 tests

**Files Modified**:
```
tests/unit/album-list.test.js           # From TASK-011
tests/unit/album-detail.test.js         # From TASK-012
tests/unit/lightbox.test.js             # From TASK-013
tests/unit/drag-handler.test.js         # From TASK-014
tests/unit/drag-handler-keyboard.test.js  # From TASK-015
tests/unit/router.test.js               # From TASK-017
tests/unit/file-reader.test.js          # From TASK-018
tests/unit/preferences.test.js          # From TASK-019
tests/integration/           # All integration tests
tests/e2e/                   # E2E user journey tests (optional)
```

**Dependencies**: All TASK-011 through TASK-019

**Constitutional Compliance**:
- **Code Quality**: ✅ 80%+ coverage enforces quality
- **Testing**: ✅ Mandatory gate; all code paths tested
- **UX Consistency**: ✅ User journey tests verify flows
- **Performance**: ✅ SLO tests included

**Notes**:
- Mock file APIs (File, FileReader, Canvas) for unit tests
- Integration tests use JSDOM or Playwright
- E2E tests optional: Playwright for real browser testing of full flows

---

## PHASE 2: P2 Features & Polish (Task breakdowns intentionally brief)

### TASK-021: Enhanced Navigation (P2)
Focus: Breadcrumbs, history preservation, keyboard nav polish.

### TASK-022: Month/Year View Filters (P2, FR-012)
Focus: Toggle between day/month/year grouping; filter interface.

### TASK-023: Album Search (P2)
Focus: Search by date range, album name, photo count.

### TASK-024: Batch Photo Operations (P2)
Focus: Delete multiple photos; move between albums (future enhancement).

### TASK-025: Export/Backup (P2)
Focus: Export album collection; import from backup; data portability.

### TASK-026: Dark Mode (P2)
Focus: Complete dark theme; system preference detection; toggle.

### TASK-027: Performance Optimization (Ongoing)
Focus: Virtual scrolling large albums; lazy-load optimization; code splitting.

### TASK-028: Accessibility Audit & Fixes (P2)
Focus: axe-core scan; keyboard nav testing; screen reader testing (NVDA/JAWS).

### TASK-029: Browser Compatibility Testing (P2)
Focus: Test on Chrome, Firefox, Safari, Edge; iOS/Android support.

### TASK-030: Documentation & Examples (P2)
Focus: User guide; keyboard shortcuts reference; API documentation.

---

## PHASE 3: Testing & Quality Assurance (Comprehensive)

### TASK-031: End-to-End (E2E) Testing Suite
Focus: Full user workflows via Playwright; upload → organize → view → export.

### TASK-032: Accessibility Compliance Testing
Focus: WCAG 2.1 AA audit; keyboard-only nav; screen reader (NVDA/JAWS/VoiceOver) testing.

### TASK-033: Performance Baseline & Optimization
Focus: Lighthouse audit ≥80; Web Vitals (LCP, FID, CLS) optimization; bundle analysis.

### TASK-034: Cross-Browser Testing
Focus: Chrome, Firefox, Safari, Edge on desktop/mobile; iOS/Android native browser.

### TASK-035: Load & Stress Testing
Focus: 10,000 photos; rapid drag operations; concurrent file uploads.

### TASK-036: Security & Data Privacy Review
Focus: SQL injection prevention; XSS protection; localStorage quota; data cleanup.

---

## Task Priority & Scheduling

### Critical Path (Must Complete in Order)

```
Phase 0 (TASK-001 → TASK-010)
    ↓
TASK-011 (Album List) + TASK-012 (Album Detail)
    ↓
TASK-014 (Mouse Drag) + TASK-013 (Lightbox)
    ↓
TASK-015 (Keyboard/Touch Drag) + TASK-017 (Navigation)
    ↓
TASK-018 (File Loading) + TASK-020 (Tests)
    ↓
TASK-021 to TASK-030 (P2 Features) in parallel
    ↓
TASK-031 to TASK-036 (QA & Testing)
```

### Parallel-Safe Tasks

These can run in parallel once dependencies complete:
- TASK-011 & TASK-012 (both depend on TASK-004, can run together)
- TASK-014 & TASK-013 (both depend on TASK-012, can run together)
- TASK-021 to TASK-030 (all P2 features, can run in parallel)
- TASK-031 to TASK-036 (all QA tasks, can run in parallel)

---

## Success Criteria (All Phases)

### Functional Completeness
- ✅ User Story 1: Albums viewable, grouped by date, responsive tiles
- ✅ User Story 2: Albums draggable (mouse, keyboard, touch); reorder persists
- ✅ User Story 3: Photos in tiles; click to lightbox; navigate between photos
- ✅ User Story 4: Back button, breadcrumbs, smooth navigation
- ✅ All 14 Functional Requirements (FR-001 to FR-014) met

### Constitutional Compliance
- ✅ Code Quality: ESLint zero warnings, Prettier formatted, JSDoc typed, <10 cyclomatic complexity
- ✅ Testing: ≥80% coverage, all TDD approaches, unit + integration tests passing
- ✅ UX Consistency: WCAG 2.1 AA (keyboard, screen reader, contrast), responsive, design tokens
- ✅ Performance: <1s album load, <100ms drag, <2s detail view, Lighthouse ≥80

### Quality Metrics
- ✅ Test coverage ≥80% across all files
- ✅ All tests passing: `npm test` exit 0
- ✅ Linting zero errors: `npm run lint` exit 0
- ✅ Lighthouse accessibility ≥95, performance ≥80
- ✅ WCAG 2.1 AA audit passing
- ✅ Cross-browser testing complete (Chrome, Firefox, Safari, Edge)
- ✅ Performance budget met: bundle <100KB (gzipped)

### Deployment Readiness
- ✅ `npm run build` produces dist/ bundle
- ✅ README with setup and dev workflow
- ✅ Contribution guide for future maintainers
- ✅ Performance monitoring integrated
- ✅ Error reporting/logging configured

---

## Notes & Conventions

### Naming Conventions

- **Functions**: camelCase, verb-first: `renderAlbumList()`, `getPhotosByAlbum()`
- **Files**: kebab-case: `album-list.js`, `drag-handler.js`
- **Classes**: PascalCase: `AppState`, `StorageError`
- **Constants**: UPPER_SNAKE_CASE: `DEFAULT_COLUMNS`, `MIN_DRAG_DISTANCE`
- **Test files**: `*.test.js` for unit, `*.integration.test.js` for integration

### File Organization

- Source: `src/` (styles/, lib/, ui/, utils/)
- Tests: `tests/unit/`, `tests/integration/`, `tests/a11y/`
- Config: Root directory (package.json, vite.config.js, .eslintrc.js, etc.)
- Docs: `specs/1-photo-albums/` (spec.md, plan.md, tasks.md, research.md, data-model.md)

### Test Standards

- **Unit**: <100ms per test, fast JSDOM execution
- **Integration**: <500ms per test, real DOM simulation
- **Coverage**: Minimum 80%, aim for 90% on critical paths
- **Mocking**: Mock external APIs (Canvas, IndexedDB, File); test behavior not implementation
- **Naming**: `test("should render album list with 3 albums", () => { ... })`

### Performance Standards

- **Bundle size**: Total <100KB (gzipped); core JS <50KB, CSS <20KB
- **Album load**: <1s (p95) for up to 1000 photos
- **Album detail**: <2s (p95) for 500 photos
- **Drag latency**: <100ms from pointer move to visual feedback
- **Tile render**: <100ms per tile
- **Lighthouse**: Accessibility ≥95, Performance ≥80, Best Practices ≥90

### Review Checklist

Before committing each task:
- [ ] Tests written (TDD approach)
- [ ] Tests passing (`npm test`)
- [ ] Coverage ≥80% for files modified
- [ ] Linting passing (`npm run lint`)
- [ ] Formatting applied (`npm run format`)
- [ ] JSDoc type annotations present
- [ ] Accessibility reviewed (keyboard, screen reader, color contrast)
- [ ] Performance checked (no N+1 queries, efficient renders)
- [ ] Commit message clear and references TASK-###

---

## Git Workflow

Each task gets its own commit or series of commits:

```bash
# After completing TASK-001
git commit -m "feat: initialize vite project with tooling (TASK-001)"

# After completing tests for TASK-001
git commit -m "test: add tests for build configuration (TASK-001)"

# After completing a feature, create PR with task reference
git push origin 1-photo-albums
# → Create PR with title "TASK-011: Implement Album List View Component"
```

---

## Appendix: Dependency Graph

```
TASK-001 (Vite)
  ├─→ TASK-002 (HTML/CSS)
  ├─→ TASK-003 (Storage)
  ├─→ TASK-006 (State)
  ├─→ TASK-007 (Date Utils)
  ├─→ TASK-008 (Keyboard Utils)
  └─→ TASK-009 (Perf Utils)
        ↓
    TASK-010 (Tests - blocks all)
        ↓
    TASK-004 (Album CRUD) ─→ TASK-011 (Album List)
        ↓                            ↓
    TASK-005 (Photo CRUD) ─→ TASK-012 (Album Detail)
        ↓                            ↓
    TASK-018 (File Load)       TASK-013 (Lightbox)
        ↓                            ↓
                       TASK-014 (Mouse Drag)
                            ↓
                       TASK-015 (KB/Touch Drag)
                            ↓
                       TASK-016 (Responsive)
                            ↓
                       TASK-017 (Navigation)
                            ↓
                       TASK-020 (Tests)
                            ↓
                TASK-021 to TASK-030 (P2 Features)
                            ↓
                TASK-031 to TASK-036 (QA)
```

---

**End of Task Breakdown**

**Next Steps**:
1. Use this file to create GitHub Issues (via `/speckit.taskstoissues` or manual)
2. Start with PHASE 0 (TASK-001) to set up project
3. Follow dependency graph to ensure correct task ordering
4. Track progress by marking tasks complete as PRs are merged
5. Commit this file to branch: `git add specs/1-photo-albums/tasks.md && git commit -m "docs: task breakdown for photo album organizer (PHASE 0-3)"`

