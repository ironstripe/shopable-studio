// src/lib/api-config.ts

// Single source of truth for the backend base URL.
// Prefer VITE_API_BASE_URL from the environment, otherwise fall back to your live API Gateway URL.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://skyc5xwjcf.execute-api.eu-west-1.amazonaws.com";

// Simple flag if config is sane (no placeholder left)
export const isApiConfigured = !!API_BASE_URL && !API_BASE_URL.includes("YOUR_API_GATEWAY_URL_HERE");

// Log once at startup for debugging
console.log("[API Config] Base URL:", API_BASE_URL);
if (!isApiConfigured) {
  console.warn("[API Config] ⚠️ API base URL looks like a placeholder. Set VITE_API_BASE_URL in your environment.");
}
