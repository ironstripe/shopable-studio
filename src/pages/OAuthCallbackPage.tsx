import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type CallbackStatus = "processing" | "error" | "success";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const searchType = url.searchParams.get("type");
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashType = hashParams.get("type");
      const isRecovery = searchType === "recovery" || hashType === "recovery";

      console.log("[OAuthCallback] Processing callback:", { code: !!code, isRecovery, path: url.pathname });
      setDebugInfo(`code: ${!!code}, isRecovery: ${isRecovery}`);

      // If it's password recovery, redirect to reset-password page
      if (isRecovery) {
        console.log("[OAuthCallback] Recovery flow detected, redirecting to /reset-password");
        // Keep URL params for reset-password page
        navigate(`/reset-password${window.location.search}${window.location.hash}`, { replace: true });
        return;
      }

      // No code means nothing to exchange
      if (!code) {
        console.log("[OAuthCallback] No code found, checking existing session");
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await redirectBasedOnCreator(session.user.id, cancelled);
        } else {
          if (!cancelled) {
            setStatus("error");
            setErrorMessage("No authentication code found. Please try signing in again.");
          }
        }
        return;
      }

      // Exchange the code for session with timeout
      try {
        console.log("[OAuthCallback] Exchanging code for session...");
        
        const exchangePromise = supabase.auth.exchangeCodeForSession(code);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Code exchange timeout after 10 seconds")), 10000)
        );

        const { error: exchangeError } = await Promise.race([exchangePromise, timeoutPromise]);
        
        if (exchangeError) {
          console.error("[OAuthCallback] Exchange error:", exchangeError);
          if (!cancelled) {
            setStatus("error");
            setErrorMessage(exchangeError.message || "Failed to complete authentication");
            setDebugInfo(JSON.stringify(exchangeError, null, 2));
          }
          return;
        }

        // Clean URL immediately after successful exchange
        window.history.replaceState({}, document.title, window.location.pathname);

        // Get session to verify and get user ID
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("[OAuthCallback] Session error after exchange:", sessionError);
          if (!cancelled) {
            setStatus("error");
            setErrorMessage(sessionError?.message || "No session found after authentication");
          }
          return;
        }

        console.log("[OAuthCallback] Session established for:", session.user.email);
        await redirectBasedOnCreator(session.user.id, cancelled);

      } catch (err) {
        console.error("[OAuthCallback] Unexpected error:", err);
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      }
    };

    const redirectBasedOnCreator = async (userId: string, cancelled: boolean) => {
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

        if (cancelled) return;

        if (creator) {
          console.log("[OAuthCallback] Creator found, redirecting to /");
          setStatus("success");
          navigate("/", { replace: true });
        } else {
          console.log("[OAuthCallback] No creator, redirecting to /complete-profile");
          setStatus("success");
          navigate("/complete-profile", { replace: true });
        }
      } catch (err) {
        console.error("[OAuthCallback] Creator check error:", err);
        if (!cancelled) {
          // Default to complete-profile if we can't check
          navigate("/complete-profile", { replace: true });
        }
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
