/**
 * MAIN APPLICATION ENTRY POINT
 * Initializes the Photo Album Organizer application
 */

// @ts-nocheck
/* eslint-disable no-undef */

import { App } from './app.js';

/**
 * Main application initialization
 * Delegates to App controller for complete setup
 * @async
 */
async function initializeApp() {
  console.log('Initializing Photo Album Organizer...');

  try {
    const app = new App();
    await app.initialize();
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Display error to user
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
      errorContainer.textContent = `Application Error: ${error.message}`;
      errorContainer.style.display = 'block';
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp().catch((error) => {
    console.error('Failed to initialize application:', error);
  });
}

export { initializeApp };
