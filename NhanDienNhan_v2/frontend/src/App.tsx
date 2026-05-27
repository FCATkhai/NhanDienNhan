import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { PesticideResults } from "./components/PesticideResults";
import { FishFeedResults } from "./components/FishFeedResults";
import type { ProductInfo, ProductCategory } from "./apis/imageApi";
import { LoadingIndicator } from "./components/LoadingIndicator";
import {
  uploadMultipleImagesForAnalysis,
  parseProductInfo,
} from "./apis/imageApi";
import "./App.css";

type ViewState = "upload" | "loading" | "results";

function App() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<ProductCategory>("pesticide");
  const [productData, setProductData] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string>("");

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
      console.log(
        "📤 Gửi yêu cầu đến:",
        `/api/image/analyze?category=${category}`,
      );
      const response = await uploadMultipleImagesForAnalysis(
        selectedFiles,
        category,
      );

      console.log("📥 Phản hồi từ server:", response);

      if (!response.success) {
        setError(response.message || "Lỗi khi phân tích ảnh");
        setViewState("upload");
        return;
      }

      const productInfo = parseProductInfo(response);
      console.log("✅ Thông tin sản phẩm:", productInfo);

      setProductData(productInfo);
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
    setError("");
    setViewState("upload");
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
                isLoading={false}
              />
              <button
                onClick={handleSubmit}
                disabled={selectedFiles.length === 0}
                className={`w-full mt-8 py-3 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  category === "fish_feed"
                    ? "bg-linear-to-r from-blue-600 to-blue-700"
                    : "bg-linear-to-r from-purple-600 to-purple-700"
                }`}
              >
                Phân tích ảnh
              </button>
            </>
          )}

          {viewState === "loading" && <LoadingIndicator />}

          {viewState === "results" && productData && (
            <>
              {category === "pesticide" ? (
                <PesticideResults
                  data={productData}
                  images={selectedFiles}
                  onReset={handleReset}
                />
              ) : (
                <FishFeedResults
                  data={productData}
                  images={selectedFiles}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
