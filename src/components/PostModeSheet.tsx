import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, Image, Check, Link2 } from "lucide-react";
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
  onDownloadVideo?: () => void;
  onSaveToGallery?: () => void;
  creatorKuerzel?: string;
  videoSlug?: string;
}

const DEFAULT_CAPTION = `Shop what you see 👀✨
Tap the link to explore the products from this video.

#shopable`;

/**
 * Post mode bottom sheet.
 * Shows video preview summary and actions:
 * - Download video
 * - Save to gallery
 * - Copy caption
 * - Copy shop link
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
  onDownloadVideo,
  onSaveToGallery,
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
      await navigator.clipboard.writeText(shopLink);
      setCopiedLink(true);
      toast.success("Link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = () => {
    if (onDownloadVideo) {
      onDownloadVideo();
    } else {
      toast.info("Download feature coming soon");
    }
  };

  const handleSaveToGallery = () => {
    if (onSaveToGallery) {
      onSaveToGallery();
    } else {
      toast.info("Save to gallery feature coming soon");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-[20px] px-6 py-5 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold text-center">
            🎉 Ready to Post
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Video Preview Summary */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
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

          {/* Caption Section - Editable */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Caption</label>
            <Textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              placeholder="Write your caption..."
              className="min-h-[100px] bg-neutral-50 border-neutral-200 rounded-xl text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Edit the caption above, then copy to your post
            </p>
          </div>

          {/* Shop Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Shop Link</label>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground font-mono truncate flex-1">
                {shopLink}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste this link into your bio or post description
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary: Download */}
            <Button
              onClick={handleDownload}
              className="w-full h-12 rounded-xl font-medium"
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>

            {/* Secondary row: Save to Gallery */}
            <Button
              onClick={handleSaveToGallery}
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
            >
              <Image className="w-4 h-4 mr-2" />
              Save to Gallery
            </Button>

            {/* Copy buttons row */}
            <div className="flex gap-3">
              <Button
                onClick={handleCopyCaption}
                variant="outline"
                className={cn(
                  "flex-1 h-12 rounded-xl font-medium transition-colors",
                  copiedCaption && "bg-green-50 border-green-200 text-green-700"
                )}
              >
                {copiedCaption ? (
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

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className={cn(
                  "flex-1 h-12 rounded-xl font-medium transition-colors",
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
                    <Link2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostModeSheet;
