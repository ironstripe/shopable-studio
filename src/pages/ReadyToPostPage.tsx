import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreator } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, ArrowLeft, Plus, Link2 } from "lucide-react";
import shopableLogo from "@/assets/shopable-logo.png";

interface VideoData {
  id: string;
  title: string;
  custom_slug: string;
  caption: string;
}

export default function ReadyToPostPage() {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const { creator } = useCreator();
  const { toast } = useToast();
  
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [bioCopied, setBioCopied] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, custom_slug, caption")
        .eq("id", videoId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch video:", error);
        navigate("/");
        return;
      }

      if (!data) {
        navigate("/");
        return;
      }

      setVideo(data);
      setLoading(false);
    };

    fetchVideo();
  }, [videoId, navigate]);

  if (loading || !video || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const videoUrl = `shop.one/${creator.creator_kuerzel}/${video.custom_slug}`;
  const bioUrl = `shop.one/${creator.creator_kuerzel}`;
  const caption = video.caption || `Check out my latest pick! 🛒\n\n👉 ${videoUrl}`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCaptionCopied(true);
      toast({ title: "Caption copied!" });
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCopyBioLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${bioUrl}`);
      setBioCopied(true);
      toast({ title: "Bio link copied!" });
      setTimeout(() => setBioCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between border-b border-border/40 px-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img 
          src={shopableLogo} 
          alt="Shopable" 
          className="h-6 w-auto"
        />
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 pt-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Success Icon */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground text-center">
              Ready to post!
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Your video "{video.title}" is ready to share
            </p>
          </div>

          {/* Caption Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Caption
            </label>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap border border-border/50">
              {caption}
            </div>
            <Button
              onClick={handleCopyCaption}
              className="w-full h-12 text-base font-medium"
              variant={captionCopied ? "outline" : "default"}
            >
              {captionCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Caption
                </>
              )}
            </Button>
          </div>

          {/* Bio Link Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Your Bio Link
            </label>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground truncate">
                {bioUrl}
              </span>
            </div>
            <Button
              onClick={handleCopyBioLink}
              variant="outline"
              className="w-full h-11"
            >
              {bioCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Bio Link
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create next video
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="w-full h-11 text-muted-foreground"
            >
              Back to videos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
