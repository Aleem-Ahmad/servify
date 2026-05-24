import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const baseDir = path.resolve(__dirname);
const publicDir = path.join(baseDir, 'public');

const filesToUpload = [
  'BG.jpg',
  'CNIC_BACK.jpeg',
  'CNIC_FRONT.jpeg',
  'favicon.png'
];

(async () => {
  for (const relPath of filesToUpload) {
    const absPath = path.join(publicDir, relPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`File not found: ${absPath}`);
      continue;
    }
    
    try {
      const result = await cloudinary.uploader.upload(absPath, {
        folder: 'public',
        use_filename: true,
        unique_filename: false,
        resource_type: 'image',
      });
      console.log(`✅ Uploaded ${relPath} → ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed ${relPath}:`, err.message);
    }
  }
})();
