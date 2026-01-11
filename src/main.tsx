import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import App from "./App.tsx";
import "./index.css";

// CRITICAL: Consume OAuth hash tokens BEFORE React mounts
// This prevents race conditions with cached sessions
async function consumeHashTokensIfPresent(): Promise<void> {
  const hash = window.location.hash;
  if (!hash) {
    console.log("[main] No hash in URL");
    return;
  }
  
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const hashType = hashParams.get("type");
  
  // Skip if this is password recovery
  if (hashType === "recovery") {
    console.log("[main] Hash contains recovery type, skipping");
    return;
  }
  
  if (accessToken && refreshToken) {
    console.log("[main] Found OAuth tokens in hash, consuming BEFORE app mount...");
    
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    try {
      // Set the new session from hash tokens
      const { data, error } = await supabase.auth.setSession({ 
        access_token: accessToken, 
        refresh_token: refreshToken 
      });
      
      if (error) {
        console.error("[main] Failed to set session from hash:", error);
      } else {
        console.log("[main] Session set successfully from hash tokens, user:", data.user?.email);
      }
      
      // Clean the URL - remove hash
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      console.log("[main] Cleaned hash from URL");
      
      // Force full page reload to ensure clean provider initialization
      window.location.href = window.location.pathname;
      return; // Stop execution, page will reload
    } catch (err) {
      console.error("[main] Error consuming hash tokens:", err);
    }
  } else if (hash.includes("access_token") || hash.includes("error")) {
    console.log("[main] Hash present but missing required tokens:", { 
      hasAccessToken: hash.includes("access_token"),
      hasRefreshToken: hash.includes("refresh_token"),
      hashPreview: hash.substring(0, 100)
    });
  }
}

// Execute before React mounts
consumeHashTokensIfPresent().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
