import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Creator {
  id: string;
  user_id: string;
  email: string;
  creator_handle: string;
  creator_kuerzel: string;
  created_at: string;
  updated_at: string;
}

interface CreatorContextType {
  creator: Creator | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchCreator = useCallback(async (userId: string | undefined) => {
    console.log("[Creator] fetchCreator called, userId:", userId ?? "none");
    
    // Prevent parallel fetches
    if (fetchingRef.current) {
      console.log("[Creator] Already fetching, skipping");
      return;
    }
    
    if (!userId) {
      console.log("[Creator] No userId, setting creator to null");
      setCreator(null);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    
    try {
      console.log("[Creator] Fetching creator for user_id:", userId);
      
      // Race the DB call with a timeout
      const fetchPromise = supabase
        .from("creators")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Creator fetch timeout")), 8000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error("[Creator] Failed to fetch creator:", error.message, error);
        setCreator(null);
      } else {
        console.log("[Creator] Fetched creator:", data?.creator_handle ?? "none found");
        setCreator(data);
      }
    } catch (err) {
      console.error("[Creator] Fetch exception:", err);
      setCreator(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Listen to auth state changes directly - this is more reliable than depending on user?.id
  useEffect(() => {
    console.log("[Creator] Setting up auth state listener for creator fetch");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Creator] Auth state change:", event, "user:", session?.user?.email ?? "none");

      if (event === "SIGNED_OUT") {
        setCreator(null);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // On any sign-in related event, fetch the creator
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        const userId = session?.user?.id;
        if (userId) {
          fetchCreator(userId);
        } else {
          setCreator(null);
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCreator]);

  // Also handle initial state when auth is already loaded
  useEffect(() => {
    console.log("[Creator] Initial check - authLoading:", authLoading, "user:", user?.email ?? "none");
    
    if (authLoading) {
      // Auth still loading, keep creator loading too
      return;
    }

    // Auth finished loading - fetch creator if we have a user
    if (user?.id) {
      fetchCreator(user.id);
    } else {
      setCreator(null);
      setLoading(false);
    }
  }, [authLoading, user?.id, fetchCreator]);

  const refetch = useCallback(async () => {
    if (user?.id) {
      await fetchCreator(user.id);
    }
  }, [user?.id, fetchCreator]);

  return (
    <CreatorContext.Provider value={{ creator, loading, refetch }}>
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  const context = useContext(CreatorContext);
  if (context === undefined) {
    throw new Error("useCreator must be used within a CreatorProvider");
  }
  return context;
}
