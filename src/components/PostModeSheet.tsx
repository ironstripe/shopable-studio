import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Link2, ExternalLink, Rocket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VideoCTA as VideoCTAType } from "@/types/video";

interface PostModeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoSrc: string | null;
  videoId: string;
  videoTitle: string;
  videoCTA?: VideoCTAType;
  caption?: string;
  hotspotCount: number;
  onPublish?: () => void;
  isPublishing?: boolean;
  isPublished?: boolean;
  creatorKuerzel?: string;
  videoSlug?: string;
}

const DEFAULT_CAPTION = `Shop what you see 👀✨
Tap the link to explore the products from this video.

#shopable`;

/**
 * Post mode bottom sheet.
 * Shows video preview summary and publishing actions:
 * - Publish to landing page
 * - Copy caption
 * - Copy/open shop link
 */
const PostModeSheet = ({
  open,
  onOpenChange,
  videoSrc,
  videoId,
  videoTitle,
  videoCTA,
  caption: initialCaption,
  hotspotCount,
  onPublish,
  isPublishing = false,
  isPublished = false,
  creatorKuerzel,
  videoSlug,
}: PostModeSheetProps) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localCaption, setLocalCaption] = useState(initialCaption || DEFAULT_CAPTION);

  // Generate slug from video title if not provided
  const generateSlugFromTitle = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss" };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  };

  // Tiny URL format: shop.one/{kuerzel}/{slug}
  const effectiveSlug = videoSlug || generateSlugFromTitle(videoTitle);
  const shopLink = creatorKuerzel && effectiveSlug
    ? `shop.one/${creatorKuerzel}/${effectiveSlug}`
    : creatorKuerzel
      ? `shop.one/${creatorKuerzel}`
      : `shopable.link/${videoId}`;
  const fullShopLink = `https://${shopLink}`;

  const handleCopyCaption = async () => {
    if (!localCaption.trim()) {
      toast.error("No caption to copy");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(localCaption);
      setCopiedCaption(true);
      toast.success("Caption copied!");
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      toast.error("Failed to copy caption");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShopLink);
      setCopiedLink(true);
      toast.success("Link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenLandingPage = () => {
    window.open(fullShopLink, "_blank", "noopener,noreferrer");
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      toast.info("Publishing...");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-[20px] px-6 py-5 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold text-center">
            {isPublished ? "🎉 Published" : "🚀 Ready to publish"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Video Preview Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              {videoSrc && (
                <div className="w-16 h-28 bg-black rounded-lg overflow-hidden flex-shrink-0">
                  <video
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{videoTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hotspotCount} hotspot{hotspotCount !== 1 ? "s" : ""}
                </p>
                {videoCTA?.enabled && (
                  <p className="text-sm text-muted-foreground">
                    CTA: {videoCTA.label}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Primary CTA - Publish Button (only show if not published) */}
          {!isPublished && (
            <div className="space-y-2">
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full h-14 rounded-xl font-semibold text-base"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {isPublishing ? "Publishing..." : "Publish to landing page"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your Shop Link will go live instantly.
              </p>
            </div>
          )}

          {/* Shop Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Shop Link</label>
            <div className="bg-muted/50 border border-border/50 rounded-xl p-3 flex items-center gap-2">
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
                className={cn(
                  "flex-1 h-11 rounded-xl font-medium transition-colors",
                  copiedLink && "bg-green-50 border-green-200 text-green-700"
                )}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy link
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenLandingPage}
                variant="outline"
                className="flex-1 h-11 rounded-xl font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open landing page
              </Button>
            </div>
          </div>

          {/* Caption Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Caption</label>
            <Textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              placeholder="Write your caption..."
              className="min-h-[100px] bg-muted/50 border-border/50 rounded-xl text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Copy this caption into your social post.
            </p>
            <Button
              onClick={handleCopyCaption}
              variant="outline"
              className={cn(
                "w-full h-11 rounded-xl font-medium transition-colors",
                copiedCaption && "bg-green-50 border-green-200 text-green-700"
              )}
              disabled={!localCaption.trim()}
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy caption
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostModeSheet;
