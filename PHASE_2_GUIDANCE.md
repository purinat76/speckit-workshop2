# Implementation Phase 2 Guidance

**Date**: 2025-11-17 | **Branch**: `1-photo-albums` | **Current Phase**: 0 (TASK-001 & TASK-002 complete)

---

## Understanding "Phase 2" in the Workflow

There are **two different "Phase 2" concepts** in this project:

### 1. **Implementation Workflow Phase 2** (Specification Generation)
This is the second phase of the speckit workflow:
- ✅ **Phase 0**: Analyze (constitution, specification complete)
- ✅ **Phase 1**: Plan (planning, research, data model, contracts, tasks, analysis)
- ⏳ **Phase 2**: Implement (currently starting - TASK-001 just completed)
- ⏳ **Phase 3**: Deploy/Release (future)

**Status**: You are NOW at the beginning of Implementation Workflow Phase 2.

### 2. **Feature Development Phase 2** (From tasks.md)
This refers to the feature phases for building the Photo Album Organizer:
- 🟢 **PHASE 0**: Foundation (TASK-001 to TASK-010) - IN PROGRESS
- 🔴 **PHASE 1**: P1 Features (TASK-011 to TASK-020) - BLOCKED (waiting on Phase 0)
- 🔴 **PHASE 2**: P2 Features (TASK-021 to TASK-030) - BLOCKED (waiting on Phase 1)
- 🔴 **PHASE 3**: QA & Testing (TASK-031 to TASK-036) - BLOCKED (waiting on Phase 2)

**Status**: Not yet ready; Phase 0 still in progress.

---

## Current Development Status

### ✅ Completed
- TASK-001: Initialize Vite project with tooling
- TASK-002: Create HTML structure & design tokens

### ⏳ In Queue (Next to Implement)
- **TASK-003**: Implement Storage Layer (SQLite + IndexedDB)
- **TASK-004**: Implement Album Manager (CRUD operations)
- **TASK-005**: Implement Photo Manager (CRUD + thumbnails)
- **TASK-006**: Implement State Management
- **TASK-007**: Implement Date Formatting Utilities
- **TASK-008**: Implement Keyboard & Accessibility Utilities
- **TASK-009**: Implement Performance Monitoring Utilities
- **TASK-010**: Unit Tests for Phase 0 (≥80% coverage gate)

### 🔴 Blocked (Waiting on Phase 0 Completion)
- PHASE 1 (TASK-011 to TASK-020): All P1 features blocked until TASK-010 passes

---

## Recommended Next Steps

### Immediate (Next 1-3 days)
Complete remaining Phase 0 tasks in order:

1. **TASK-003**: Storage Layer
   - SQLite wrapper using sql.js
   - IndexedDB persistence
   - Album, Photo, AlbumOrganization tables
   - CRUD operations with transactions
   - Error handling classes
   - Expected time: 1-2 days
   - Blocker for: TASK-004, TASK-005, TASK-018

2. **TASK-004**: Album Manager
   - Album CRUD: create, read, update, delete
   - Date-based grouping
   - Display order management (for drag reordering)
   - Undated album handling
   - Expected time: 0.5-1 day
   - Depends on: TASK-003

3. **TASK-005**: Photo Manager
   - Photo CRUD: create, read, delete
   - Thumbnail generation (Canvas API)
   - Metadata extraction (EXIF, dimensions)
   - Photo count denormalization
   - Expected time: 1 day
   - Depends on: TASK-003

### Short-term (Days 3-5)
Complete remaining Phase 0 utilities and tests:

4. **TASK-006**: State Management
   - AppState class with getters/setters
   - Event emission on state changes
   - Session storage persistence
   - Expected time: 0.5 day

5. **TASK-007**: Date Utilities
   - Date parsing and formatting
   - Date grouping by calendar day
   - Edge cases (null, invalid dates)
   - Expected time: 0.5 day

6. **TASK-008**: Keyboard & Accessibility Utilities
   - Keyboard event detection
   - Focus management
   - Screen reader announcements
   - Expected time: 0.5 day

7. **TASK-009**: Performance Monitoring
   - Custom performance timers
   - SLO tracking (album load, drag latency)
   - Warnings on threshold breach
   - Expected time: 0.5 day

8. **TASK-010**: Phase 0 Test Suite
   - ≥80% coverage on all modules
   - All code paths tested
   - Edge cases covered
   - Expected time: 1-2 days
   - **GATE**: Must pass before Phase 1 starts

### Medium-term (Week 2)
Begin Phase 1 after TASK-010 passes:

9. **TASK-011 to TASK-020**: P1 Features
   - Album list view
   - Album detail view
   - Lightbox viewer
   - Drag-and-drop (mouse, keyboard, touch)
   - Responsive layout
   - Navigation & state management
   - File upload & photo loading
   - Phase 1 tests (≥80% coverage)
   - Expected time: 5-7 days

