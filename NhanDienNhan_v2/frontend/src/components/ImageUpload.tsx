import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
}

const MAX_FILES = 3;
const SAMPLE_IMAGES = [
  { name: "RidomilGold 1.jpg", path: "/sample-images/RidomilGold 1.jpg" },
  { name: "RidomilGold 2.jpg", path: "/sample-images/RidomilGold 2.jpg" },
];

export function ImageUpload({
  onFilesSelected,
  isLoading = false,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (fileArray.length === 0) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (fileArray.length + selectedFiles.length > MAX_FILES) {
      setError(
        `Tối đa ${MAX_FILES} ảnh. Số lượng hiện tại: ${selectedFiles.length + fileArray.length}`,
      );
      return;
    }

    setError("");
    const newFiles = [...selectedFiles, ...fileArray];
    setSelectedFiles(newFiles);

    // Generate previews
    const newPreviews: string[] = [];
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === fileArray.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    onFilesSelected(newFiles);
  };

  const addSampleImage = async (url: string, name: string) => {
    if (selectedFiles.length >= MAX_FILES) {
      setError(`Tối đa ${MAX_FILES} ảnh.`);
      return;
    }
    if (selectedFiles.some((f) => f.name === name)) {
      setError("Ảnh mẫu đã được thêm");
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        setError("Không thể tải ảnh mẫu");
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], name, { type: blob.type });
      const newFiles = [...selectedFiles, file];
      setSelectedFiles(newFiles);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);

      setError("");
      onFilesSelected(newFiles);
    } catch {
      setError("Không thể tải ảnh mẫu");
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-purple-600 bg-purple-50"
            : "border-purple-400 bg-blue-50 hover:bg-purple-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-purple-600 mb-3" />
        <div className="text-base font-medium text-gray-900">
          Nhấp hoặc kéo ảnh vào đây
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Tải lên 1-3 ảnh sản phẩm (JPG, PNG, WebP)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files!)}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Ảnh đã tải lên
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {selectedFiles.length}/{MAX_FILES} ảnh đã chọn
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Ảnh mẫu (bấm để thêm)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.name}
              onClick={() => addSampleImage(sample.path, sample.name)}
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square hover:ring-2 hover:ring-purple-500 transition-all"
              disabled={isLoading}
            >
              <img
                src={sample.path}
                alt={sample.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
