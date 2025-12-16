import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, Download, HelpCircle, Trash2, MoreVertical, Check, Globe, FolderOpen, Loader2, LogOut, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import shopableLogo from "@/assets/shopable-logo.png";
import { RenderStatus } from "@/services/video-api";

// Internal flag to control Export visibility (set to true for admin/internal mode)
const ENABLE_EXPORT = false;

interface MobileHeaderProps {
  videoTitle: string;
  onTitleChange: (title: string) => void;
  onReplaceVideo: () => void;
  onExport: () => void;
  hasVideo: boolean;
  onBack?: () => void;
  onDeleteVideo?: () => void;
  onOpenVideoGallery?: () => void;
  onFinalize?: () => void;
  isExporting?: boolean;
  renderStatus?: RenderStatus | null;
  canFinalize?: boolean;
}

const MobileHeader = ({
  videoTitle,
  onTitleChange,
  onReplaceVideo,
  onExport,
  hasVideo,
  onBack,
  onDeleteVideo,
  onOpenVideoGallery,
  onFinalize,
  isExporting = false,
  renderStatus,
  canFinalize = false,
}: MobileHeaderProps) => {
  const { signOut } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(videoTitle);
  const [showSavedCheck, setShowSavedCheck] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    const newTitle = editedTitle.trim() || t("header.untitled");
    onTitleChange(newTitle);
    setIsEditingTitle(false);
    
    // Show saved checkmark animation
    setShowSavedCheck(true);
    setTimeout(() => setShowSavedCheck(false), 1500);
  };

  const toggleLanguage = () => {
    setLocale(locale === "de" ? "en" : "de");
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDeleteVideo?.();
  };

  return (
    <>
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
            <img src={shopableLogo} alt="Shopable" className="h-[54px] w-auto" />
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

          {/* Right: Finalize button + My Videos button + Three-dot menu */}
          <div className="flex items-center gap-1">
            {/* Finalize button - show when video has complete hotspots */}
            {hasVideo && canFinalize && onFinalize && (
              <button
                onClick={onFinalize}
                className="h-9 px-4 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Finalize</span>
              </button>
            )}
            
            {/* My Videos button - show when on entry screen (no video) */}
            {!hasVideo && onOpenVideoGallery && (
              <button
                onClick={onOpenVideoGallery}
                className="h-9 px-3 flex items-center gap-1.5 rounded-full hover:bg-white/10 transition-colors text-muted-foreground text-sm font-medium"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">My Videos</span>
              </button>
            )}
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground -mr-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              {hasVideo && (
                <>
                  {/* Export - only visible when ENABLE_EXPORT is true */}
                  {ENABLE_EXPORT && (
                    <DropdownMenuItem 
                      onClick={onExport} 
                      className="gap-2"
                      disabled={isExporting || renderStatus === "PENDING"}
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isExporting ? t("export.exporting") : t("header.export")}
                    </DropdownMenuItem>
                  )}
                  
                  {/* Replace video with helper text */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem onClick={onReplaceVideo} className="gap-2 flex-col items-start">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            {t("header.replace")}
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {t("header.replaceHelper")}
                          </span>
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{t("header.replaceHelper")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Delete video - destructive with confirmation */}
                  {onDeleteVideo && (
                    <DropdownMenuItem 
                      onClick={handleDeleteClick} 
                      className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("header.delete")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={toggleLanguage} className="gap-2">
                <Globe className="w-4 h-4" />
                {locale === "de" ? t("app.language.en") : t("app.language.de")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/help")} className="gap-2">
                <HelpCircle className="w-4 h-4" />
                {t("header.help")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("header.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("header.deleteConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("header.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MobileHeader;
