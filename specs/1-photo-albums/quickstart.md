# Quickstart: Photo Album Organizer Development

**Date**: 2025-11-17  
**Feature**: Photo Album Organizer (`1-photo-albums`)  
**Target Audience**: Developers setting up the project for the first time  

---

## Prerequisites

- **Node.js**: 18.0 or later ([download](https://nodejs.org/))
- **npm**: 8.0 or later (included with Node.js)
- **Git**: For version control (included in most systems)
- **Text Editor/IDE**: VS Code (recommended) or any modern editor with JavaScript support

**Verify Installation**:
```bash
node --version  # Should be v18.0 or higher
npm --version   # Should be 8.0 or higher
git --version   # Should be present
```

---

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to repository
cd /path/to/speckit-workshop2

# Checkout the feature branch (should already be on 1-photo-albums)
git checkout 1-photo-albums

# Install dependencies
npm install
```

Expected packages installed:
- `vite` (build tool)
- `sql.js` (SQLite in browser)
- `vitest` (unit testing)
- `playwright` (integration testing)
- `eslint`, `prettier` (code quality)

### 2. Project Structure Overview

```
specs/1-photo-albums/
├── spec.md            # Feature specification
├── plan.md            # This implementation plan
├── research.md        # Tech research & decisions
├── data-model.md      # Database schema & entities
├── contracts/
│   └── storage-api.md # Storage API contract
└── checklists/
    └── requirements.md

src/
├── index.html         # Entry point
├── main.js            # App init & router
├── styles/
│   ├── base.css       # Global styles
│   ├── layout.css     # Responsive grid
│   ├── components.css # UI components
│   ├── accessibility.css
│   └── lightbox.css
├── lib/
│   ├── storage.js     # SQLite wrapper
│   ├── album-manager.js
│   ├── photo-manager.js
│   └── state.js
├── ui/
│   ├── album-list.js
│   ├── album-detail.js
│   ├── lightbox.js
│   ├── navigation.js
│   ├── drag-handler.js
│   └── responsive.js
├── utils/
│   ├── date-format.js
│   ├── file-reader.js
│   ├── keyboard.js
│   └── perf.js
└── tests/
    ├── unit/
    ├── integration/
    └── contract/
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

Open http://localhost:5173/ in your browser. Changes to `src/` auto-reload via HMR (Hot Module Replacement).

### Build for Production

```bash
npm run build
```

Generates optimized bundle in `dist/` folder.

### Run Tests

**Unit Tests**:
```bash
npm test                # Run all tests
npm test -- --watch    # Watch mode for development
npm test -- --ui       # Open Vitest UI (http://localhost:51204)
```

**Integration Tests** (browser-based):
```bash
npm run test:e2e        # Run Playwright tests (headless)
npm run test:e2e:ui    # Run with Playwright Inspector
```

**Test Coverage**:
```bash
npm test -- --coverage
# Shows coverage report in terminal; opens HTML report in `coverage/`
```

### Code Quality Checks

**Linting**:
```bash
npm run lint            # Check for linting errors
npm run lint:fix       # Auto-fix linting issues
```

**Formatting**:
```bash
npm run format         # Format code with Prettier
npm run format:check   # Check if code matches formatting
```

**All Checks** (pre-commit):
```bash
npm run check          # Runs lint + format:check + tests
```

---

## Architecture Overview

### Data Flow

```
User Interaction (UI)
       ↓
state.js (App State)
       ↓
album-manager.js (Business Logic)
       ↓
storage.js (SQLite CRUD)
       ↓
sql.js Database
       ↓
IndexedDB (Persistence)
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `storage.js` | SQLite CRUD operations; abstraction over sql.js |
| `album-manager.js` | Album grouping, sorting, reordering logic |
| `photo-manager.js` | Photo metadata, thumbnail generation |
| `state.js` | Global app state (current album, drag state) |
| `album-list.js` | Render main album grid; event handlers |
| `album-detail.js` | Render album's photo tiles |
| `lightbox.js` | Fullscreen photo viewer; navigation |
| `drag-handler.js` | Drag-and-drop event listeners |
| `responsive.js` | Breakpoint detection & layout updates |

### Key Concepts

**Single Responsibility Principle**: Each module has one clear purpose; no cross-cutting concerns.

**Async-First**: All data operations (storage, photo loading) return Promises; enables future backend migration.

**Immutability**: Data objects not mutated in-place; new objects created on updates (prevents accidental side effects).

**Event-Driven**: UI updates triggered by storage events, not manual DOM manipulation (easier testing, cleaner logic).

---

## Writing Features: TDD Workflow

### Test-First Development (Red-Green-Refactor)

1. **RED**: Write failing test
```javascript
// tests/unit/album-manager.test.js
import { describe, it, expect } from 'vitest';
import { groupPhotosByDate } from '../../src/lib/album-manager';

describe('groupPhotosByDate', () => {
  it('should group photos by calendar day', () => {
    const photos = [
      { photo_id: 1, date_taken: '2025-11-17T10:00:00' },
      { photo_id: 2, date_taken: '2025-11-17T14:00:00' },
      { photo_id: 3, date_taken: '2025-11-16T10:00:00' },
    ];
    
    const albums = groupPhotosByDate(photos);
    
    expect(albums).toHaveLength(2);
    expect(albums[0].date_created).toBe('2025-11-17');
    expect(albums[0].photos).toHaveLength(2);
    expect(albums[1].date_created).toBe('2025-11-16');
  });
});
```

Run test (should fail):
```bash
npm test -- album-manager.test.js
# FAIL: groupPhotosByDate is not defined
```

2. **GREEN**: Implement minimum code
```javascript
// src/lib/album-manager.js
export function groupPhotosByDate(photos) {
  const groups = {};
  photos.forEach(photo => {
    const date = photo.date_taken.split('T')[0]; // "2025-11-17"
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(photo);
  });
  
  return Object.entries(groups).map(([date, photos]) => ({
    date_created: date,
    photos: photos,
  }));
}
```

Run test (should pass):
```bash
npm test -- album-manager.test.js
# PASS: 1 passed
```

3. **REFACTOR**: Improve code without changing behavior
```javascript
// Optimize: use Map for faster lookups
export function groupPhotosByDate(photos) {
  const groups = new Map();
  
  photos.forEach(photo => {
    const date = photo.date_taken.split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date).push(photo);
  });
  
  return Array.from(groups, ([date, photos]) => ({
    date_created: date,
    photos,
  }));
}
```

Run test again (still passes, but faster):
```bash
npm test -- album-manager.test.js
# PASS: 1 passed
```

### Integration Test Example

```javascript
// tests/integration/album-flow.test.js
import { test, expect, Page } from '@playwright/test';

test('user can view albums organized by date', async ({ page }) => {
  // Open app
  await page.goto('http://localhost:5173/');
  
  // Load sample photos
  await page.click('[data-testid="import-button"]');
  await page.setInputFiles('[data-testid="file-input"]', [
    'fixtures/photo1.jpg',
    'fixtures/photo2.jpg',
  ]);
  
  // Wait for albums to load
  await page.waitForSelector('[data-testid="album-card"]');
  
  // Verify albums grouped by date
  const albumLabels = await page.locator('[data-testid="album-title"]').allTextContents();
  expect(albumLabels).toContain('November 17, 2025');
  expect(albumLabels).toContain('November 16, 2025');
});
```

Run integration tests:
```bash
npm run test:e2e
```

---

## Code Quality Standards (Per Constitution)

### 1. Code Quality Standards

- **Linting**: ESLint with `recommended` + `a11y` plugins
  - No console.log in production code (use `console.error` for real issues)
  - No var; use const/let
  - Max cyclomatic complexity 10 per function

- **Type Safety**: JSDoc annotations on all public functions
  ```javascript
  /**
   * Group photos by calendar date.
   * @param {Photo[]} photos - Array of photos
   * @returns {Album[]} Albums grouped by date
   */
  export function groupPhotosByDate(photos) { ... }
  ```

- **Documentation**: README in each module directory, inline comments for non-obvious logic
- **Complexity**: Functions >50 lines need review; break into smaller functions

### 2. Testing Standards (NON-NEGOTIABLE)

- **Coverage**: ≥80% for new code
- **TDD**: Tests written first, then implementation
- **Test Types**: Unit + Integration + Contract tests required
- **Performance**: Unit tests <100ms each; integration tests <5s total
- **Naming**: Clear test names describing what is tested
  ```javascript
  it('should return albums in display order', () => { ... })
  it('should throw ValidationError if date invalid', () => { ... })
  ```

### 3. Accessibility Standards (WCAG 2.1 AA)

- **Keyboard Navigation**: All interactive elements reachable via Tab; Enter activates; Arrow keys navigate
- **Screen Reader**: ARIA labels on images, roles on custom elements
- **Color Contrast**: 4.5:1 for text, 3:1 for UI components
- **Focus Indicators**: Visible 2px border on focused elements

**Checklist for each UI feature**:
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces all content (test with NVDA/JAWS/VoiceOver)
- [ ] Color contrast ≥4.5:1 (verify with WebAIM contrast checker)
- [ ] Focus indicators visible
- [ ] No time-limited interactions; no flashing content

### 4. Performance Standards

- Album list load: <1s (p95) for 1000 albums
- Album detail (100 photos): <2s (p95)
- Drag-and-drop: <100ms latency
- Lighthouse score: ≥80
- Core Web Vitals:
  - CLS (Cumulative Layout Shift): <0.1
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms

**Performance Audit**:
```bash
npm run build
npm run preview  # Serve production build
# Open DevTools (F12) → Lighthouse → Run audit
```

---

## Debugging Tips

### Visual Debugging

**React DevTools** (if using React; not applicable for vanilla JS):
- Browser extension recommended

**VS Code Debugger**:
1. Install "Debugger for Firefox" or "Debugger for Chrome"
2. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173/",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```
3. Press F5 to start debugging

### Performance Debugging

**Chrome DevTools**:
- Performance tab: record interactions, analyze flame graph
- Storage tab: inspect IndexedDB contents
- Network tab: check thumbnail download times

**Custom Timers**:
```javascript
// src/utils/perf.js
export const timers = {};

export function startTimer(label) {
  timers[label] = performance.now();
}

export function endTimer(label) {
  const elapsed = performance.now() - timers[label];
  console.log(`${label}: ${elapsed.toFixed(2)}ms`);
  return elapsed;
}
```

Usage:
```javascript
import { startTimer, endTimer } from './utils/perf';

startTimer('load-albums');
const albums = await storage.getAlbums();
endTimer('load-albums');
```

### Accessibility Debugging

**axe DevTools Browser Extension**:
1. Install [axe DevTools](https://www.deque.com/axe/devtools/)
2. Open DevTools → axe DevTools → Scan page
3. Review violations and fixes

**Manual Testing**:
- Unplug mouse; navigate with Tab + Enter
- Open NVDA (Windows) or VoiceOver (macOS); listen to content announcement
- Zoom to 200%; verify layout adapts
- Use Color Blindness simulator (DevTools) to check contrast

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `npm install` fails | Node version too old | Upgrade Node.js to 18+ |
| `sql.js not defined` | Missing import | Add `import initSqlJs from 'sql.js'` |
| Drag-drop not working | Event listener not attached | Check `drag-handler.js` initialization |
| Tests fail with "timeout" | Async operation takes too long | Increase timeout: `{ timeout: 10000 }` |
| Lighthouse score <80 | Large bundle or slow queries | Run `npm run build:analyze`; profile queries |
| Color contrast violation | Text color too light | Use darker color; target 4.5:1 ratio |

---

## File Checklist for First Feature Implementation

Before submitting a pull request:

- [ ] **Tests Written First** (TDD): Unit + Integration tests pass
- [ ] **Coverage ≥80%**: `npm test -- --coverage`
- [ ] **Linting Passes**: `npm run lint` (zero errors/warnings)
- [ ] **Code Formatted**: `npm run format`
- [ ] **Accessibility Verified**: Keyboard nav works, ARIA labels present, color contrast ≥4.5:1
- [ ] **Performance Tested**: Lighthouse ≥80, critical paths <1s (p95)
- [ ] **Documentation Updated**: Inline comments, JSDoc annotations
- [ ] **Manual Testing Done**: Feature works on desktop, tablet, mobile
- [ ] **Commit Message Clear**: Describes what & why (not how)

Example commit:
```
feat(album-organizer): implement date-based album grouping

- Add groupPhotosByDate() to group photos by calendar day
- Add AlbumManager class to handle sorting and reordering
- Implement localStorage persistence of album order
- Add 100% test coverage for grouping logic
- Verify accessibility: keyboard nav + screen reader tested
- Performance: album load <1s for 1000 photos

Closes #123
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [sql.js Guide](https://sql.js.org/)
- [WCAG 2.1 AA Checklist](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

---

## Getting Help

1. Check the project's `spec.md` and `plan.md` for feature requirements
2. Review `research.md` for tech decisions and rationale
3. Look at existing modules in `src/` for code examples
4. Run tests with `--watch` mode to see live feedback
5. Use VS Code's IntelliSense (Ctrl+Space) to explore available functions
6. Ask in project chat/Slack with context (code snippet, error message, expected behavior)

---

## Next Steps

You're now ready to start implementing! Here's the typical flow:

1. Pick a user story from `spec.md` (e.g., "View Albums by Date")
2. Create test file: `src/tests/unit/album-manager.test.js`
3. Write failing test for core logic
4. Implement logic in `src/lib/album-manager.js`
5. Create UI test in `src/tests/integration/album-flow.test.js`
6. Implement UI in `src/ui/album-list.js`
7. Run all checks: `npm run check`
8. Commit with clear message
9. Open PR for review

Good luck! 🚀
