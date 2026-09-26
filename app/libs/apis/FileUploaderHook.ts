import { useState, useCallback } from "react";
import { getCookie } from "@node_modules/cookies-next/lib";
import { SWC_KEYS } from "@constants";
import { v1Router } from "./CustomeRouter";

interface FileUploaderConfig {
  file?: File;
  fileName?: string;
}

interface UseFileUploaderResult {
  uploadFile: (config: FileUploaderConfig) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

type ApiEnvelope = {
  error?: boolean;
  data?: unknown;
  message?: string;
};

function authConfig() {
  return {
    headers: {
      authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN) || ""}`,
    },
  };
}

function isOk(res: unknown): boolean {
  return typeof res === "object" && res !== null && (res as ApiEnvelope).error === false;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function uploadViaCloudinary(file: File, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);

  const res = (await v1Router.post("master/upload-file", formData, authConfig())) as ApiEnvelope;
  if (!isOk(res)) {
    throw new Error(typeof res?.message === "string" ? res.message : "Cloudinary upload failed");
  }

  if (res.data && typeof res.data === "object" && "url" in res.data) {
    const url = asString((res.data as { url?: unknown }).url);
    if (url) return url;
  }

  const direct = asString(res.data);
  if (direct) return direct;
  throw new Error("Cloudinary upload returned no URL");
}

export const useFileUploader = (): UseFileUploaderResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (config: FileUploaderConfig): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!config.file) {
        throw new Error("Missing file");
      }

      const fileName = config.fileName || config.file.name;
      return await uploadViaCloudinary(config.file, fileName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload failed:", err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadFile, loading, error };
};
