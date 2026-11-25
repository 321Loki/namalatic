export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<rect width="600" height="400" fill="#e5e9f0"/>
<text x="300" y="205" font-family="Arial, sans-serif" font-size="26" fill="#8a94a6" text-anchor="middle">No image</text>
</svg>`;

export const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

// db stores either an external url (seed data) or "/uploads/xyz.jpg" from our server
export const getImageUrl = (imagePath) => {
  if (!imagePath) return PLACEHOLDER_IMG;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_URL}${imagePath}`;
};

export const truncate = (text = '', max = 120) => {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
};

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

// haversine formula
export const distanceInKm = (from, to) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to[0] - from[0]);
  const dLon = toRad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// turns an axios error into { message } for redux
export const getErrorPayload = (err) => {
  const data = err.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    return { message: Object.values(data.errors).join(', ') };
  }
  if (data?.message) return { message: data.message };
  if (err.code === 'ERR_NETWORK') return { message: 'Cannot reach the server. Is the backend running?' };
  return { message: err.message || 'Something went wrong' };
};
