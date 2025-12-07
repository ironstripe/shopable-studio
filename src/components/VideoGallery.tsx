import { useState } from "react";
import { VideoDto } from "@/services/video-api";
import { cn } from "@/lib/utils";
import { Play, Film, RefreshCw, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";

interface VideoGalleryProps {
  videos: VideoDto[];
  isLoading: boolean;
  error: string | null;
  onSelectVideo: (video: VideoDto) => void;
  onRetry: () => void;
  onUploadClick: () => void;
}

const VideoGallery = ({
  videos,
  isLoading,
  error,
  onSelectVideo,
  onRetry,
  onUploadClick,
}: VideoGalleryProps) => {
  const { t } = useLocale();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen-safe flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-neutral-50 to-neutral-100/80">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen-safe flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-neutral-50 to-neutral-100/80">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Failed to load videos
            </h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="w-full min-h-screen-safe flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-neutral-50 to-neutral-100/80">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              No videos yet
            </h2>
            <p className="text-muted-foreground text-sm">
              Upload one to start editing.
            </p>
          </div>
          <Button onClick={onUploadClick} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
        </div>
      </div>
    );
  }

  // Video grid
  return (
    <div className="w-full min-h-screen-safe px-5 py-8 bg-gradient-to-b from-neutral-50 to-neutral-100/80">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">Your Videos</h1>
          <Button onClick={onUploadClick} variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload New
          </Button>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelectVideo(video)}
              onMouseEnter={() => setHoveredId(video.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative aspect-video rounded-xl overflow-hidden",
                "bg-neutral-200 border border-border",
                "transition-all duration-200",
                "hover:shadow-lg hover:border-primary/30 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              {/* Thumbnail or placeholder */}
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title || "Video thumbnail"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <Film className="w-12 h-12 text-neutral-400" />
                </div>
              )}

              {/* Play overlay on hover */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-black/40 transition-opacity duration-200",
                  hoveredId === video.id ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Video info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm font-medium truncate text-left">
                  {video.title || "Untitled Video"}
                </p>
                {video.durationSeconds && (
                  <p className="text-white/70 text-xs text-left">
                    {formatDuration(video.durationSeconds)}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default VideoGallery;
