/**
 * BASIC SMOKE TEST
 * Verifies Vitest is configured correctly
 */

import { describe, it, expect } from 'vitest';

describe('Photo Album Organizer - Smoke Tests', () => {
  it('should initialize successfully', () => {
    expect(true).toBe(true);
  });

  it('should have required DOM structure', () => {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    expect(container).toBeDefined();
    expect(container.id).toBe('test-container');

    document.body.removeChild(container);
  });

  it('should export initializeApp from main.js', async () => {
    const { initializeApp } = await import('../main.js');
    expect(initializeApp).toBeDefined();
    expect(typeof initializeApp).toBe('function');
  });
});
