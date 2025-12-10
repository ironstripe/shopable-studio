import { CheckCircle, Copy, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";
import { RenderStatus } from "@/services/video-api";

interface VideoExportSectionProps {
  renderStatus?: RenderStatus | null;
  renderUpdatedAt?: string | null;
  fileUrl?: string;
  isExporting: boolean;
  onExport: () => void;
}

function formatRenderDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const VideoExportSection = ({
  renderStatus,
  renderUpdatedAt,
  fileUrl,
  isExporting,
  onExport,
}: VideoExportSectionProps) => {
  const { t } = useLocale();
  const isReady = renderStatus === "READY";

  const handleCopyUrl = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl);
      toast.success(t("export.copied"));
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mx-3 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <Download className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{t("export.title")}</span>
      </div>

      {isReady ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{t("export.ready")}</span>
          </div>
          {renderUpdatedAt && (
            <p className="text-xs text-muted-foreground">
              {t("export.lastUpdated")}: {formatRenderDate(renderUpdatedAt)}
            </p>
          )}
          {fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {t("export.copyUrl")}
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="w-full gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("export.exporting")}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t("export.button")}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default VideoExportSection;
