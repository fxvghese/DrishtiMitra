/**
 * DrishtiMitra - File & Input Validators
 */

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check extension or mime
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const validExtension = /\.(jpe?g|png|webp|heic|heif)$/i.test(name);

  if (!ALLOWED_MIME_TYPES.has(type) && !validExtension) {
    return {
      valid: false,
      error: `Unsupported file format '${file.name}'. Please upload JPEG, PNG, WEBP, or HEIC images.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File '${file.name}' exceeds the 15MB upload limit.`,
    };
  }

  return { valid: true };
}
