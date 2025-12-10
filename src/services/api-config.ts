// src/services/api-config.ts

// Base URL for the backend API (Lambda / API Gateway)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://skyc5xwjcf.execute-api.eu-west-1.amazonaws.com";

// Simple flag to detect misconfiguration in dev
export const isApiConfigured = !!API_BASE_URL && !API_BASE_URL.includes("YOUR_API_GATEWAY_URL_HERE");

// Debug log on startup
console.log("[API Config] Base URL:", API_BASE_URL);

if (!isApiConfigured) {
  console.warn(
    "[API Config] ⚠️ API_BASE_URL looks misconfigured. " +
      "Set VITE_API_BASE_URL in your environment to your API Gateway URL.",
  );
}
