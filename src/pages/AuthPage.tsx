import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import shopableLogo from "@/assets/shopable-logo.png";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorKuerzel, setCreatorKuerzel] = useState("");

  const isPasswordRecovery = useMemo(() => {
    const url = new URL(window.location.href);
    const searchType = url.searchParams.get("type");
    const searchCode = url.searchParams.get("code");
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hashType = hashParams.get("type");
    const hashAccessToken = hashParams.get("access_token");

    return searchType === "recovery" || hashType === "recovery" || Boolean(searchCode) || Boolean(hashAccessToken);
  }, []);

  // If we landed here via a password reset link, route to the reset screen.
  useEffect(() => {
    if (isPasswordRecovery) {
      navigate(`/reset-password${window.location.search}${window.location.hash}`, { replace: true });
    }
  }, [isPasswordRecovery, navigate]);

  // Redirect if already logged in (but never during password recovery flow)
  useEffect(() => {
    if (user && !isPasswordRecovery) {
      navigate("/");
    }
  }, [user, isPasswordRecovery, navigate]);

  // Clear form error when inputs change
  useEffect(() => {
    setFormError(null);
  }, [email, password, mode]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFormError("Please enter your email address first.");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    
    if (error) {
      setFormError(error.message);
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      if (mode === "signup") {
        // Validate signup fields
        if (password !== confirmPassword) {
          setFormError("Passwords don't match. Please try again.");
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setFormError("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }

        if (!creatorHandle.trim()) {
          setFormError("Please enter your creator handle.");
          setLoading(false);
          return;
        }

        if (!creatorKuerzel.trim() || creatorKuerzel.length > 4) {
          setFormError("Please enter a short creator code (1-4 characters).");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, creatorHandle.toLowerCase(), creatorKuerzel);
        
        if (error) {
          setFormError(error.message);
        } else {
          toast({
            title: "Welcome!",
            description: "Your account has been created.",
          });
          navigate("/");
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          setFormError("Invalid email or password. Please try again.");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFormError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setFormError(error.message);
      setLoading(false);
    }
    // Note: OAuth redirects, so loading state will reset on return
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-center border-b border-border/40 px-4">
        <img 
          src={shopableLogo} 
          alt="Shopable" 
          className="h-6 w-auto"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" 
                ? "Sign in to continue to Shopable" 
                : "Start creating shoppable videos"}
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Inline Error Message */}
          {formError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {formError}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11"
              />
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creatorHandle">Creator Handle</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="creatorHandle"
                      type="text"
                      placeholder="yourname"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      required
                      className="h-11 pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your unique URL: shop.one/{creatorHandle || "yourname"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creatorKuerzel">Creator Code</Label>
                  <Input
                    id="creatorKuerzel"
                    type="text"
                    placeholder="e.g. MM"
                    value={creatorKuerzel}
                    onChange={(e) => setCreatorKuerzel(e.target.value.toUpperCase().slice(0, 4))}
                    required
                    maxLength={4}
                    className="h-11 uppercase"
                  />
                  <p className="text-xs text-muted-foreground">
                    Short code for your video URLs (1-4 characters)
                  </p>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}