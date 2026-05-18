"use client";
import { CldImage } from 'next-cloudinary';

// By default, the CldImage component applies auto-format and auto-quality to all delivery URLs for optimized delivery.
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700">Cloudinary Integration Test</h1>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <CldImage
          src="cld-sample-5" // Use this sample image or upload your own via the Media Library
          width="500" // Transform the image: auto-crop to square aspect_ratio
          height="500"
          className="rounded-xl"
          crop={{
            type: 'auto',
            source: true
          }}
          alt="Cloudinary Sample Image"
        />
        <p className="mt-4 text-center text-gray-600 font-medium">
          If you see an image above, Cloudinary is working!
        </p>
      </div>
    </div>
  );
}
