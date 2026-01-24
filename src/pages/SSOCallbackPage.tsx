import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * SSO Callback Page
 * 
 * Handles the OAuth-style callback from the deeplink-sso edge function.
 * Consumes session tokens from URL hash/query and redirects to the editor.
 */
export default function SSOCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error" | "success">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get video_id from query params
        const videoId = searchParams.get("video_id");
        const pendingAuth = searchParams.get("pending_auth");
        
        // Check if we have tokens in the hash (from magic link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // If we have tokens in hash, set the session
        if (accessToken && refreshToken) {
          console.log("Setting session from hash tokens");
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setStatus("error");
            setErrorMessage("Failed to establish session. Please try again.");
            return;
          }

          // Clean the URL
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }

        // Check if we already have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && pendingAuth) {
          // User came from SSO but magic link hasn't been clicked yet
          // This shouldn't happen in the normal flow, but handle it
          console.log("No session yet, waiting for auth...");
          
          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === "SIGNED_IN" && newSession) {
              console.log("Session established via auth state change");
              subscription.unsubscribe();
              redirectToEditor(videoId);
            }
          });

          // Set a timeout
          setTimeout(() => {
            subscription.unsubscribe();
            if (status === "processing") {
              setStatus("error");
              setErrorMessage("Session timeout. Please try the link again.");
            }
          }, 30000);
          
          return;
        }

        if (!session) {
          // Check hash one more time for edge cases
          await supabase.auth.getSession();
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (!retrySession) {
            console.error("No session established");
            setStatus("error");
            setErrorMessage("Authentication failed. Please try the link again.");
            return;
          }
        }

        // Session is established, redirect to editor
        redirectToEditor(videoId);

      } catch (err) {
        console.error("SSO callback error:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    const redirectToEditor = (videoId: string | null) => {
      setStatus("success");
      
      // Store video_id for the editor to pick up
      if (videoId) {
        sessionStorage.setItem("sso_video_id", videoId);
      }
      
      // Short delay for visual feedback, then redirect
      setTimeout(() => {
        // Navigate to index - the Index page will handle loading the correct video
        navigate("/", { replace: true });
      }, 500);
    };

    handleCallback();
  }, [navigate, searchParams, status]);

  const handleRetry = () => {
    // Clear any stored data and go back to ryl
    sessionStorage.removeItem("sso_video_id");
    window.location.href = "https://ryl.zone";
  };

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Authentication Error
          </h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Ryl
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center p-8">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Shopable Studio
          </h1>
          <p className="text-muted-foreground">
            Redirecting to editor...
          </p>
        </div>
      </div>
    );
  }

  // Processing state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Signing you in...
        </h1>
        <p className="text-muted-foreground">
          Please wait while we set up your session
        </p>
      </div>
    </div>
  );
}
