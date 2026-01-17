import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreator } from "@/contexts/CreatorContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/i18n";
import { Check, Copy, ArrowLeft, Link2, ExternalLink, Rocket } from "lucide-react";
import shopableLogo from "@/assets/shopable-logo.png";
import { trackEvent } from "@/services/event-tracking";

interface VideoData {
  id: string;
  title: string;
  custom_slug: string;
  caption: string;
  state: string;
}

export default function ReadyToPostPage() {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const { creator } = useCreator();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [localCaption, setLocalCaption] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, custom_slug, caption, state")
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

      // STATE MACHINE GUARD: Only allow access in ready_to_post or posted states
      const videoState = (data as { state?: string }).state;
      if (videoState !== "ready_to_post" && videoState !== "posted") {
        console.warn("[ReadyToPostPage] Invalid state for this page:", videoState);
        navigate("/");
        return;
      }

      setVideo(data);
      setLocalCaption(data.caption || "");
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

  const shopLink = `shopable.one/${creator.creator_kuerzel}/${video.custom_slug}`;
  const fullShopLink = `https://${shopLink}`;
  const isPublished = video.state === "posted";

  const handlePublish = async () => {
    if (!videoId) return;
    
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from("videos")
        .update({ state: "posted" })
        .eq("id", videoId);

      if (error) throw error;

      setVideo(prev => prev ? { ...prev, state: "posted" } : null);
      toast({ title: t("publish.success") });
      
      if (creator) {
        trackEvent({
          eventName: "video_published",
          creatorId: creator.id,
          videoId,
        });
      }
    } catch (err) {
      console.error("Failed to publish:", err);
      toast({ title: t("publish.error"), variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyCaption = async () => {
    if (!localCaption.trim()) return;
    
    try {
      await navigator.clipboard.writeText(localCaption);
      setCaptionCopied(true);
      toast({ title: t("publish.captionCopied") });
      
      if (creator && videoId) {
        trackEvent({
          eventName: "caption_copied",
          creatorId: creator.id,
          videoId,
        });
      }
      
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShopLink);
      setLinkCopied(true);
      toast({ title: t("publish.linkCopied") });
      
      if (creator && videoId) {
        trackEvent({
          eventName: "shop_link_copied",
          creatorId: creator.id,
          videoId,
        });
      }
      
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleOpenLandingPage = () => {
    window.open(fullShopLink, "_blank", "noopener,noreferrer");
    
    if (creator && videoId) {
      trackEvent({
        eventName: "landing_page_opened",
        creatorId: creator.id,
        videoId,
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
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
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 pt-8 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          {/* Title Section */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              {isPublished ? `🎉 ${t("publish.title.published")}` : `🚀 ${t("publish.title.ready")}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPublished ? t("publish.subline.published") : t("publish.subline.ready")}
            </p>
          </div>

          {/* Primary CTA - Publish Button (only show if not published) */}
          {!isPublished && (
            <div className="space-y-2">
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full h-14 text-base font-semibold"
                size="lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {isPublishing ? t("publish.publishing") : t("publish.button")}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t("publish.helper")}
              </p>
            </div>
          )}

          {/* Shop Link Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              {t("publish.shopLink.label")}
            </label>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground font-mono truncate flex-1">
                {shopLink}
              </span>
            </div>
            
            {/* Link Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 h-11"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t("publish.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t("publish.copyLink")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenLandingPage}
                variant="outline"
                className="flex-1 h-11"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("publish.openPage")}
              </Button>
            </div>
          </div>

          {/* Caption Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              {t("publish.caption.label")}
            </label>
            <Textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              placeholder={t("publish.caption.placeholder")}
              className="min-h-[120px] bg-muted/50 border-border/50 rounded-lg text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t("publish.caption.helper")}
            </p>
            <Button
              onClick={handleCopyCaption}
              variant="outline"
              className="w-full h-11"
              disabled={!localCaption.trim()}
            >
              {captionCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t("publish.caption.copied")}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t("publish.caption.copy")}
                </>
              )}
            </Button>
          </div>

          {/* Exit Options */}
          <div className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("readyToPost.page.exitLabel")}
            </p>
            
            <Button
              onClick={() => navigate("/")}
              className="w-full h-11"
              variant="secondary"
            >
              {t("readyToPost.page.createNext")}
            </Button>
            
            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("readyToPost.page.backToVideos")}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("readyToPost.page.logout")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
