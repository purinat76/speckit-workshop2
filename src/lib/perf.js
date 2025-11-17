// @ts-nocheck
/**
 * PERFORMANCE MONITORING UTILITIES
 * Tracks performance metrics and logs performance data
 */

/**
 * Performance marker instance
 */
class PerformanceMarker {
  /**
   * @param {string} name - Marker name
   * @param {number} startTime - Start time in ms
   */
  constructor(name, startTime) {
    this.name = name;
    this.startTime = startTime;
    this.endTime = null;
    this.duration = null;
  }

  /**
   * End the marker and calculate duration
   * @returns {number} Duration in ms
   */
  end() {
    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
    return this.duration;
  }

  /**
   * Get marker data
   * @returns {object}
   */
  toJSON() {
    return {
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
    };
  }
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  constructor() {
    this.markers = new Map();
    this.measurements = new Map();
    this.enabled = true;
  }

  /**
   * Start a performance marker
   * @param {string} name - Marker name
   * @returns {PerformanceMarker} Marker instance
   */
  start(name) {
    if (!this.enabled) return null;

    const marker = new PerformanceMarker(name, performance.now());
    this.markers.set(name, marker);
    return marker;
  }

  /**
   * End a performance marker
   * @param {string} name - Marker name
   * @returns {number|null} Duration in ms or null if not found
   */
  end(name) {
    if (!this.enabled) return null;

    const marker = this.markers.get(name);
    if (!marker) return null;

    const duration = marker.end();

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }

    this.measurements.get(name).push(duration);
    return duration;
  }

  /**
   * Measure operation wrapped in try-finally
   * @param {string} name - Marker name
   * @param {Function} operation - Operation to measure
   * @returns {*} Operation return value
   */
  measure(name, operation) {
    const marker = this.start(name);
    try {
      return operation();
    } finally {
      if (marker) this.end(name);
    }
  }

  /**
   * Measure async operation
   * @param {string} name - Marker name
   * @param {Function} asyncOperation - Async operation to measure
   * @returns {Promise<*>} Promise with operation return value
   */
  async measureAsync(name, asyncOperation) {
    const marker = this.start(name);
    try {
      return await asyncOperation();
    } finally {
      if (marker) this.end(name);
    }
  }

  /**
   * Get average duration for marker
   * @param {string} name - Marker name
   * @returns {number|null} Average duration or null if not found
   */
  getAverage(name) {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  /**
   * Get all measurements
   * @returns {object} Map of measurements
   */
  getMeasurements() {
    const result = {};
    this.measurements.forEach((durations, name) => {
      result[name] = {
        count: durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        total: durations.reduce((a, b) => a + b, 0),
      };
    });
    return result;
  }

  /**
   * Clear all measurements
   * @returns {void}
   */
  clear() {
    this.markers.clear();
    this.measurements.clear();
  }

  /**
   * Log measurements to console
   * @returns {void}
   */
  logMeasurements() {
    const measurements = this.getMeasurements();
    console.table(measurements);
  }

  /**
   * Disable performance monitoring
   * @returns {void}
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Enable performance monitoring
   * @returns {void}
   */
  enable() {
    this.enabled = true;
  }
}

// Global instance
const performanceMonitor = new PerformanceMonitor();

export { PerformanceMonitor, PerformanceMarker, performanceMonitor };
