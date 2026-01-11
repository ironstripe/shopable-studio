import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, Copy, Image, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VideoCTA as VideoCTAType } from "@/types/video";

interface PostModeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoSrc: string | null;
  videoTitle: string;
  videoCTA?: VideoCTAType;
  caption?: string;
  hotspotCount: number;
  onDownloadVideo?: () => void;
  onSaveToGallery?: () => void;
}

/**
 * Post mode bottom sheet.
 * Shows video preview summary and actions:
 * - Download video
 * - Save to gallery
 * - Copy caption
 */
const PostModeSheet = ({
  open,
  onOpenChange,
  videoSrc,
  videoTitle,
  videoCTA,
  caption = "",
  hotspotCount,
  onDownloadVideo,
  onSaveToGallery,
}: PostModeSheetProps) => {
  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleCopyCaption = async () => {
    if (!caption) {
      toast.error("No caption to copy");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      toast.success("Caption copied!");
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      toast.error("Failed to copy caption");
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
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[20px] px-6 py-5">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold text-center">
            Ready to Post
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

          {/* Caption Section */}
          {caption && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Caption</label>
              <div className="bg-neutral-50 rounded-xl p-3 text-sm text-muted-foreground max-h-24 overflow-y-auto">
                {caption}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleDownload}
              className="w-full h-12 rounded-xl font-medium"
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>

            <Button
              onClick={handleSaveToGallery}
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
            >
              <Image className="w-4 h-4 mr-2" />
              Save to Gallery
            </Button>

            {caption && (
              <Button
                onClick={handleCopyCaption}
                variant="outline"
                className={cn(
                  "w-full h-12 rounded-xl font-medium transition-colors",
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
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostModeSheet;