---

## Phase 2 (P2 Features) - When Applicable

**IMPORTANT**: Phase 2 cannot start until:
- ✅ Phase 0 complete (all 10 tasks)
- ✅ Phase 1 complete (all 10 tasks)
- ✅ TASK-020 test gate passing (≥80% coverage)

Once Phase 1 is complete, Phase 2 features become available:

### TASK-021 to TASK-030 (P2 Features - Estimated Week 3)
These are polish and enhancement features:

| Task | Feature | Est. Time | Priority |
|------|---------|-----------|----------|
| TASK-021 | Enhanced Navigation (breadcrumbs, history) | 0.5 day | Medium |
| TASK-022 | Month/Year View Filters | 1 day | Medium |
| TASK-023 | Album Search | 1 day | Low |
| TASK-024 | Batch Photo Operations | 1.5 days | Low |
| TASK-025 | Export/Backup | 1 day | Low |
| TASK-026 | Dark Mode | 0.5 day | Medium |
| TASK-027 | Performance Optimization | 1-2 days | High |
| TASK-028 | Accessibility Audit & Fixes | 1 day | High |
| TASK-029 | Cross-Browser Testing | 1 day | High |
| TASK-030 | Documentation & Examples | 1 day | Medium |

---

## Recommended Action NOW

**To move toward Phase 2 implementation, follow this sequence:**

```
START HERE:
┌─────────────────────────────────────────────────────────┐
│ 1. Implement TASK-003: Storage Layer (sql.js + IDB)    │
│    (Prerequisite for all managers)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Implement TASK-004 & TASK-005: Managers             │
│    (Album CRUD, Photo CRUD, thumbnails)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Implement TASK-006 to TASK-009: Utilities           │
│    (State, date-format, keyboard, perf)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Implement TASK-010: Phase 0 Tests                   │
│    (≥80% coverage gate - MUST PASS)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ✅ PHASE 0 COMPLETE
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Implement TASK-011 to TASK-020: P1 Features        │
│    (Album list, detail, lightbox, drag-drop, etc)     │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ✅ PHASE 1 COMPLETE
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Implement TASK-021 to TASK-030: P2 Features        │
│    (Navigation, filters, search, dark mode, perf)     │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ✅ PHASE 2 COMPLETE
```

---

## Implementation Checklist for Phase 2 Readiness

To be ready to start Phase 2 (P2 Features) implementation:

### Prerequisites for Phase 2:

**Phase 0 Complete** ✅ (IN PROGRESS)
- [ ] TASK-003: Storage Layer 100% complete with tests
- [ ] TASK-004: Album Manager 100% complete with tests
- [ ] TASK-005: Photo Manager 100% complete with tests
- [ ] TASK-006: State Management 100% complete with tests
- [ ] TASK-007: Date Utilities 100% complete with tests
- [ ] TASK-008: Keyboard Utilities 100% complete with tests
- [ ] TASK-009: Performance Monitoring 100% complete with tests
- [ ] TASK-010: Phase 0 Test Suite passes (≥80% coverage)

**Phase 1 Complete** ❌ (NOT YET)
- [ ] TASK-011: Album List View component
- [ ] TASK-012: Album Detail View component
- [ ] TASK-013: Lightbox viewer component
- [ ] TASK-014: Mouse drag-and-drop handler
- [ ] TASK-015: Keyboard & touch drag-and-drop
- [ ] TASK-016: Responsive layout
- [ ] TASK-017: Navigation & state management
- [ ] TASK-018: Photo loading & file handling
- [ ] TASK-019: Settings/Preferences
- [ ] TASK-020: Phase 1 integration tests (≥80% coverage, user journeys)

**Only after ALL above are complete**: Phase 2 becomes active

---

## Summary

### Current Status
- **Workflow Phase**: 2 (Implementation started)
- **Feature Phase**: 0 (Foundation - 20% complete)
- **Next Task**: TASK-003 (Storage Layer)
- **Time to Phase 2 Ready**: ~2-3 weeks (with continuous development)

### To Start Phase 2 Work
1. Complete Phase 0 foundation (TASK-003 to TASK-010)
2. Complete Phase 1 P1 features (TASK-011 to TASK-020)
3. Both must pass ≥80% test coverage gates
4. Then Phase 2 (TASK-021 to TASK-030) becomes available

### Quick Start
```bash
# To continue from TASK-003:
npm install          # Install dependencies (one-time)
npm run dev          # Start dev server
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
# Implement TASK-003 storage layer next
```

---

**Recommendation**: Focus on completing Phase 0 first. Phase 2 features will become available after Phase 1 is complete. Estimated timeline: 2-3 weeks of continuous development.

