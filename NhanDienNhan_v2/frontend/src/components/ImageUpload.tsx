import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import type { ProductCategory, SearchMode } from "../apis/imageApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  isLoading?: boolean;
}

const MAX_FILES = 3;
const SAMPLE_IMAGES_BY_CATEGORY: Record<
  ProductCategory,
  Array<{ name: string; path: string }>
> = {
  pesticide: [
    {
      name: "RidomilGold 1.jpg",
      path: "/sample-images/pesticide/RidomilGold 1.jpg",
    },
    {
      name: "RidomilGold 2.jpg",
      path: "/sample-images/pesticide/RidomilGold 2.jpg",
    },
  ],
  fertilizer: [
    {
      name: "AMINOLOM 40 1.jpg",
      path: "/sample-images/fertilizer/AMINOLOM 40 1.jpg",
    },
    {
      name: "AMINOLOM 40 2.jpg",
      path: "/sample-images/fertilizer/AMINOLOM 40 2.jpg",
    },
    {
      name: "AMINOLOM 40 3.jpg",
      path: "/sample-images/fertilizer/AMINOLOM 40 3.jpg",
    },
  ],
  fish_feed: [
    {
      name: "mekong 1.jpg",
      path: "/sample-images/fish_feed/mekong 1.jpg",
    },
    {
      name: "mekong 2.jpg",
      path: "/sample-images/fish_feed/mekong 2.jpg",
    },
  ],
  seed: [
    {
      name: "IMG_9237.jpg",
      path: "/sample-images/seed/IMG_9237.jpg",
    },
    {
      name: "IMG_9238.jpg",
      path: "/sample-images/seed/IMG_9238.jpg",
    },
  ],
};

const isSearchableCategory = (cat: ProductCategory) =>
  cat === "pesticide" || cat === "fertilizer";

export function ImageUpload({
  onFilesSelected,
  category,
  onCategoryChange,
  searchMode,
  onSearchModeChange,
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
      {/* Category Selector — Dropdown */}
      <div className="text-center">
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          📂 Chọn loại sản phẩm
        </label>
        <Select
          value={category}
          onValueChange={(val) => onCategoryChange(val as ProductCategory)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-11 text-base">
            <SelectValue placeholder="Chọn loại sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pesticide">
              🧴 Thuốc nông dược / Thuốc thuỷ sản
            </SelectItem>
            <SelectItem value="fertilizer">🌿 Phân bón</SelectItem>
            <SelectItem value="fish_feed">🐟 Thức ăn thủy sản</SelectItem>
            <SelectItem value="seed">🌱 Hạt giống</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Mode — only for pesticide/fertilizer */}
      {isSearchableCategory(category) && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">🔍 Tra cứu thông tin online</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: "none"        as SearchMode, label: "Không",          desc: "Chỉ dùng ảnh" },
              { mode: "always"      as SearchMode, label: "Luôn tra cứu",   desc: "Bổ sung từ CSDL nhà nước" },
              { mode: "interactive" as SearchMode, label: "Thông minh",      desc: "Tra cứu khi thiếu thông tin" },
            ] as const).map(({ mode, label, desc }) => (
              <button
                key={mode}
                type="button"
                disabled={isLoading}
                onClick={() => onSearchModeChange(mode)}
                className={`flex flex-col items-center text-center p-2.5 rounded-lg border-2 transition-all text-xs ${
                  searchMode === mode
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-semibold text-[11px] leading-tight">{label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm text-center">
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
        <div className="text-center">
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

      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Ảnh mẫu (bấm để thêm)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(SAMPLE_IMAGES_BY_CATEGORY[category] || []).map((sample) => (
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
