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
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ReadyToPostPage from "./pages/ReadyToPostPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Protected route wrapper that checks for authentication and creator profile.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { creator, loading: creatorLoading } = useCreator();

  if (authLoading || creatorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but no creator profile -> redirect to complete profile
  if (!creator) {
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
 */
function CompleteProfileRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { creator, loading: creatorLoading } = useCreator();

  if (authLoading || creatorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Already has creator profile -> go to home
  if (creator) {
    return <Navigate to="/" replace />;
  }

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
