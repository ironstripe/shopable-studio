import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/i18n";
import shopableLogo from "@/assets/shopable-logo.png";

type PageStatus = "loading" | "ready" | "expired" | "invalid";

const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Password form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Request new link form state
  const [email, setEmail] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Initialize: Check for recovery code and exchange for session
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const type = url.searchParams.get("type");
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashType = hashParams.get("type");
      const accessToken = hashParams.get("access_token");

      // Check if this looks like a recovery link
      const hasRecoveryParams = code || type === "recovery" || hashType === "recovery" || accessToken;

      if (!hasRecoveryParams) {
        // User navigated here directly without a reset link
        if (!cancelled) {
          setStatus("invalid");
          setErrorMessage(t("resetPassword.error.noLink"));
        }
        return;
      }

      // Try to exchange PKCE code for session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          if (!cancelled) {
            // Token expired or already used
            setStatus("expired");
            setErrorMessage(
              error.message.includes("expired") || error.message.includes("invalid")
                ? t("resetPassword.error.expired")
                : error.message
            );
          }
          return;
        }

        // Clean URL to prevent re-exchange on refresh
        window.history.replaceState({}, document.title, "/reset-password");
      }

      // Check if we have a valid session now
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        if (!cancelled) {
          setStatus("ready");
        }
        return;
      }

      // No session established - token was likely expired/used
      if (!cancelled) {
        setStatus("expired");
        setErrorMessage(t("resetPassword.error.expired"));
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [t]);

  // Listen for PASSWORD_RECOVERY event (backup for hash-based links)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
        setErrorMessage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.title = `${t("resetPassword.title")} | Shopable`;
  }, [t]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue?.path[0] === "password") {
        setFormError(t("resetPassword.error.tooShort"));
      } else {
        setFormError(t("resetPassword.error.mismatch"));
      }
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

    if (error) {
      setUpdating(false);
      setFormError(
        error.message.includes("expired") || error.message.includes("invalid")
          ? t("resetPassword.error.sessionExpired")
          : error.message
      );
      return;
    }

    toast({
      title: t("resetPassword.success.title"),
      description: t("resetPassword.success.description"),
    });

    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSendingLink(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSendingLink(false);

    if (error) {
      toast({
        title: t("resetPassword.requestLink.error"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLinkSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 flex items-center justify-center border-b border-border/40 px-4">
        <img src={shopableLogo} alt="Shopable" className="h-6 w-auto" />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {t("resetPassword.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {status === "ready" 
                ? t("resetPassword.subtitle")
                : status === "expired"
                ? t("resetPassword.expiredSubtitle")
                : t("resetPassword.invalidSubtitle")}
            </p>
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="p-4 border border-border rounded-lg text-sm text-muted-foreground text-center">
              {t("resetPassword.loading")}
            </div>
          )}

          {/* Ready State: Password Form */}
          {status === "ready" && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("resetPassword.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="h-11"
                  placeholder={t("resetPassword.newPasswordPlaceholder")}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">{t("resetPassword.confirmPassword")}</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="h-11"
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={updating}>
                {updating ? t("resetPassword.updating") : t("resetPassword.updateButton")}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                {t("resetPassword.backToSignIn")}
              </button>
            </form>
          )}

          {/* Expired State: Request New Link Form */}
          {status === "expired" && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {errorMessage}
                </div>
              )}

              {linkSent ? (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-foreground text-center">
                  {t("resetPassword.requestLink.sent")}
                </div>
              ) : (
                <form onSubmit={handleRequestNewLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("resetPassword.requestLink.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                      placeholder={t("resetPassword.requestLink.emailPlaceholder")}
                      autoComplete="email"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={sendingLink}>
                    {sendingLink ? t("resetPassword.requestLink.sending") : t("resetPassword.requestLink.button")}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                {t("resetPassword.backToSignIn")}
              </button>
            </div>
          )}

          {/* Invalid State: No Link Present */}
          {status === "invalid" && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 border border-border rounded-lg text-sm text-muted-foreground">
                  {errorMessage}
                </div>
              )}

              <Button className="w-full h-11" onClick={() => navigate("/auth")}>
                {t("resetPassword.backToSignIn")}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
