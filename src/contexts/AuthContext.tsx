import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, creatorHandle: string, creatorKuerzel: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth] Setting up auth state listener...");
    let cancelled = false;

    // Set up auth state listener FIRST (before getSession)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Auth] State change:", event, "user:", session?.user?.email ?? "none");
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Simple session check - NO URL parsing, NO code exchange
    // OAuth code exchange is handled exclusively by OAuthCallbackPage
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Auth] Initial session check:", session?.user?.email ?? "no session");

        if (cancelled) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("[Auth] Init error:", err);
        if (!cancelled) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    init();

    // Failsafe timeout: if no session established after 8s, force loading to false
    const failsafeTimer = setTimeout(() => {
      console.log("[Auth] Failsafe timeout reached");
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("[Auth] Failsafe session re-check:", session?.user?.email ?? "no session");
        if (cancelled) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(failsafeTimer);
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    creatorHandle: string,
    creatorKuerzel: string
  ): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          creator_handle: creatorHandle,
          creator_kuerzel: creatorKuerzel,
        },
      },
    });

    if (error) return { error };

    // Create creator profile after signup
    if (data.user) {
      const { error: profileError } = await supabase.from("creators").insert({
        user_id: data.user.id,
        email: email,
        creator_handle: creatorHandle,
        creator_kuerzel: creatorKuerzel.toUpperCase(),
      });

      if (profileError) {
        console.error("Failed to create creator profile:", profileError);
        return { error: new Error(profileError.message) };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      // Detect if we're in an embedded context (iframe)
      let isEmbedded = false;
      try {
        isEmbedded = window.self !== window.top;
      } catch {
        // Cross-origin iframe - treat as embedded
        isEmbedded = true;
      }

      console.log("[Auth] Google sign-in, embedded:", isEmbedded);

      if (isEmbedded) {
        // In iframe: get OAuth URL without redirecting, then open in new tab
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: true,
          },
        });

        if (error) return { error: new Error(error.message) };
        if (data?.url) {
          console.log("[Auth] Opening Google OAuth in new tab");
          window.open(data.url, "_blank");
        }
        return { error: null };
      } else {
        // Not in iframe: normal redirect flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        return { error: error ? new Error(error.message) : null };
      }
    } catch (err) {
      console.error("[Auth] Google sign-in error:", err);
      return { error: err instanceof Error ? err : new Error("Google sign-in failed") };
    }
  };

  const signOut = async () => {
    console.log("[Auth] Signing out...");
    // First clear local state immediately for fast UI response
    setUser(null);
    setSession(null);
    
    try {
      // Clear local session first (fast, always works)
      await supabase.auth.signOut({ scope: "local" });
      console.log("[Auth] Local session cleared");
    } catch (err) {
      console.warn("[Auth] Local signout error (continuing):", err);
    }
    
    try {
      // Then try global signout (best effort, may fail in embedded contexts)
      await supabase.auth.signOut({ scope: "global" });
      console.log("[Auth] Global signout complete");
    } catch (err) {
      console.warn("[Auth] Global signout error (non-critical):", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
