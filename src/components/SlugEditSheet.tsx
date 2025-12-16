import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreator } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface SlugEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  videoTitle: string;
  productName?: string;
}

/**
 * Generates a URL-safe slug from a string.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (match) => {
      const map: Record<string, string> = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss" };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default function SlugEditSheet({
  open,
  onOpenChange,
  videoId,
  videoTitle,
  productName,
}: SlugEditSheetProps) {
  const navigate = useNavigate();
  const { creator } = useCreator();
  const { toast } = useToast();
  
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug when sheet opens
  useEffect(() => {
    if (open) {
      const source = productName || videoTitle || "video";
      setSlug(generateSlug(source));
      setIsAvailable(null);
    }
  }, [open, videoTitle, productName]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || !creator) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      
      const { data, error } = await supabase
        .from("videos")
        .select("id")
        .eq("creator_id", creator.id)
        .eq("custom_slug", slug)
        .neq("id", videoId)
        .maybeSingle();

      if (error) {
        console.error("Slug check error:", error);
        setIsAvailable(null);
      } else {
        setIsAvailable(data === null);
      }
      
      setChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [slug, creator, videoId]);

  const handleSlugChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-/, "")
      .slice(0, 50);
    setSlug(cleaned);
  };

  const handleFinalize = async () => {
    if (!creator || !slug || !isAvailable) return;

    setSaving(true);

    // Generate caption
    const videoUrl = `shop.one/${creator.creator_kuerzel}/${slug}`;
    const caption = `Check out my latest pick! 🛒\n\n👉 ${videoUrl}`;

    const { error } = await supabase
      .from("videos")
      .update({
        custom_slug: slug,
        slug_finalized: true,
        caption: caption,
      })
      .eq("id", videoId);

    if (error) {
      console.error("Failed to finalize slug:", error);
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "This URL is already taken. Please choose another."
          : "Failed to save. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    onOpenChange(false);
    navigate(`/ready/${videoId}`);
  };

  if (!creator) return null;

  const previewUrl = `shop.one/${creator.creator_kuerzel}/${slug || "..."}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Choose your video URL</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* URL Preview */}
          <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Your video will be at:</p>
            <p className="text-base font-medium text-foreground break-all">
              {previewUrl}
            </p>
          </div>

          {/* Slug Input */}
          <div className="space-y-2">
            <Label htmlFor="slug">Custom URL</Label>
            <div className="relative">
              <Input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-video"
                className="h-11 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : isAvailable === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : isAvailable === false ? (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </div>
            {isAvailable === false && (
              <p className="text-xs text-destructive">
                This URL is already taken. Please choose another.
              </p>
            )}
            {isAvailable === true && (
              <p className="text-xs text-green-600">
                This URL is available!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={!slug || !isAvailable || saving}
              className="flex-1 h-11"
            >
              {saving ? "Saving..." : "Finalize & Share"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
