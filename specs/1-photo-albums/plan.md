# Implementation Plan: Photo Album Organizer

**Branch**: `1-photo-albums` | **Date**: 2025-11-17 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/1-photo-albums/spec.md`

## Summary

Build a single-page web application (SPA) for organizing and browsing local photos in albums grouped by capture date. The application uses Vite as the build tool, vanilla HTML/CSS/JavaScript for minimal dependencies, and SQLite for local metadata storage. Core features include date-based album grouping, drag-and-drop album reordering (with pinned "Undated" album), responsive tile-based photo grid (6 cols desktop / 3 tablet / 2 mobile), and fullscreen lightbox photo browsing. All data persists locally using browser storage (localStorage for state, local SQLite for metadata). No backend server or authentication required.

## Technical Context

**Language/Version**: JavaScript (ES2020+), HTML5, CSS3; Node.js 18+ for build tooling  
**Primary Dependencies**: 
- Vite 5.x (build/dev server)
- SQLite (via sql.js or better-sqlite3 for data persistence)
- Minimal UI libraries: Vanilla JS DOM API; vanilla CSS with CSS Grid/Flexbox for layout
- Optional: interactjs or native HTML5 drag-drop for drag-and-drop (evaluate in research)

**Storage**: SQLite database stored locally (via IndexedDB or as a file in Electron/native if applicable; browser version uses sql.js or localstorage serialization)  
**Testing Framework**: Vitest (Vite-native unit testing); browser automation for integration tests (Playwright/Puppeteer); custom drag-drop test utilities  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) on desktop, tablet, and mobile (iOS Safari, Android Chrome)  
**Project Type**: Single-page web application (frontend-only)  
**Performance SLOs**: 
- Album list load <1s (p95) for up to 1000 photos; <3s on mobile with slow networks
- Album view (100 photos) <2s (p95)
- Drag-and-drop latency <100ms
- Lighthouse score ≥80 (web vitals: CLS, LCP, FID)

**Quality Requirements**: 
- Code coverage minimum ≥80% (per constitution)
- Linting (ESLint) with zero warnings
- No type errors (JSDoc or TypeScript JSDoc)
- WCAG 2.1 AA accessibility compliance (keyboard navigation, screen reader, color contrast)

**Constraints**: 
- Minimal external dependencies (vanilla JS preferred over frameworks)
- Images are NOT uploaded/served by the application (pre-existing in filesystem or imported by user)
- Metadata stored in local SQLite database
- Single-user mode; no authentication or backend required

**Scale/Scope**: 
- Support up to 10,000 photos in single collection
- Albums grouped by calendar day (e.g., 1000s of albums possible for multi-year collections)
- Tile grid responsive from 320px (mobile) to 2560px+ (large desktop)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Code Quality Standards
- ✅ **Requirement**: Linting & Formatting (ESLint, Prettier), Type Safety (JSDoc), Documentation, Complexity limits (<10 cyclomatic complexity, <50 line functions)
- **Plan Compliance**: 
  - ESLint configured with recommended + a11y rules; Prettier for formatting
  - JSDoc type annotations on all public functions
  - Modular component structure: each UI component in separate file, max 50 lines per function
  - Rationale documented for any complexity violations
- ✅ **Status**: Achievable with vanilla JS architecture; no framework complexity added

### Principle II: Testing Standards (NON-NEGOTIABLE)
- ✅ **Requirement**: TDD mandatory, ≥80% coverage, unit + integration + contract tests
- **Plan Compliance**:
  - Test files co-located with source: `component.js` + `component.test.js`
  - Vitest for unit tests (<100ms each); Playwright for integration tests
  - Test structure: Album grouping logic → Photo tile rendering → Drag-drop state → Persistence
  - Coverage: Unit tests for data model (Album/Photo entities), UI logic (tile layout, drag handlers), storage (SQLite queries)
  - Integration tests: Full user journey (load photos → view albums → drag album → verify persistence)
- ✅ **Status**: Enforceable; TDD workflow documented in quickstart

### Principle III: User Experience Consistency
- ✅ **Requirement**: Design system compliance, WCAG 2.1 AA accessibility, keyboard + screen reader support, consistent interactions
- **Plan Compliance**:
  - Design tokens (colors, spacing, typography) in CSS variables
  - Responsive breakpoints: 320px mobile, 768px tablet, 1200px desktop
  - Accessibility: 
    - All interactive elements keyboard-accessible (Tab, Enter, Arrow keys, Escape)
    - Drag-and-drop accessible: keyboard fallback (Alt+Arrow keys to move albums)
    - Screen reader support: ARIA labels, role attributes, live regions for status updates
    - Color contrast: WCAG AA (4.5:1 for text, 3:1 for UI components)
    - Focus indicators visible on all interactive elements
  - Consistent UI patterns: album cards, photo tiles, lightbox modal, navigation breadcrumbs
- ✅ **Status**: Achievable; documented in accessibility checklist (quickstart)

### Principle IV: Performance Requirements
- ✅ **Requirement**: <1s album load, <100ms drag latency, <2s album view, Lighthouse ≥80
- **Plan Compliance**:
  - Album list: Lazy-load thumbnails; paginate if >100 albums on initial view
  - Drag-and-drop: Use CSS transforms (GPU-accelerated), not reflow-triggering properties
  - Photo tiles: Virtual scrolling for large albums (>500 photos)
  - SQLite queries indexed on date_taken, album_id; queries optimized for <50ms
  - Web metrics: Monitor LCP (largest content paint), FID (first input delay), CLS (cumulative layout shift)
  - Performance budget: Core JS <50KB (gzipped), CSS <20KB, total bundle <100KB
- ✅ **Status**: Achievable with vanilla JS; minimal overhead vs framework-based approach

**Gate Result**: ✅ **PASS** - Feature aligns with all constitutional principles. No violations. Implementation plan supports TDD, accessibility, performance, and code quality throughout.

## Project Structure

### Documentation (this feature)

```
specs/1-photo-albums/
├── plan.md                  # This file
├── research.md              # Phase 0: Tech research, decisions, rationales
├── data-model.md            # Phase 1: Album, Photo, AlbumOrganization entities
├── quickstart.md            # Phase 1: Developer setup and first run guide
├── contracts/               # Phase 1: Data persistence contracts, API specs
│   ├── album-api.md         # Album CRUD operations
│   ├── photo-api.md         # Photo access and metadata
│   └── storage-schema.sql   # SQLite schema and indexes
├── checklists/
│   └── requirements.md      # Specification quality checklist (existing)
└── notes/                   # Working documents and decision logs
```

### Source Code (repository root)

```
src/
├── index.html               # Entry point; contains main layout structure
├── main.js                  # App initialization; router and event delegation
├── styles/
│   ├── base.css             # Global styles, design tokens, CSS variables
│   ├── layout.css           # Responsive grid, flexbox, breakpoints
│   ├── components.css       # Album cards, photo tiles, buttons, modals
│   ├── accessibility.css    # Focus states, screen reader helpers, ARIA
│   └── lightbox.css         # Fullscreen photo viewer styles
├── lib/
│   ├── storage.js           # SQLite wrapper; album/photo CRUD operations
│   ├── album-manager.js     # Album grouping, date sorting, reordering logic
│   ├── photo-manager.js     # Photo loading, thumbnail generation, metadata access
│   └── state.js             # Application state (current album, drag state, etc.)
├── ui/
│   ├── album-list.js        # Render album grid; album-click handlers
│   ├── album-detail.js      # Render photo tiles; photo-click handlers
│   ├── lightbox.js          # Fullscreen photo view; navigation between photos
│   ├── navigation.js        # Breadcrumb, back button, active state indicators
│   ├── drag-handler.js      # Drag-and-drop listeners; album reordering logic
│   └── responsive.js        # Viewport listener; breakpoint-based layout adjustments
├── utils/
│   ├── date-format.js       # Date parsing, formatting (date_taken → "Nov 17, 2025")
│   ├── file-reader.js       # Load image files from FileList/Electron
│   ├── keyboard.js          # Keyboard event utilities; accessibility helpers
│   └── perf.js              # Performance monitoring utilities
└── tests/
    ├── unit/
    │   ├── storage.test.js          # SQLite CRUD operations
    │   ├── album-manager.test.js    # Grouping, sorting, reordering
    │   ├── photo-manager.test.js    # Metadata, thumbnail generation
    │   └── date-format.test.js      # Date parsing edge cases
    ├── integration/
    │   ├── album-flow.test.js       # Load → View album → Navigate back
    │   ├── drag-drop.test.js        # Drag album, verify persistence, refresh
    │   └── lightbox.test.js         # Open photo → Navigate → Close
    └── contract/
        ├── storage-api.test.js      # Album/Photo storage interface compliance
        └── album-api.test.js        # Album manager contract (inputs → outputs)

