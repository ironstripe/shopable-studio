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
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCreator = async () => {
    if (!user) {
      setCreator(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch creator:", error);
    }
    
    setCreator(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCreator();
  }, [user]);

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
