import { useState, useRef, useEffect } from "react";
import { RefreshCw, Download, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import shopableLogo from "@/assets/shopable-logo.png";

interface MobileHeaderProps {
  videoTitle: string;
  onTitleChange: (title: string) => void;
  onReplaceVideo: () => void;
  onExport: () => void;
  hasVideo: boolean;
}

// Two-dot menu icon component
const TwoDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="6" r="1.5" fill="currentColor" />
    <circle cx="10" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

const MobileHeader = ({
  videoTitle,
  onTitleChange,
  onReplaceVideo,
  onExport,
  hasVideo,
}: MobileHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(videoTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(videoTitle);
  }, [videoTitle]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    onTitleChange(editedTitle.trim() || "Untitled Video");
    setIsEditingTitle(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/[0.06] backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo (slightly larger) */}
        <img src={shopableLogo} alt="Shopable" className="h-[18px] w-auto" />

        {/* Center: Editable title */}
        <div className="flex-1 mx-4 min-w-0">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setEditedTitle(videoTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full text-center text-sm font-medium bg-transparent border-b-2 border-primary outline-none px-2 py-0.5 text-foreground"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="w-full text-center text-sm font-medium text-foreground truncate hover:text-primary transition-colors"
            >
              {videoTitle}
            </button>
          )}
        </div>

        {/* Right: Two-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground">
              <TwoDotsIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            {hasVideo && (
              <>
                <DropdownMenuItem onClick={onReplaceVideo} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Replace video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Help & Feedback
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default MobileHeader;
