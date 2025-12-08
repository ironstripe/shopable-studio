import { VideoDto } from "@/services/video-api";
import { cn } from "@/lib/utils";
import { Play, Film, RefreshCw, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoGalleryProps {
  videos: VideoDto[];
  isLoading: boolean;
  error: string | null;
  onSelectVideo: (video: VideoDto) => void;
  onRetry: () => void;
  onUploadClick: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadgeClasses(status: string): string {
  switch (status.toUpperCase()) {
    case "READY":
    case "UPLOADED":
      return "bg-green-100 text-green-700";
    case "REGISTERED":
      return "bg-orange-100 text-orange-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

function SkeletonCard() {
  return (
    <div className="w-full flex rounded-xl overflow-hidden bg-card border border-border shadow-sm animate-pulse">
      {/* Left: Thumbnail skeleton */}
      <div className="w-[120px] shrink-0 aspect-video bg-muted" />
      {/* Right: Info skeleton */}
      <div className="flex-1 p-3 flex flex-col justify-center space-y-2">
        <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
        <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
        <div className="h-4 bg-muted-foreground/10 rounded w-16" />
      </div>
    </div>
  );
}

const VideoGallery = ({
  videos,
  isLoading,
  error,
  onSelectVideo,
  onRetry,
  onUploadClick,
}: VideoGalleryProps) => {

  // Sort videos by newest first
  const sortedVideos = [...videos].sort((a, b) => b.createdAt - a.createdAt);

  // Loading state - show 3 skeleton cards
  if (isLoading) {
    return (
      <div className="w-full h-full overflow-y-auto px-3 py-4 bg-background">
        <div className="max-w-lg mx-auto space-y-3">
          <h1 className="text-lg font-semibold text-foreground mb-3">Your Videos</h1>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full overflow-y-auto px-3 py-4 bg-background">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-foreground mb-3">Your Videos</h1>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-foreground font-medium text-sm mb-1">Could not load videos</p>
              <p className="text-muted-foreground text-xs">Please try again.</p>
            </div>
            <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="w-full h-full overflow-y-auto px-3 py-4 bg-background flex flex-col">
        <div className="max-w-lg mx-auto w-full">
          <h1 className="text-lg font-semibold text-foreground mb-3">Your Videos</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-3 -mt-16">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Film className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">No videos yet</h2>
          <p className="text-muted-foreground text-xs text-center mb-5">
            Upload your first shoppable video to get started.
          </p>
          <Button onClick={onUploadClick} size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload new
          </Button>
        </div>
      </div>
    );
  }

  // Video list
  return (
    <div className="w-full h-full overflow-y-auto px-3 py-4 bg-background">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-foreground">Your Videos</h1>
          <Button onClick={onUploadClick} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
        </div>

        {/* Video cards */}
        <div className="space-y-3">
          {sortedVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className={cn(
                "w-full flex rounded-xl overflow-hidden bg-card border border-border shadow-sm",
                "text-left transition-all duration-150",
                "hover:shadow-md hover:border-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              )}
            >
              {/* Left: Thumbnail */}
              <div className="w-[120px] shrink-0 aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                <Play className="w-6 h-6 text-primary/70" fill="currentColor" />
              </div>

              {/* Right: Info */}
              <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                <p className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                  {video.title}
                </p>
                <p className="text-muted-foreground text-xs mb-1.5">
                  {formatDate(video.createdAt)}
                </p>
                <span className={cn(
                  "self-start px-1.5 py-0.5 rounded text-[10px] font-medium",
                  getStatusBadgeClasses(video.status)
                )}>
                  {video.status.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
