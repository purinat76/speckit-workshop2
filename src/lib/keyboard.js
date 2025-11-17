// @ts-nocheck
/**
 * KEYBOARD UTILITIES
 * Handles keyboard navigation and accessibility features
 */

const KEY_CODES = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
};

/**
 * Check if key is Enter
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isEnterKey(event) {
  return event.key === KEY_CODES.ENTER;
}

/**
 * Check if key is Escape
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isEscapeKey(event) {
  return event.key === KEY_CODES.ESCAPE;
}

/**
 * Check if key is Space
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isSpaceKey(event) {
  return event.key === KEY_CODES.SPACE;
}

/**
 * Check if key is Tab
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isTabKey(event) {
  return event.key === KEY_CODES.TAB;
}

/**
 * Check if key is arrow key
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isArrowKey(event) {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
}

/**
 * Check if key is directional (arrow or Home/End)
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean}
 */
function isDirectionalKey(event) {
  return isArrowKey(event) || event.key === KEY_CODES.HOME || event.key === KEY_CODES.END;
}

/**
 * Trap focus within container (prevent Tab key from leaving)
 * @param {HTMLElement} container - Container element
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {void}
 */
function trapFocus(container, event) {
  if (!isTabKey(event)) return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}

/**
 * Focus element with optional smooth scroll
 * @param {HTMLElement} element - Element to focus
 * @param {boolean} smooth - Enable smooth scroll (default: true)
 * @returns {void}
 */
function focusElement(element, smooth = true) {
  if (smooth) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  element.focus();
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive' (default: 'polite')
 * @returns {HTMLElement} ARIA live region element
 */
function announceToScreenReader(message, priority = 'polite') {
  let region = document.querySelector(`[aria-live="${priority}"]`);

  if (!region) {
    region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('class', 'sr-only');
    document.body.appendChild(region);
  }

  region.textContent = message;
  return region;
}

/**
 * Check if element is keyboard-visible (within viewport)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export {
  KEY_CODES,
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isTabKey,
  isArrowKey,
  isDirectionalKey,
  trapFocus,
  focusElement,
  announceToScreenReader,
  isElementInViewport,
};
