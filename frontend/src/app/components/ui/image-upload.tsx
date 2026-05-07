import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  maxImages?: number;
  existingImages?: string[];
}

export function ImageUpload({ onImageUpload, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maksimal ${maxImages} gambar`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages((prev) => [...prev, result]);
        onImageUpload(result);
        toast.success("Gambar berhasil diunggah");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-emerald-400 bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-emerald-600" : "text-gray-400"}`} />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Klik atau drag gambar ke sini
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG hingga 5MB (maks {maxImages} gambar)
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add more button */}
          {images.length < maxImages && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-all"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Tambah</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
