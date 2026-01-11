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
    let authEventReceived = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] State change:", event, "user:", session?.user?.email ?? "none");
        authEventReceived = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Handle PKCE code exchange for OAuth callbacks
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      console.log("[Auth] PKCE code detected, exchanging for session...");
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error("[Auth] Code exchange failed:", error);
        } else {
          console.log("[Auth] Code exchange successful:", data.session?.user?.email);
          authEventReceived = true;
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      });
    } else {
      // THEN check for existing session (only if no code to exchange)
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("[Auth] Initial session check:", session?.user?.email ?? "no session");
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }

    // Failsafe timeout: if no auth event received after 10s, force loading to false
    const failsafeTimer = setTimeout(() => {
      if (!authEventReceived) {
        console.log("[Auth] Failsafe timeout: no auth event received, forcing loading=false");
        supabase.auth.getSession().then(({ data: { session } }) => {
          console.log("[Auth] Failsafe session re-check:", session?.user?.email ?? "no session");
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });
      }
    }, 10000);

    return () => {
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect to complete-profile for new OAuth users (existing users will be redirected to home by route guard)
        redirectTo: `${window.location.origin}/complete-profile`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
