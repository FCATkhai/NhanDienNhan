import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { PesticideResults } from "./components/PesticideResults";
import { FishFeedResults } from "./components/FishFeedResults";
import { FertilizerResults } from "./components/FertilizerResults";
import type {
  ProductInfo,
  ProductCategory,
  SearchMetadata,
  SearchMode,
} from "./apis/imageApi";
import { LoadingIndicator } from "./components/LoadingIndicator";
import {
  uploadMultipleImagesForAnalysis,
  parseProductInfo,
} from "./apis/imageApi";
import { Switch } from "./components/ui/switch";
import "./App.css";

type ViewState = "upload" | "loading" | "results";

const isSearchableCategory = (cat: ProductCategory) =>
  cat === "pesticide" || cat === "fertilizer";

function App() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<ProductCategory>("pesticide");
  const [productData, setProductData] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string>("");

  // Search enrichment state
  const [searchMode, setSearchMode] = useState<SearchMode>("none");
  const [originalData, setOriginalData] = useState<ProductInfo | null>(null);
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | null>(
    null,
  );
  const [showEnriched, setShowEnriched] = useState(true);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setError("");
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    setViewState("loading");
    setError("");

    try {
      const shouldSearch =
        searchMode !== "none" && isSearchableCategory(category);

      console.log(
        "📤 Gửi yêu cầu đến:",
        `/api/image/analyze?category=${category}&searchMode=${shouldSearch ? searchMode : "off"}`,
      );

      // Single API call — if search is enabled, backend returns enriched + raw
      const response = await uploadMultipleImagesForAnalysis(
        selectedFiles,
        category,
        shouldSearch ? searchMode : "none",
      );

      console.log("📥 Phản hồi từ server:", response);

      if (!response.success) {
        setError(response.message || "Lỗi khi phân tích ảnh");
        setViewState("upload");
        return;
      }

      // Parse the enriched (or only) result
      const productInfo = parseProductInfo(response);
      console.log("✅ Thông tin sản phẩm:", productInfo);

      setProductData(productInfo);

      // Parse the original (pre-enrichment) result if available
      if (shouldSearch && response.data?.raw) {
        const rawResponse = {
          ...response,
          data: { ...response.data, response: response.data.raw },
        };
        const rawProductInfo = parseProductInfo(rawResponse);
        setOriginalData(rawProductInfo);
        setSearchMetadata(response.data.search_metadata ?? null);
        setShowEnriched(true);
      } else {
        setOriginalData(null);
        setSearchMetadata(null);
      }

      setViewState("results");
    } catch (err) {
      console.error("❌ Lỗi:", err);
      setError("Lỗi khi xử lý ảnh. Vui lòng thử lại.");
      setViewState("upload");
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setProductData(null);
    setOriginalData(null);
    setSearchMetadata(null);
    setShowEnriched(true);
    setError("");
    setViewState("upload");
  };

  // Determine which data to display (enriched vs original)
  const displayData =
    originalData && productData
      ? showEnriched
        ? productData
        : originalData
      : productData;

  // Button gradient based on category
  const getButtonGradient = () => {
    switch (category) {
      case "fish_feed":
        return "bg-linear-to-r from-blue-600 to-blue-700";
      case "fertilizer":
        return "bg-linear-to-r from-emerald-600 to-emerald-700";
      default:
        return "bg-linear-to-r from-purple-600 to-purple-700";
    }
  };

  return (
    <div className="min-h-screen bg py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🌾 Nhận diện sản phẩm</h1>
          <p className="text-lg opacity-90">
            Tải ảnh sản phẩm để trích xuất thông tin
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {viewState === "upload" && (
            <>
              <ImageUpload
                onFilesSelected={handleFilesSelected}
                category={category}
                onCategoryChange={setCategory}
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
                isLoading={false}
              />
              <button
                onClick={handleSubmit}
                disabled={selectedFiles.length === 0}
                className={`w-full mt-8 py-3 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getButtonGradient()}`}
              >
                Phân tích ảnh
              </button>
            </>
          )}

          {viewState === "loading" && <LoadingIndicator />}

          {viewState === "results" && displayData && (
            <>
              {/* Comparison Toggle — only when both original and enriched exist */}
              {originalData && productData && (
                <div className="flex items-center justify-between mb-6 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {showEnriched
                        ? "📡 Kết quả sau tra cứu"
                        : "📷 Kết quả gốc từ ảnh"}
                    </span>
                    {searchMetadata?.search_status === "enriched" &&
                      showEnriched && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {searchMode === "interactive"
                            ? "Tra cứu thông minh"
                            : "Đã tra cứu"}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">So sánh</span>
                    <Switch
                      checked={showEnriched}
                      onCheckedChange={setShowEnriched}
                    />
                  </div>
                </div>
              )}

              {/* Results by category */}
              {category === "pesticide" && (
                <PesticideResults
                  data={displayData}
                  images={selectedFiles}
                  onReset={handleReset}
                />
              )}
              {category === "fertilizer" && (
                <FertilizerResults
                  data={displayData}
                  images={selectedFiles}
                  onReset={handleReset}
                />
              )}
              {category === "fish_feed" && (
                <FishFeedResults
                  data={displayData}
                  images={selectedFiles}
                  onReset={handleReset}
                />
              )}

              {/* Government source URL */}
              {searchMetadata?.source_url && showEnriched && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    Nguồn dữ liệu chính thức
                  </p>
                  <a
                    href={searchMetadata.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {searchMetadata.source_url}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
