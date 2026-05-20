import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ProductData {
  success: boolean;
  message?: string;
  error_code?: string;
  product_name?: string;
  product_type?: string;
  manufacturer?: string;
  registration_number?: string;
  active_ingredients?: Array<{ name: string; content: string }>;
  dosage?: string;
  target_crops?: string[];
  target_pests?: string[];
  pre_harvest_interval_days?: number;
  confidence_score?: number;
}

interface ProductResultsProps {
  data: ProductData;
  images: File[];
  onReset: () => void;
}

export function ProductResults({ data, images, onReset }: ProductResultsProps) {
  const confidence = data.confidence_score ? data.confidence_score * 100 : 0;

  if (!data.success) {
    return (
      <div className="space-y-6">
        {/* Images Section */}
        <div className="border-b-2 border-purple-400 pb-6">
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
          className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
        >
          ↺ Tải lên ảnh mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="border-b-2 border-purple-400 pb-6">
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
      <div className="border-b-2 border-purple-600 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {data.product_name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.product_type && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-purple-600">
                Loại
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.product_type}
              </p>
            </div>
          )}
          {data.manufacturer && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-purple-600">
                Nhà sản xuất
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.manufacturer}
              </p>
            </div>
          )}
          {data.registration_number && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-purple-600">
                Số đăng ký
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {data.registration_number}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Ingredients */}
      {data.active_ingredients && data.active_ingredients.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🧪 Thành phần hoạt chất
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {data.active_ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded"
              >
                <p className="font-semibold text-gray-900">{ingredient.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {ingredient.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dosage */}
      {data.dosage && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            📋 Cách sử dụng & Liều lượng
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {data.dosage}
            </p>
          </div>
        </div>
      )}

      {/* Target Crops */}
      {data.target_crops && data.target_crops.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🌱 Cây trồng
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.target_crops.map((crop, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Pests */}
      {data.target_pests && data.target_pests.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🐛 Sâu bệnh mục tiêu
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.target_pests.map((pest, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {pest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pre-harvest Interval */}
      {data.pre_harvest_interval_days && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            ⏰ Thời gian cách ly trước thu hoạch
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-lg font-semibold text-gray-900">
              {data.pre_harvest_interval_days} ngày
            </p>
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
        className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
      >
        ↺ Tải lên ảnh mới
      </button>
    </div>
  );
}
