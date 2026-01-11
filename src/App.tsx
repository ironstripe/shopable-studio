import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CreatorProvider, useCreator } from "@/contexts/CreatorContext";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ReadyToPostPage from "./pages/ReadyToPostPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
    const hashAccessToken = hashParams.get("access_token");

    // IMPORTANT: OAuth callbacks also use `?code=`.
    // Only treat it as password recovery when `type=recovery` (or hash-based recovery) is present.
    return (searchType === "recovery" && Boolean(searchCode)) || hashType === "recovery" || Boolean(hashAccessToken);
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
 * Includes PKCE code exchange for OAuth callbacks and timeout protection.
 */
function CompleteProfileRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { creator, loading: creatorLoading } = useCreator();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Only clean URL AFTER auth has completed to allow PKCE code exchange
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!authLoading && user && url.searchParams.has("code")) {
      console.log("[CompleteProfileRoute] Auth complete, cleaning OAuth code from URL");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authLoading, user]);

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
              <AppRoutes />
            </BrowserRouter>
          </CreatorProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </LocaleProvider>
);

export default App;
