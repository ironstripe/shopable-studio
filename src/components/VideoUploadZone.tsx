// src/components/VideoUploadZone.tsx

// NEU: Importiere die Funktionen aus video-api.ts
import { registerUpload, uploadToS3 } from "@/services/video-api"; // Angenommen, video-api liegt unter "@/services/"

// ... (Rest der Imports) ...

const uploadFile = useCallback(
  async (file: File) => {
    // ... (isApiConfigured Check bleibt) ...

    console.log("[Upload] Starting S3-Presigned upload process...");
    console.log("[Upload] File:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    setIsUploading(true);

    try {
      // SCHRITT 1: Upload bei Backend registrieren und S3 URL anfordern
      const registerResponse = await registerUpload({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      const { uploadUrl, videoId, fileUrl } = registerResponse;

      console.log("[Upload] Received Presigned URL and Video ID:", { videoId, uploadUrl });

      // SCHRITT 2: Datei DIREKT an S3 hochladen (PUT-Request)
      await uploadToS3(uploadUrl, file);

      console.log("[Upload] S3 upload successful.");

      // SCHRITT 3: Verarbeitung der End-URL und Aktualisierung
      const finalUrl = fileUrl || uploadUrl.split("?")[0]; // Final URL ist entweder im Payload oder die bereinigte Upload URL

      if (!finalUrl) {
        throw new Error("Could not determine final video URL after S3 upload.");
      }

      console.log("[Upload] Using final video URL:", finalUrl);

      onVideoLoad(finalUrl, videoId);
      onUploadComplete();
      toast.success("Upload successful");
    } catch (err) {
      // ... (Error Handling bleibt gleich) ...
      console.error("[Upload] Error:", err);

      if (err instanceof TypeError) {
        toast.error("Network error. Check API configuration, CORS, or backend availability.");
      } else if (err instanceof Error) {
        toast.error(`Upload failed: ${err.message}`);
      } else {
        toast.error("Upload failed.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  },
  [onVideoLoad, onUploadComplete],
);
