import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CreatorProvider, useCreator } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ReadyToPostPage from "./pages/ReadyToPostPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import SSOCallbackPage from "./pages/SSOCallbackPage";

const queryClient = new QueryClient();

/**
 * Global safety net: Consumes OAuth tokens from URL hash if present.
 * NOTE: Primary hash consumption now happens in main.tsx BEFORE React mounts.
 * This is a fallback for edge cases.
 */
function AuthUrlSessionHandler() {
  useEffect(() => {
    console.log("[AuthUrlSessionHandler] Component mounted, checking for hash tokens...");
    console.log("[AuthUrlSessionHandler] Current URL:", window.location.href);
    
    const consumeHashTokens = async () => {
      const hash = window.location.hash;
      if (!hash) {
        console.log("[AuthUrlSessionHandler] No hash present");
        return;
      }

      console.log("[AuthUrlSessionHandler] Hash found:", hash.substring(0, 50) + "...");

      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      // Skip if this is a recovery flow
      if (hashType === "recovery") {
        console.log("[AuthUrlSessionHandler] Recovery flow detected, skipping");
        return;
      }

      // If we have tokens in the hash, consume them
      if (accessToken && refreshToken) {
        console.log("[AuthUrlSessionHandler] Found tokens in hash, consuming (fallback path)...");
        
        try {
          // Force sign out existing session first to prevent conflicts
          await supabase.auth.signOut();
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("[AuthUrlSessionHandler] Failed to set session:", error);
          } else {
            console.log("[AuthUrlSessionHandler] Session established, user:", data.user?.email);
            window.history.replaceState(null, "", window.location.pathname);
            // Force reload to ensure clean state
            window.location.href = window.location.pathname;
          }
        } catch (err) {
          console.error("[AuthUrlSessionHandler] Error consuming hash tokens:", err);
        }
      } else {
        console.log("[AuthUrlSessionHandler] Hash present but no valid tokens");
      }
    };

    consumeHashTokens();
  }, []);

  return null;
}

/**
 * Protected route wrapper that checks for authentication and creator profile.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { creator, loading: creatorLoading, refetch: refetchCreator } = useCreator();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout protection to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[ProtectedRoute] Loading timeout reached");
      setLoadingTimeout(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  console.log("[ProtectedRoute] State:", {
    authLoading,
    creatorLoading,
    user: user?.email ?? "none",
    creator: creator?.creator_handle ?? "none",
    loadingTimeout
  });

  // Show loading state but with timeout protection
  if ((authLoading || creatorLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If timeout reached while still loading, show recovery panel
  if (loadingTimeout && (authLoading || creatorLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6 max-w-md">
          <p className="text-muted-foreground">Loading is taking longer than expected.</p>
          <div className="text-xs text-muted-foreground/70 bg-muted p-3 rounded font-mono text-left">
            authLoading: {String(authLoading)}<br/>
            creatorLoading: {String(creatorLoading)}<br/>
            user: {user?.email ?? "none"}<br/>
            creator: {creator?.creator_handle ?? "none"}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => refetchCreator()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/auth";
              }}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Logged in but no creator profile -> redirect to complete profile
  if (!creator) {
    console.log("[ProtectedRoute] No creator, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}

/**
 * Auth route wrapper - redirects to home if already logged in.
 */
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { creator, loading: creatorLoading } = useCreator();

  const isPasswordRecovery = (() => {
    const url = new URL(window.location.href);
    const searchType = url.searchParams.get("type");
    const searchCode = url.searchParams.get("code");
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hashType = hashParams.get("type");

    // Only treat as password recovery when type=recovery is explicitly present
    // OAuth tokens in hash should NOT be treated as recovery
    return (searchType === "recovery" && Boolean(searchCode)) || hashType === "recovery";
  })();

  // Never redirect away during password recovery flow
  if (isPasswordRecovery) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Already logged in
  if (user) {
    // Has creator profile -> go to home
    if (!creatorLoading && creator) {
      return <Navigate to="/" replace />;
    }
    // No creator profile -> go to complete profile
    if (!creatorLoading && !creator) {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Complete profile route - only accessible if logged in but no creator profile.
 * OAuth code exchange is handled by OAuthCallbackPage, not here.
 */
function CompleteProfileRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { creator, loading: creatorLoading } = useCreator();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout protection to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[CompleteProfileRoute] Loading timeout reached");
      setLoadingTimeout(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  console.log("[CompleteProfileRoute] State:", {
    authLoading,
    creatorLoading,
    user: user?.email ?? "none",
    creator: creator?.creator_handle ?? "none",
    loadingTimeout
  });

  // Show loading state but with timeout protection
  if ((authLoading || creatorLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If timeout reached while still loading, show recovery panel (instead of bouncing to /auth)
  if (loadingTimeout && (authLoading || creatorLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6 max-w-md">
          <p className="text-muted-foreground">Sign-in is taking longer than expected.</p>
          <div className="text-xs text-muted-foreground/70 bg-muted p-3 rounded font-mono text-left">
            authLoading: {String(authLoading)}<br />
            creatorLoading: {String(creatorLoading)}<br />
            user: {user?.email ?? "none"}<br />
            creator: {creator?.creator_handle ?? "none"}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/auth";
              }}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!user) {
    console.log("[CompleteProfileRoute] No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Already has creator profile -> go to home
  if (creator) {
    console.log("[CompleteProfileRoute] Creator exists, redirecting to /");
    return <Navigate to="/" replace />;
  }

  console.log("[CompleteProfileRoute] Showing complete profile form");
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        }
      />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/complete-profile"
        element={
          <CompleteProfileRoute>
            <CompleteProfilePage />
          </CompleteProfileRoute>
        }
      />
      <Route
        path="/ready/:videoId"
        element={
          <ProtectedRoute>
            <ReadyToPostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <LocaleProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CreatorProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthUrlSessionHandler />
              <AppRoutes />
            </BrowserRouter>
          </CreatorProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </LocaleProvider>
);

export default App;
