// src/services/api-config.ts

// Prefer environment variable (Lovable sets this automatically)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://skyc5xwjcf.execute-api.eu-west-1.amazonaws.com"; // fallback to prod API

// Helper flag
export const isApiConfigured = !!API_BASE_URL && !API_BASE_URL.includes("YOUR_API_GATEWAY_URL_HERE");

// Debug log
console.log("[API Config] Base URL:", API_BASE_URL);

if (!isApiConfigured) {
  console.warn("[API Config] ⚠️ API base URL is not properly configured. Set VITE_API_BASE_URL in your environment.");
}
