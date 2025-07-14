import { useState, useCallback } from "react";
import { v1Router } from "./CustomeRouter";

interface FileUploaderConfig {
  file?: File;
  fileName?: string;
  contentType?: string;
}

interface UseFileUploaderResult {
  uploadFile: (config: FileUploaderConfig) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useFileUploader = (): UseFileUploaderResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (config: FileUploaderConfig): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await v1Router.post("master/upload-to-s3", {
        fileName: config.fileName,
        contentType: config.contentType,
      });

      const putUrl = res?.data;
      if (!putUrl || !config.file) {
        throw new Error("Missing PUT URL or file");
      }

      const blobData = new Blob([config.file]);

      const putResponse = await fetch(putUrl, {
        method: "PUT",
        body: blobData,
        headers: {
          "Content-Type": config.contentType || "application/octet-stream",
        },
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed with status ${putResponse.status}`);
      }

      const encodedKey = encodeURIComponent(config.fileName || "");
      const fileRes = await v1Router.get(`master/get-uploaded-file/${encodedKey}`);

      if (fileRes?.data) {
        return fileRes.data as string;
      } else {
        throw new Error("Failed to fetch uploaded file URL");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadFile, loading, error };
};
