import cloudinary from "@/lib/cloudinary";

export const uploadImage = async (file, folder = "servify/documents") => {
  try {
    if (!file) return null;

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using promise
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};
