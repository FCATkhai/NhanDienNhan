import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ProductInfo } from "../apis/imageApi";

interface FishFeedResultsProps {
  data: ProductInfo;
  images: File[];
  onReset: () => void;
}

export function FishFeedResults({
  data,
  images,
  onReset,
}: FishFeedResultsProps) {
  const confidence = data.confidence_score ? data.confidence_score * 100 : 0;

  if (!data.success) {
    return (
      <div className="space-y-6">
        {/* Images Section */}
        <div className="border-b-2 border-blue-400 pb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            📷 Ảnh đã tải lên ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error Section */}
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-16 w-16 text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể trích xuất thông tin
          </h2>
          <p className="text-gray-600 mb-4">{data.message}</p>
          {data.error_code && data.error_code !== "NONE" && (
            <p className="text-sm text-gray-500 mb-6">
              Mã lỗi: {data.error_code}
            </p>
          )}
        </div>

        <button
          onClick={onReset}
          className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
        >
          ↺ Tải lên ảnh mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="border-b-2 border-blue-400 pb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          📷 Ảnh đã tải lên ({images.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Header */}
      <div className="border-b-2 border-blue-600 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {data.product_name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.variant_code && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-blue-600">
                Mã biến thể
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.variant_code}
              </p>
            </div>
          )}
          {data.species && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-blue-600">
                Loài cá
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.species}
              </p>
            </div>
          )}
          {data.manufacturer && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-blue-600">
                Nhà sản xuất
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.manufacturer}
              </p>
            </div>
          )}
          {data.net_content && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-blue-600">
                Dung lượng
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.net_content}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Type */}
      {data.product_type && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            📦 Loại sản phẩm
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm font-medium text-gray-900">
              {data.product_type}
            </p>
          </div>
        </div>
      )}

      {/* Ingredients */}
      {data.ingredients && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🥣 Thành phần
          </h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {data.ingredients}
            </p>
          </div>
        </div>
      )}

      {/* Nutrition Facts */}
      {data.nutrition_facts && data.nutrition_facts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            📊 Thành phần dinh dưỡng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.nutrition_facts.map((fact, index) => (
              <div
                key={index}
                className="bg-green-50 border-l-4 border-green-400 p-3 rounded"
              >
                <p className="text-xs font-semibold text-green-700">
                  {fact.name}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feeding Guide */}
      {data.feeding_guide && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🍽️ Hướng dẫn cho ăn
          </h2>
          {data.feeding_guide.code && (
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Mã: {data.feeding_guide.code}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2">
            {data.feeding_guide.guide &&
              data.feeding_guide.guide.map((item, index) => (
                <div
                  key={index}
                  className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded"
                >
                  <p className="text-xs font-semibold text-indigo-700">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {data.confidence_score !== undefined && (
        <div className="flex items-center gap-2 pt-4 border-t">
          <CheckCircle2
            className={`h-5 w-5 ${confidence >= 80 ? "text-green-600" : "text-amber-600"}`}
          />
          <span
            className={`text-sm font-semibold ${confidence >= 80 ? "text-green-700" : "text-amber-700"}`}
          >
            Độ tin cậy: {confidence.toFixed(0)}%
          </span>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
      >
        ↺ Tải lên ảnh mới
      </button>
    </div>
  );
}
