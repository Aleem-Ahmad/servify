import {
  getSupabaseServerClient,
  isSupabaseStorageConfigured,
  SUPABASE_STORAGE_BUCKET,
} from "@/lib/supabaseServer";

export const uploadImage = async (file, folder = "servify/documents") => {
  try {
    if (!file) return null;
    if (!isSupabaseStorageConfigured()) {
      console.warn("Supabase storage is not configured - skipping upload");
      return null;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = getFileExtension(file.name, file.type);
    const safeFolder = folder.replace(/^\/+|\/+$/g, "");
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const path = `${safeFolder}/${safeName}`;
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }

    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    return {
      public_id: path,
      path,
      url: data.publicUrl,
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    return null;
  }
};

function getFileExtension(fileName = "", mimeType = "") {
  const fromName = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  if (fromName && fromName.length <= 10) return fromName.toLowerCase();

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return "";
}
