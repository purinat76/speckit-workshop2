// @ts-nocheck
/* eslint-disable no-undef */
/**
 * UTILITIES TESTS - Phase 0 Gate Coverage
 * Tests for state, date formatting, keyboard, and performance monitoring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AppState } from '../src/lib/state.js';
import {
  formatToGroupDate,
  formatGroupDate,
  formatTimestamp,
  formatDateTime,
  formatTimeAgo,
} from '../src/lib/date-format.js';
import {
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isArrowKey,
  announceToScreenReader,
} from '../src/lib/keyboard.js';
import { PerformanceMonitor } from '../src/lib/perf.js';

describe('AppState', () => {
  let state;

  beforeEach(() => {
    state = new AppState();
  });

  it('should initialize with default state', () => {
    const s = state.getState();
    expect(s.albums).toEqual([]);
    expect(s.currentAlbum).toBeNull();
    expect(s.selectedPhotos).toBeInstanceOf(Set);
    expect(s.viewMode).toBe('grid');
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('should notify listeners on state change', () => {
    let called = false;
    let lastState;

    const unsubscribe = state.subscribe((s) => {
      called = true;
      lastState = s;
    });

    state.setAlbums([{ id: '1', name: 'Test' }]);

    expect(called).toBe(true);
    expect(lastState.albums).toHaveLength(1);

    unsubscribe();
  });

  it('should handle multiple subscribers', () => {
    let count = 0;

    state.subscribe(() => count++);
    state.subscribe(() => count++);

    state.setLoading(true);

    expect(count).toBe(2);
  });

  it('should manage photo selection', () => {
    state.selectPhoto('photo-1');
    expect(state.state.selectedPhotos.has('photo-1')).toBe(true);

    state.deselectPhoto('photo-1');
    expect(state.state.selectedPhotos.has('photo-1')).toBe(false);
  });

  it('should toggle photo selection', () => {
    state.togglePhotoSelection('photo-1');
    expect(state.state.selectedPhotos.has('photo-1')).toBe(true);

    state.togglePhotoSelection('photo-1');
    expect(state.state.selectedPhotos.has('photo-1')).toBe(false);
  });

  it('should clear selection', () => {
    state.selectPhoto('photo-1');
    state.selectPhoto('photo-2');

    state.clearSelection();
    expect(state.state.selectedPhotos.size).toBe(0);
  });
});

describe('Date Formatting', () => {
  it('should format date to group date', () => {
    const date = new Date('2025-06-15');
    const result = formatToGroupDate(date);
    expect(result).toBe('2025-06');
  });

  it('should format timestamp to group date', () => {
    const timestamp = new Date('2025-06-15').getTime();
    const result = formatToGroupDate(timestamp);
    expect(result).toBe('2025-06');
  });

  it('should format group date to readable format', () => {
    const result = formatGroupDate('2025-06');
    expect(result).toContain('June');
    expect(result).toContain('2025');
  });

  it('should format timestamp to date', () => {
    const timestamp = new Date('2025-06-15').getTime();
    const result = formatTimestamp(timestamp, 'en-US');
    expect(result).toContain('2025');
  });

  it('should format timestamp to date-time', () => {
    const timestamp = new Date('2025-06-15 14:30').getTime();
    const result = formatDateTime(timestamp, 'en-US');
    expect(result).toContain('2025');
  });

  it('should format time ago', () => {
    const now = Date.now();
    expect(formatTimeAgo(now)).toContain('ago');
  });

  it('should say "just now" for recent timestamp', () => {
    const now = Date.now();
    const result = formatTimeAgo(now - 1000);
    expect(result).toBe('just now');
  });
});

describe('Keyboard Utilities', () => {
  it('should detect Enter key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    expect(isEnterKey(event)).toBe(true);
  });

  it('should detect Escape key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(isEscapeKey(event)).toBe(true);
  });

  it('should detect Space key', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    expect(isSpaceKey(event)).toBe(true);
  });

  it('should detect arrow keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    expect(isArrowKey(event)).toBe(true);
  });

  it('should announce to screen readers', () => {
    const region = announceToScreenReader('Test message');
    expect(region).toBeDefined();
    expect(region.textContent).toBe('Test message');
  });
});

describe('Performance Monitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should start and end markers', () => {
    const marker = monitor.start('test');
    expect(marker).toBeDefined();

    // Small delay to ensure measurable time
    const start = performance.now();
    while (performance.now() - start < 1) {
      // Spin for ~1ms
    }

    const duration = monitor.end('test');
    expect(duration).toBeGreaterThan(0);
  });

  it('should measure synchronous operations', () => {
    const result = monitor.measure('add', () => {
      return 1 + 1;
    });

    expect(result).toBe(2);
    expect(monitor.getAverage('add')).toBeGreaterThan(0);
  });

  it('should measure async operations', async () => {
    const result = await monitor.measureAsync('async-test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'done';
    });

    expect(result).toBe('done');
    expect(monitor.getAverage('async-test')).toBeGreaterThan(0);
  });

  it('should get measurements statistics', () => {
    monitor.measure('test', () => 1 + 1);
    monitor.measure('test', () => 1 + 1);

    const measurements = monitor.getMeasurements();
    expect(measurements.test.count).toBe(2);
    expect(measurements.test.min).toBeGreaterThan(0);
    expect(measurements.test.max).toBeGreaterThanOrEqual(measurements.test.min);
    expect(measurements.test.avg).toBeGreaterThan(0);
  });

  it('should clear measurements', () => {
    monitor.measure('test', () => 1 + 1);
    monitor.clear();

    const measurements = monitor.getMeasurements();
    expect(Object.keys(measurements)).toHaveLength(0);
  });

  it('should respect enable/disable', () => {
    monitor.disable();
    const result = monitor.start('test');
    expect(result).toBeNull();

    monitor.enable();
    const marker = monitor.start('test');
    expect(marker).toBeDefined();
  });
});
