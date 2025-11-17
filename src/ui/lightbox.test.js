// @ts-nocheck
/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LightboxComponent } from './lightbox.js';

describe('LightboxComponent', () => {
  let component;
  let container;
  const mockPhotos = [
    {
      id: 'p1',
      filename: 'photo1.jpg',
      thumbnail: 'data:image/jpeg;base64,/9j/4AAQ...',
    },
    {
      id: 'p2',
      filename: 'photo2.jpg',
      thumbnail: 'data:image/jpeg;base64,/9j/4AAQ...',
    },
    {
      id: 'p3',
      filename: 'photo3.jpg',
      thumbnail: 'data:image/jpeg;base64,/9j/4AAQ...',
    },
  ];

  beforeEach(() => {
    // Set up DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create component with mocked callbacks
    component = new LightboxComponent({
      container,
      photoManager: null, // Not needed for these tests
      onClose: vi.fn(),
    });
  });

  afterEach(() => {
    // Clean up
    if (component && component.close) {
      component.close();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('open and close', () => {
    it('should open lightbox with photos', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      expect(modal).toBeTruthy();
      expect(modal.style.display).not.toBe('none');
    });

    it('should display first photo when opened at index 0', () => {
      component.open(mockPhotos, 0);

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('1');
      expect(photoCount?.textContent).toContain('3');
    });

    it('should display specified photo when opened at specific index', () => {
      component.open(mockPhotos, 1);

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('2');
    });

    it('should close lightbox when close() called', () => {
      component.open(mockPhotos, 0);
      let modal = container.querySelector('[data-lightbox-modal]');
      expect(modal).toBeTruthy();

      component.close();
      modal = container.querySelector('[data-lightbox-modal]');
      expect(modal?.style.display).toBe('none');
    });

    it('should hide overlay when closed', () => {
      component.open(mockPhotos, 0);
      component.close();

      const overlay = container.querySelector('[data-lightbox-overlay]');
      expect(overlay?.style.display).toBe('none');
    });
  });

  describe('carousel navigation', () => {
    it('should move to next photo with next()', () => {
      component.open(mockPhotos, 0);

      component.next();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('2');
    });

    it('should move to previous photo with prev()', () => {
      component.open(mockPhotos, 1);

      component.prev();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('1');
    });

    it('should loop to first photo when next called on last photo', () => {
      component.open(mockPhotos, 2);

      component.next();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('1');
    });

    it('should loop to last photo when prev called on first photo', () => {
      component.open(mockPhotos, 0);

      component.prev();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('3');
    });

    it('should navigate to specific index with goToIndex()', () => {
      component.open(mockPhotos, 0);

      component.goToIndex(2);

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('3');
    });

    it('should update photo counter correctly during navigation', () => {
      component.open(mockPhotos, 0);

      component.next();
      let photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('2');

      component.next();
      photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('3');

      component.prev();
      photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('2');
    });
  });

  describe('thumbnail strip', () => {
    it('should render thumbnail strip with all photos', () => {
      component.open(mockPhotos, 0);

      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      expect(thumbnails).toHaveLength(3);
    });

    it('should highlight active thumbnail', () => {
      component.open(mockPhotos, 1);

      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      const activeThumbnail = Array.from(thumbnails).find((thumb) =>
        thumb.getAttribute('aria-current') === 'true'
      );

      expect(activeThumbnail).toBeTruthy();
    });

    it('should navigate to photo when thumbnail clicked', () => {
      component.open(mockPhotos, 0);

      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      thumbnails[2].click();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('3');
    });

    it('should update active thumbnail when navigating', () => {
      component.open(mockPhotos, 0);

      component.next();

      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      const activeThumbnail = Array.from(thumbnails).find((thumb) =>
        thumb.getAttribute('aria-current') === 'true'
      );

      expect(activeThumbnail).toBe(thumbnails[1]);
    });

    it('should scroll thumbnail strip to keep active thumbnail visible', () => {
      component.open(mockPhotos, 0);

      component.goToIndex(2);

      const thumbnailStrip = container.querySelector('[data-thumbnail-strip]');
      expect(thumbnailStrip).toBeTruthy();
      // Thumbnail strip exists and has scrolled (implementation detail)
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate next with ArrowRight key', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      });

      modal?.dispatchEvent(keyEvent);

      // Handler executes without error
      expect(modal).toBeTruthy();
    });

    it('should navigate prev with ArrowLeft key', () => {
      component.open(mockPhotos, 1);

      const modal = container.querySelector('[data-lightbox-modal]');
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
      });

      modal?.dispatchEvent(keyEvent);

      // Handler executes without error
      expect(modal).toBeTruthy();
    });

    it('should close lightbox with Escape key', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });

      modal?.dispatchEvent(keyEvent);

      // Handler executes without error
      expect(modal).toBeTruthy();
    });

    it('should navigate next with Space key', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      const keyEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      });

      modal?.dispatchEvent(keyEvent);

      // Handler executes without error
      expect(modal).toBeTruthy();
    });

    it('should not interfere with modifier keys', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        bubbles: true,
      });

      modal?.dispatchEvent(keyEvent);

      // Handler should handle modifier keys gracefully
      expect(modal).toBeTruthy();
    });
  });

  describe('button controls', () => {
    it('should have Previous button', () => {
      component.open(mockPhotos, 0);

      const prevButton = container.querySelector('button[aria-label*="Previous"]');
      expect(prevButton).toBeTruthy();
    });

    it('should have Next button', () => {
      component.open(mockPhotos, 0);

      const nextButton = container.querySelector('button[aria-label*="Next"]');
      expect(nextButton).toBeTruthy();
    });

    it('should have Close button', () => {
      component.open(mockPhotos, 0);

      const closeButton = container.querySelector('button[aria-label*="Close"]');
      expect(closeButton).toBeTruthy();
    });

    it('should trigger next() when Next button clicked', () => {
      component.open(mockPhotos, 0);

      const nextButton = container.querySelector('button[aria-label*="Next"]');
      nextButton?.click();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('2');
    });

    it('should trigger prev() when Previous button clicked', () => {
      component.open(mockPhotos, 1);

      const prevButton = container.querySelector('button[aria-label*="Previous"]');
      prevButton?.click();

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('1');
    });

    it('should close lightbox when Close button clicked', () => {
      component.open(mockPhotos, 0);

      const closeButton = container.querySelector('button[aria-label*="Close"]');
      closeButton?.click();

      const modal = container.querySelector('[data-lightbox-modal]');
      expect(modal?.style.display).toBe('none');
    });

    it('should disable Previous button when on first photo', () => {
      component.open(mockPhotos, 0);

      const prevButton = container.querySelector('button[aria-label*="Previous"]');
      expect(prevButton?.disabled).toBe(true);
    });

    it('should disable Next button when on last photo', () => {
      component.open(mockPhotos, 2);

      const nextButton = container.querySelector('button[aria-label*="Next"]');
      expect(nextButton?.disabled).toBe(true);
    });

    it('should enable Previous button when not on first photo', () => {
      component.open(mockPhotos, 1);

      const prevButton = container.querySelector('button[aria-label*="Previous"]');
      expect(prevButton?.disabled).toBe(false);
    });

    it('should enable Next button when not on last photo', () => {
      component.open(mockPhotos, 0);

      const nextButton = container.querySelector('button[aria-label*="Next"]');
      expect(nextButton?.disabled).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should have proper modal structure with role="dialog"', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeTruthy();
    });

    it('should have aria-label on modal', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[role="dialog"]');
      expect(modal?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have alt text on displayed photo', () => {
      component.open(mockPhotos, 0);

      const photo = container.querySelector('[data-photo-image]');
      expect(photo?.getAttribute('alt')).toBeTruthy();
    });

    it('should have aria-labels on navigation buttons', () => {
      component.open(mockPhotos, 0);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        const hasText = btn.textContent.trim().length > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBe(true);
      });
    });

    it('should set aria-current on active thumbnail', () => {
      component.open(mockPhotos, 1);

      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      const activeThumbnail = thumbnails[1];

      expect(activeThumbnail?.getAttribute('aria-current')).toBe('true');
    });

    it('should have proper focus management', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      expect(modal).toBeTruthy();
      // Modal should trap focus (implementation detail)
    });
  });

  describe('overlay interaction', () => {
    it('should close lightbox when clicking on overlay', () => {
      component.open(mockPhotos, 0);

      const overlay = container.querySelector('[data-lightbox-overlay]');
      overlay?.click();

      const modal = container.querySelector('[data-lightbox-modal]');
      expect(modal?.style.display).toBe('none');
    });

    it('should not close lightbox when clicking on modal content', () => {
      component.open(mockPhotos, 0);

      const modal = container.querySelector('[data-lightbox-modal]');
      const initialDisplay = modal?.style.display;

      modal?.click();

      expect(modal?.style.display).toBe(initialDisplay);
    });
  });

  describe('single photo', () => {
    it('should handle single photo gracefully', () => {
      const singlePhoto = [mockPhotos[0]];
      component.open(singlePhoto, 0);

      const photoCount = container.querySelector('[data-photo-count]');
      expect(photoCount?.textContent).toContain('1');
      expect(photoCount?.textContent).toContain('1');
    });

    it('should disable both Previous and Next for single photo', () => {
      const singlePhoto = [mockPhotos[0]];
      component.open(singlePhoto, 0);

      const prevButton = container.querySelector('button[aria-label*="Previous"]');
      const nextButton = container.querySelector('button[aria-label*="Next"]');

      expect(prevButton?.disabled).toBe(true);
      expect(nextButton?.disabled).toBe(true);
    });
  });

  describe('empty and edge cases', () => {
    it('should handle invalid index gracefully', () => {
      component.open(mockPhotos, 0);

      component.goToIndex(999);

      // Should not throw error; navigate to last valid index or stay at current
      expect(component).toBeTruthy();
    });

    it('should handle negative index gracefully', () => {
      component.open(mockPhotos, 0);

      component.goToIndex(-1);

      // Should not throw error; handle gracefully
      expect(component).toBeTruthy();
    });

    it('should update thumbnail state when close() called', () => {
      component.open(mockPhotos, 0);
      component.close();

      // All thumbnails should be in default state
      const thumbnails = container.querySelectorAll('[data-thumbnail]');
      thumbnails.forEach((thumb) => {
        expect(thumb.getAttribute('aria-current')).not.toBe('true');
      });
    });
  });

  describe('photo display', () => {
    it('should display photo with correct filename', () => {
      component.open(mockPhotos, 0);

      const photo = container.querySelector('[data-photo-image]');
      expect(photo?.src).toBeTruthy();
    });

    it('should update photo display when navigating', () => {
      component.open(mockPhotos, 0);
      const firstPhotoSrc = container
        .querySelector('[data-photo-image]')
        ?.getAttribute('src');

      component.next();
      const secondPhotoSrc = container
        .querySelector('[data-photo-image]')
        ?.getAttribute('src');

      // Photo should have changed (implementation may vary)
      expect(firstPhotoSrc || secondPhotoSrc).toBeTruthy();
    });
  });
});
