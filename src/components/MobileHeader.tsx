import { useState, useRef, useEffect } from "react";
import { ChevronLeft, RefreshCw, Download, HelpCircle, Trash2, Settings, MoreVertical, Check } from "lucide-react";
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
  onBack?: () => void;
  onDeleteVideo?: () => void;
}

const MobileHeader = ({
  videoTitle,
  onTitleChange,
  onReplaceVideo,
  onExport,
  hasVideo,
  onBack,
  onDeleteVideo,
}: MobileHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(videoTitle);
  const [showSavedCheck, setShowSavedCheck] = useState(false);
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
    const newTitle = editedTitle.trim() || "Untitled Video";
    onTitleChange(newTitle);
    setIsEditingTitle(false);
    
    // Show saved checkmark animation
    setShowSavedCheck(true);
    setTimeout(() => setShowSavedCheck(false), 1500);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/[0.06] backdrop-blur-xl border-b border-white/10 pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back Arrow or Logo */}
        {hasVideo && onBack ? (
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-foreground -ml-1"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <img src={shopableLogo} alt="Shopable" className="h-[18px] w-auto" />
        )}

        {/* Center: Editable title */}
        <div className="flex-1 mx-3 min-w-0 flex items-center justify-center gap-1.5">
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
              className="w-full max-w-[200px] text-center text-sm font-medium bg-transparent border-b-2 border-primary outline-none px-2 py-0.5 text-foreground"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-medium text-foreground truncate max-w-[180px] hover:text-primary transition-colors"
            >
              {videoTitle}
            </button>
          )}
          
          {/* Saved checkmark animation */}
          {showSavedCheck && (
            <div className="animate-fade-in">
              <Check className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>

        {/* Right: Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground -mr-1">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            {hasVideo && (
              <>
                <DropdownMenuItem onClick={onExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReplaceVideo} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Replace video
                </DropdownMenuItem>
                {onDeleteVideo && (
                  <DropdownMenuItem onClick={onDeleteVideo} className="gap-2 text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Delete video
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="gap-2 opacity-50">
                  <Settings className="w-4 h-4" />
                  Video settings
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
