import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreator } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import shopableLogo from "@/assets/shopable-logo.png";

/**
 * Page shown to OAuth users who need to complete their creator profile.
 */
export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creator, refetch } = useCreator();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorKuerzel, setCreatorKuerzel] = useState("");

  // If no user, redirect to auth
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // If creator profile already exists, redirect to home
  useEffect(() => {
    if (creator) {
      navigate("/");
    }
  }, [creator, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!creatorHandle.trim()) {
      toast({
        title: "Handle required",
        description: "Please enter your creator handle.",
        variant: "destructive",
      });
      return;
    }

    if (!creatorKuerzel.trim() || creatorKuerzel.length > 4) {
      toast({
        title: "Invalid code",
        description: "Please enter a short creator code (1-4 characters).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("creators").insert({
      user_id: user.id,
      email: user.email || "",
      creator_handle: creatorHandle.toLowerCase(),
      creator_kuerzel: creatorKuerzel.toUpperCase(),
    });

    if (error) {
      console.error("Failed to create creator profile:", error);
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "This handle is already taken. Please choose another."
          : error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    await refetch();
    toast({
      title: "Profile created!",
      description: "You're all set to start creating.",
    });
    navigate("/");
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
              Complete your profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose your creator handle and code to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Creating..." : "Continue"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
