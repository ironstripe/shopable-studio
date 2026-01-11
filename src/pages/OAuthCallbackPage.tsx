import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CallbackStatus = "processing" | "error" | "success";

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const searchType = url.searchParams.get("type");
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashType = hashParams.get("type");
      const hashAccessToken = hashParams.get("access_token");
      const hashRefreshToken = hashParams.get("refresh_token");
      const isRecovery = searchType === "recovery" || hashType === "recovery";

      console.log("[OAuthCallback] Processing callback:", { 
        hasCode: !!code, 
        hasHashToken: !!hashAccessToken,
        isRecovery, 
        path: url.pathname 
      });
      setDebugInfo(`code: ${!!code}, hashToken: ${!!hashAccessToken}, isRecovery: ${isRecovery}`);

      // If it's password recovery, redirect to reset-password page
      if (isRecovery) {
        console.log("[OAuthCallback] Recovery flow detected, redirecting to /reset-password");
        window.location.href = `/reset-password${window.location.search}${window.location.hash}`;
        return;
      }

      // Handle PKCE flow with ?code=
      if (code) {
        await handlePKCEFlow(code);
        return;
      }

      // Handle Implicit flow with #access_token=
      if (hashAccessToken && hashRefreshToken) {
        await handleImplicitFlow(hashAccessToken, hashRefreshToken);
        return;
      }

      // No code and no hash tokens - check existing session
      console.log("[OAuthCallback] No code or hash tokens found, checking existing session");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectBasedOnCreator(session.user.id);
      } else {
        setStatus("error");
        setErrorMessage("No authentication code found. Please try signing in again.");
      }
    };

    // Handle PKCE flow (code in query params)
    const handlePKCEFlow = async (code: string) => {
      try {
        console.log("[OAuthCallback] PKCE flow: Exchanging code for session...");
        
        const exchangePromise = supabase.auth.exchangeCodeForSession(code);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Code exchange timeout after 10 seconds")), 10000)
        );

        const { error: exchangeError } = await Promise.race([exchangePromise, timeoutPromise]);
        
        if (exchangeError) {
          console.error("[OAuthCallback] Exchange error:", exchangeError);
          setStatus("error");
          setErrorMessage(exchangeError.message || "Failed to complete authentication");
          setDebugInfo(JSON.stringify(exchangeError, null, 2));
          return;
        }

        console.log("[OAuthCallback] Code exchange successful, waiting for auth state sync...");
        await waitForAuthStateSync();
        await finalizeSession();
      } catch (err) {
        console.error("[OAuthCallback] PKCE flow error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    // Handle Implicit flow (tokens in hash)
    const handleImplicitFlow = async (accessToken: string, refreshToken: string) => {
      try {
        console.log("[OAuthCallback] Implicit flow: Setting session from hash tokens...");
        
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Clean the URL to remove tokens from hash
        window.history.replaceState(null, "", window.location.pathname);

        if (setSessionError) {
          console.error("[OAuthCallback] Set session error:", setSessionError);
          setStatus("error");
          setErrorMessage(setSessionError.message || "Failed to establish session");
          setDebugInfo(JSON.stringify(setSessionError, null, 2));
          return;
        }

        console.log("[OAuthCallback] Session set from hash tokens successfully");
        await waitForAuthStateSync();
        await finalizeSession();
      } catch (err) {
        console.error("[OAuthCallback] Implicit flow error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    // Wait for auth state to sync
    const waitForAuthStateSync = () => {
      return new Promise<void>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          console.log("[OAuthCallback] Auth state change event:", event);
          if (event === 'SIGNED_IN') {
            subscription.unsubscribe();
            resolve();
          }
        });
        // Timeout in case event already fired
        setTimeout(() => {
          subscription.unsubscribe();
          resolve();
        }, 2000);
      });
    };

    // Finalize session and redirect
    const finalizeSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("[OAuthCallback] Session error after flow:", sessionError);
        setStatus("error");
        setErrorMessage(sessionError?.message || "No session found after authentication");
        return;
      }

      console.log("[OAuthCallback] Session established for:", session.user.email);
      await redirectBasedOnCreator(session.user.id);
    };

    const redirectBasedOnCreator = async (userId: string) => {
      try {
        console.log("[OAuthCallback] Checking for creator profile...");
        const { data: creator, error: creatorError } = await supabase
          .from("creators")
          .select("id, creator_handle")
          .eq("user_id", userId)
          .maybeSingle();

        if (creatorError) {
          console.error("[OAuthCallback] Creator fetch error:", creatorError);
        }

        if (creator) {
          console.log("[OAuthCallback] Creator found, using full page redirect to /");
          setStatus("success");
          // Use full page redirect to ensure clean context initialization
          window.location.href = "/";
        } else {
          console.log("[OAuthCallback] No creator, using full page redirect to /complete-profile");
          setStatus("success");
          // Use full page redirect to ensure clean context initialization
          window.location.href = "/complete-profile";
        }
      } catch (err) {
        console.error("[OAuthCallback] Creator check error:", err);
        // Default to complete-profile if we can't check
        window.location.href = "/complete-profile";
      }
    };

    handleCallback();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleStartOver = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-muted-foreground">Completing sign-in...</div>
          <div className="text-xs text-muted-foreground/50">{debugInfo}</div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="text-destructive font-medium">Sign-in failed</div>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
          {debugInfo && (
            <div className="text-xs text-muted-foreground/70 bg-muted p-3 rounded font-mono text-left overflow-auto max-h-32">
              {debugInfo}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={handleStartOver}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (brief, will redirect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}
