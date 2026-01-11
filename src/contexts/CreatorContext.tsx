import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const lastUserIdRef = useRef<string | null>(null);

  const fetchCreator = async () => {
    console.log("[Creator] fetchCreator called, user:", user?.email ?? "none");
    
    // Prevent parallel fetches
    if (fetchingRef.current) {
      console.log("[Creator] Already fetching, skipping");
      return;
    }
    
    if (!user) {
      console.log("[Creator] No user, setting creator to null");
      setCreator(null);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    
    try {
      console.log("[Creator] Fetching creator for user_id:", user.id);
      
      // Race the DB call with a timeout
      const fetchPromise = supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Creator fetch timeout")), 8000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error("[Creator] Failed to fetch creator:", error);
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
  };

  // Only fetch when auth has finished loading and user.id changes
  useEffect(() => {
    console.log("[Creator] useEffect triggered, authLoading:", authLoading, "user:", user?.email ?? "none");
    
    if (authLoading) {
      return;
    }
    
    // Only refetch if user.id actually changed
    const currentUserId = user?.id ?? null;
    if (currentUserId === lastUserIdRef.current) {
      console.log("[Creator] User ID unchanged, skipping fetch");
      return;
    }
    
    lastUserIdRef.current = currentUserId;
    fetchCreator();
  }, [user?.id, authLoading]);

  return (
    <CreatorContext.Provider value={{ creator, loading, refetch: fetchCreator }}>
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
