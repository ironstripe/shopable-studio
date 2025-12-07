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
    <div className="w-full rounded-xl overflow-hidden bg-card border border-border shadow-sm animate-pulse">
      {/* Top area skeleton */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
      </div>
      {/* Bottom bar skeleton */}
      <div className="p-4 space-y-2">
        <div className="h-5 bg-muted-foreground/10 rounded w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted-foreground/10 rounded w-1/2" />
          <div className="h-5 bg-muted-foreground/10 rounded w-16" />
        </div>
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

  // Loading state - show 3 skeleton cards
  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-4 py-6 bg-background">
        <div className="max-w-lg mx-auto space-y-4">
          <h1 className="text-xl font-semibold text-foreground mb-4">Your Videos</h1>
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
      <div className="w-full min-h-screen px-4 py-6 bg-background">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-semibold text-foreground mb-4">Your Videos</h1>
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">Could not load videos</p>
              <p className="text-muted-foreground text-sm">Please try again.</p>
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
      <div className="w-full min-h-screen px-4 py-6 bg-background flex flex-col">
        <div className="max-w-lg mx-auto w-full">
          <h1 className="text-xl font-semibold text-foreground mb-4">Your Videos</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No videos yet</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Upload your first shoppable video to get started.
          </p>
          <Button onClick={onUploadClick} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload new
          </Button>
        </div>
      </div>
    );
  }

  // Video list
  return (
    <div className="w-full min-h-screen px-4 py-6 bg-background">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Your Videos</h1>
          <Button onClick={onUploadClick} variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload new
          </Button>
        </div>

        {/* Video cards */}
        <div className="space-y-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className={cn(
                "w-full rounded-xl overflow-hidden bg-card border border-border shadow-sm",
                "text-left transition-all duration-150",
                "hover:shadow-md hover:border-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              {/* Top area with play icon */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-background/90 shadow-lg flex items-center justify-center">
                  <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 bg-card">
                <p className="font-semibold text-foreground truncate mb-1">
                  {video.title}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-muted-foreground text-sm truncate">
                    {video.status.toUpperCase()} · {formatDate(video.createdAt)}
                  </p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                    getStatusBadgeClasses(video.status)
                  )}>
                    {video.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
