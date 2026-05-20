import { API_ORIGIN } from '../services/apiConfig';

const PLACEHOLDER_BG = '938359';

export const getPlaceholderImage = (name = 'Item', bg = PLACEHOLDER_BG) => {
  const initials = String(name || 'Item').substring(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&bold=true`;
};

const parseObjectString = (value) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) return null;

  const match =
    trimmed.match(/secure_url:\s*['"]([^'"]+)['"]/i) ||
    trimmed.match(/"secure_url":\s*['"]([^'"]+)['"]/i) ||
    trimmed.match(/url:\s*['"]([^'"]+)['"]/i) ||
    trimmed.match(/"url":\s*['"]([^'"]+)['"]/i) ||
    trimmed.match(/path:\s*['"]([^'"]+)['"]/i) ||
    trimmed.match(/"path":\s*['"]([^'"]+)['"]/i);

  if (match?.[1]) return match[1];

  try {
    const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
    return extractImageValue(parsed);
  } catch {
    return null;
  }
};

const extractImageValue = (image) => {
  if (!image) return null;

  if (Array.isArray(image)) {
    for (const item of image) {
      const resolved = extractImageValue(item);
      if (resolved) return resolved;
    }
    return null;
  }

  if (typeof image === 'object') {
    return (
      extractImageValue(image.secure_url) ||
      extractImageValue(image.url) ||
      extractImageValue(image.path) ||
      extractImageValue(image.Location) ||
      extractImageValue(image.image) ||
      extractImageValue(image.images)
    );
  }

  if (typeof image !== 'string') return null;

  const value = image.trim();
  if (!value || value === '[object Object]' || value === 'no-photo.jpg') return null;

  return parseObjectString(value) || value;
};

export const resolveImageUrl = (image, name = 'Item', options = {}) => {
  const value = extractImageValue(image);
  if (!value) {
    return Object.prototype.hasOwnProperty.call(options, 'fallback')
      ? options.fallback
      : getPlaceholderImage(name, options.bg);
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  const cleanPath = value.replace(/\\/g, '/');
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${API_ORIGIN}${normalizedPath}`;
};
