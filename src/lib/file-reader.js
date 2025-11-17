// @ts-nocheck
/* eslint-disable no-undef */

/**
 * FILE READER UTILITIES
 * Extract metadata from image files and prepare for storage
 */

/**
 * Load photos from file list
 * @param {FileList|File[]} files - Files to process
 * @returns {Promise<object[]>} Array of photo metadata objects
 */
export async function loadPhotosFromFiles(files) {
  const fileArray = Array.from(files);
  const validFiles = fileArray.filter((file) => isValidImageFile(file));

  if (validFiles.length === 0) {
    throw new Error('No valid image files found');
  }

  const photoPromises = validFiles.map((file) => extractPhotoMetadata(file));
  const results = await Promise.allSettled(photoPromises);

  const successfulPhotos = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  const failedCount = results.filter((result) => result.status === 'rejected').length;

  return {
    photos: successfulPhotos,
    failedCount,
    totalCount: validFiles.length,
  };
}

/**
 * Check if file is a valid image type
 * @param {File} file - File to validate
 * @returns {boolean} True if valid image
 */
export function isValidImageFile(file) {
  if (!file) return false;
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Extract metadata from image file
 * @param {File} file - Image file
 * @returns {Promise<object>} Photo metadata
 */
export async function extractPhotoMetadata(file) {
  const [dimensions, dataUrl] = await Promise.all([
    getImageDimensions(file),
    readFileAsDataURL(file),
  ]);

  return {
    filename: file.name,
    file_size: file.size,
    mime_type: file.type,
    width: dimensions.width,
    height: dimensions.height,
    last_modified: file.lastModified,
    data_url: dataUrl,
    file, // Keep reference for thumbnail generation
  };
}

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Read file as Data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} Data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extract EXIF date from JPEG file (basic implementation)
 * @param {File} file - JPEG file
 * @returns {Promise<number|null>} Timestamp or null if not found
 */
export async function extractExifDate(file) {
  // Basic EXIF parsing - looks for DateTimeOriginal tag
  // For production, consider using exifjs library
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Check for JPEG marker
    if (view.getUint16(0) !== 0xffd8) {
      return null; // Not a JPEG
    }

    // Simple EXIF search (very basic, doesn't handle all cases)
    // In production, use a proper EXIF library
    return null; // Placeholder - would parse EXIF tags here
  } catch (error) {
    console.warn('EXIF extraction failed:', error);
    return null;
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate file size (max 10MB per file)
 * @param {File} file - File to validate
 * @param {number} maxSizeBytes - Maximum size in bytes (default: 10MB)
 * @returns {boolean} True if file size is valid
 */
export function validateFileSize(file, maxSizeBytes = 10 * 1024 * 1024) {
  return file.size <= maxSizeBytes;
}

/**
 * Group photos by capture date for album assignment
 * @param {object[]} photos - Photo metadata array
 * @returns {Map<string, object[]>} Photos grouped by YYYY-MM date
 */
export function groupPhotosByDate(photos) {
  const groups = new Map();

  photos.forEach((photo) => {
    const date = new Date(photo.last_modified);
    const groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    groups.get(groupKey).push(photo);
  });

  return groups;
}