vite.config.js              # Vite build configuration
package.json                # Dependencies, build scripts, dev dependencies
.eslintrc.js                # ESLint config (recommended + a11y)
.prettierrc                 # Prettier formatting config
vitest.config.js            # Vitest configuration
playwright.config.js        # Playwright configuration for integration tests
```

**Structure Decision**: Single-project SPA structure with Vite. Vanilla JS modules organized by layer (UI, business logic, storage, utilities). Tests co-located near source files for maintainability. No separate backend; all data local. This approach minimizes dependencies and maximizes transparency (developers can trace data flow easily). CSS organized by concern (base, layout, components, accessibility). Storage layer abstracted as `lib/storage.js` for easy SQLite client swapping (sql.js for browser, better-sqlite3 for Electron).

## Complexity Tracking

> **No constitutional violations. No complexity justification needed. Plan fully aligns with all principles.**

No shortcuts taken. All architectural decisions support code quality, testing, accessibility, and performance principles.

---

## Next Phases

**Phase 0 (Research)**: Investigate tech choices below; document in `research.md`

- SQL.js vs. localstorage serialization vs. better-sqlite3 (Electron variant)
- Drag-and-drop library evaluation: vanilla HTML5 API vs. interactjs vs. Sortable.js
- Photo thumbnail generation: Canvas API, Blob handling, storage in SQLite
- WCAG 2.1 AA keyboard event handling patterns (standard or custom?)
- Performance profiling tools and monitoring strategy

**Phase 1 (Design)**: Generate `research.md` → `data-model.md` → `contracts/` → `quickstart.md`

- Finalize data model based on storage choice
- Define SQLite schema with indexes
- Create contract specs for storage API and album manager
- Document setup steps and first-time developer experience

**Phase 2 (Tasks)**: Use `/speckit.tasks` to break into implementation tasks aligned with user stories and constitutional gates.
