import React, { useState, useRef } from "react";

interface BoardImageUploadProps {
  onUpload: (urls: string[]) => void;
}

export function BoardImageUpload({ onUpload }: BoardImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
      onUpload(uploadedUrls);
    } catch (error) {
      console.error("Upload error:", error);
      // You might want to add error handling UI here
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">
        Board Images
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer font-primary font-medium text-blue-600 hover:text-blue-500"
            >
              <span>Upload images</span>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
            <p className="pl-1 font-primary">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 font-primary">
            PNG, JPG, GIF up to 10MB
          </p>

          {uploading && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-primary">Uploading...</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
