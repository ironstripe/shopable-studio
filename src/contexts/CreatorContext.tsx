import React, { createContext, useContext, useState, useEffect } from "react";
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

  const fetchCreator = async () => {
    console.log("[Creator] fetchCreator called, user:", user?.email ?? "none");
    
    if (!user) {
      console.log("[Creator] No user, setting creator to null");
      setCreator(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("[Creator] Fetching creator for user_id:", user.id);
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

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
      setLoading(false);
    }
  };

  // Only fetch when auth has finished loading and user state is determined
  useEffect(() => {
    console.log("[Creator] useEffect triggered, authLoading:", authLoading, "user:", user?.email ?? "none");
    if (!authLoading) {
      fetchCreator();
    }
  }, [user, authLoading]);

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
