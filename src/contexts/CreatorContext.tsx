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
    if (!user) {
      setCreator(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch creator:", error);
        setCreator(null);
      } else {
        setCreator(data);
      }
    } catch (err) {
      console.error("Creator fetch exception:", err);
      setCreator(null);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when auth has finished loading and user state is determined
  useEffect(() => {
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
