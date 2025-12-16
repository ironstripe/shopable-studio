import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import shopableLogo from "@/assets/shopable-logo.png";

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const recoveryInfo = useMemo(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    return {
      code: params.get("code"),
      type: params.get("type") ?? hashParams.get("type"),
      accessToken: hashParams.get("access_token"),
    };
  }, []);

  // Initialize recovery session (supports both PKCE `?code=` and hash token links)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setInitializing(true);
      setPageError(null);

      try {
        if (recoveryInfo.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(recoveryInfo.code);
          if (error) {
            setPageError(error.message);
            setReady(false);
            return;
          }

          // Clean URL to avoid re-exchanging on refresh
          window.history.replaceState({}, document.title, "/reset-password");
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
          return;
        }

        // If we have recovery params but no session yet, we still show the form and let updateUser fail with a clear error.
        if (recoveryInfo.type === "recovery" || Boolean(recoveryInfo.accessToken) || Boolean(recoveryInfo.code)) {
          setReady(true);
          return;
        }

        setReady(false);
      } catch {
        setPageError("Could not initialize password reset. Please request a new link.");
        setReady(false);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [recoveryInfo.accessToken, recoveryInfo.code, recoveryInfo.type]);

  // If auth-js emits PASSWORD_RECOVERY, ensure we stay on this page and show the form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.title = "Reset password | Shopable";
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

    if (error) {
      setLoading(false);
      setFormError(
        error.message.includes("expired") || error.message.includes("invalid")
          ? "This reset link is invalid or expired. Please request a new one."
          : error.message
      );
      return;
    }

    toast({
      title: "Password updated",
      description: "You can now sign in with your new password.",
    });

    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 flex items-center justify-center border-b border-border/40 px-4">
        <img src={shopableLogo} alt="Shopable" className="h-6 w-auto" />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
            <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
          </div>

          {(pageError || formError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {pageError ?? formError}
            </div>
          )}

          {initializing ? (
            <div className="p-3 border border-border rounded-lg text-sm text-muted-foreground">
              Preparing password reset...
            </div>
          ) : !ready ? (
            <div className="space-y-4">
              <div className="p-3 border border-border rounded-lg text-sm text-muted-foreground">
                This link doesn't contain password reset info. Please request a new reset email.
              </div>
              <Button className="w-full" onClick={() => navigate("/auth")}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="h-11"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="h-11"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
