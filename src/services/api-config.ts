// Central API configuration
// The actual URL will be injected via environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://YOUR_API_GATEWAY_URL_HERE"; // placeholder - replace with actual URL

// Log the API URL on startup for debugging
console.log('[API Config] Base URL:', API_BASE_URL);
if (API_BASE_URL.includes('YOUR_API_GATEWAY_URL_HERE')) {
  console.warn('[API Config] ⚠️ Using placeholder URL! Set VITE_API_BASE_URL environment variable.');
}

export const isApiConfigured = !API_BASE_URL.includes('YOUR_API_GATEWAY_URL_HERE');
