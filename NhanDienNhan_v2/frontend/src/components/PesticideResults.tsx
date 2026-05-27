import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductInfo } from "../apis/imageApi";
import { getFieldWarning, isFieldEmpty } from "../apis/imageApi";
import {
  getNetContentTitle,
  getFormTypeLabel,
  getUnitLabel,
} from "../utils/dataMapper";

interface PesticideResultsProps {
  data: ProductInfo;
  images: File[];
  onReset: () => void;
}

interface FieldDisplay {
  label: string;
  key: string;
  icon?: string;
  value?: any;
  isEmpty: boolean;
  warning?: any;
}

export function PesticideResults({
  data,
  images,
  onReset,
}: PesticideResultsProps) {
  // Use overall_confidence from metadata if available, otherwise use confidence_score
  const confidenceScore =
    data.metadata?.overall_confidence ?? data.confidence_score ?? 0;
  const confidence = confidenceScore * 100;

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

  // Prepare all fields for display
  const basicFields: FieldDisplay[] = [
    {
      label: "Tên sản phẩm",
      key: "product_name",
      icon: "📦",
      value: data.product_name,
      isEmpty: isFieldEmpty(data.product_name),
      warning: getFieldWarning(data, "product_name"),
    },
    {
      label: "Loại",
      key: "product_type",
      icon: "📋",
      value: data.product_type,
      isEmpty: isFieldEmpty(data.product_type),
      warning: getFieldWarning(data, "product_type"),
    },
    {
      label: "Nhà sản xuất",
      key: "manufacturer",
      icon: "🏭",
      value: data.manufacturer,
      isEmpty: isFieldEmpty(data.manufacturer),
      warning: getFieldWarning(data, "manufacturer"),
    },
    {
      label: "Số đăng ký",
      key: "registration_number",
      icon: "📜",
      value: data.registration_number,
      isEmpty: isFieldEmpty(data.registration_number),
      warning: getFieldWarning(data, "registration_number"),
    },
    {
      label: getNetContentTitle(data.net_unit || ""),
      key: "net_content",
      icon: "📏",
      value: data.net_content
        ? `${data.net_content}${data.net_unit ? ` ${getUnitLabel(data.net_unit)}` : ""}`
        : null,
      isEmpty: isFieldEmpty(data.net_content),
      warning: getFieldWarning(data, "net_content"),
    },
    {
      label: "Hình dạng/Dạng sản phẩm",
      key: "form_type",
      icon: "🏷️",
      value: getFormTypeLabel(data.form_type || ""),
      isEmpty: isFieldEmpty(data.form_type),
      warning: getFieldWarning(data, "form_type"),
    },
    {
      label: "Ngày sản xuất",
      key: "mfg_date",
      icon: "📅",
      value: data.mfg_date,
      isEmpty: isFieldEmpty(data.mfg_date),
      warning: getFieldWarning(data, "mfg_date"),
    },
    {
      label: "Ngày hết hạn",
      key: "exp_date",
      icon: "⏰",
      value: data.exp_date,
      isEmpty: isFieldEmpty(data.exp_date),
      warning: getFieldWarning(data, "exp_date"),
    },
    {
      label: "Thời gian cách ly trước thu hoạch",
      key: "pre_harvest_interval_days",
      icon: "⏱️",
      value:
        data.pre_harvest_interval_days || data.pre_harvest_interval_days === 0
          ? `${data.pre_harvest_interval_days} ngày`
          : null,
      isEmpty: isFieldEmpty(data.pre_harvest_interval_days),
      warning: getFieldWarning(data, "pre_harvest_interval_days"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="border-b-2 border-purple-400 pb-6 text-center">
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

      {/* Basic Fields - Grid Layout */}
      <div className="border-b-2 border-purple-600 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b text-center">
          ℹ️ Thông tin sản phẩm
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {basicFields.map((field) => {
            const hasWarning = field.warning !== undefined;
            const isOrange = field.isEmpty || hasWarning;

            return (
              <div
                key={field.key}
                className={`rounded-lg p-3 ${isOrange ? "bg-orange-50 border border-orange-200" : "bg-blue-50 border border-blue-200"}`}
              >
                {/* Field Warning */}
                {hasWarning && (
                  <div className="mb-2 pb-2 border-b border-orange-200">
                    <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {field.warning.issue}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {field.warning.message}
                    </p>
                  </div>
                )}

                {/* Field Label */}
                <p
                  className={`text-xs font-semibold uppercase ${isOrange ? "text-orange-700" : "text-purple-600"}`}
                >
                  {field.label}
                </p>

                {/* Field Value */}
                <p
                  className={`text-sm font-medium mt-1 ${
                    field.isEmpty
                      ? isOrange
                        ? "text-orange-500 italic"
                        : "text-gray-400 italic"
                      : "text-gray-900"
                  }`}
                >
                  {field.isEmpty ? "Không có dữ liệu" : field.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uses */}
      {data.uses ? (
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-sm font-bold uppercase text-green-900 mb-3">
            🎯 Công dụng
          </h2>
          {getFieldWarning(data, "uses") && (
            <div className="mb-3 pb-3 border-b border-green-200">
              <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getFieldWarning(data, "uses")?.issue}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {getFieldWarning(data, "uses")?.message}
              </p>
            </div>
          )}
          {data.uses.split("\n").map((line, index) => (
            <p
              key={index}
              className="text-sm text-green-900 leading-relaxed text-left"
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                🎯 Công dụng
              </p>
              <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
            </div>
          </div>
        </div>
      )}

      {/* Dosage */}
      {data.dosage ? (
        <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-sm font-bold uppercase text-blue-900 mb-3">
            💊 Cách sử dụng & Liều lượng
          </h2>
          {getFieldWarning(data, "dosage") && (
            <div className="mb-3 pb-3 border-b border-blue-200">
              <p className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getFieldWarning(data, "dosage")?.issue}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {getFieldWarning(data, "dosage")?.message}
              </p>
            </div>
          )}
          {data.dosage.split("\n").map((line, index) => (
            <p
              key={index}
              className="text-sm text-blue-900 leading-relaxed text-left"
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                💊 Cách sử dụng & Liều lượng
              </p>
              <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Ingredients */}
      {data.active_ingredients && data.active_ingredients.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🧪 Thành phần hoạt chất
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-100">
                  <th className="border border-orange-300 px-4 py-2 text-left text-xs font-semibold text-orange-700">
                    Hoạt chất
                  </th>
                  <th className="border border-orange-300 px-4 py-2 text-left text-xs font-semibold text-orange-700">
                    Hàm lượng
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.active_ingredients.map((ingredient, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                  >
                    <td className="border border-orange-200 px-4 py-2 text-xs font-medium text-gray-900">
                      {ingredient.name}
                    </td>
                    <td className="border border-orange-200 px-4 py-2 text-sm font-bold text-gray-900">
                      {ingredient.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!data.active_ingredients ||
        (data.active_ingredients.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-orange-700">
                  🧪 Thành phần hoạt chất
                </p>
                <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
              </div>
            </div>
          </div>
        ))}

      {/* Target Crops */}
      {data.target_crops && data.target_crops.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🌱 Đối tượng áp dụng
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
      {!data.target_crops ||
        (data.target_crops.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-orange-700">
                  🌱 Đối tượng áp dụng
                </p>
                <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
              </div>
            </div>
          </div>
        ))}

      {/* Target Pests */}
      {data.target_pests && data.target_pests.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🦠 Sâu/Bệnh mục tiêu
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
      {!data.target_pests ||
        (data.target_pests.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-orange-700">
                  🦠 Sâu/Bệnh mục tiêu
                </p>
                <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
              </div>
            </div>
          </div>
        ))}

      {/* Quality Warnings Summary */}
      {data.metadata?.review_warnings &&
        data.metadata.review_warnings.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Tóm tắt cảnh báo chất lượng
            </h2>
            <div className="space-y-2">
              {data.metadata.review_warnings.map((warning, index) => (
                <div
                  key={index}
                  className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-700">
                        {warning.field_path}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {warning.issue}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {warning.message}
                      </p>
                    </div>
                    {warning.confidence !== undefined && (
                      <span className="ml-3 text-xs font-bold text-amber-700">
                        {(warning.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Confidence Score */}
      {(data.metadata?.overall_confidence !== undefined ||
        data.confidence_score !== undefined) && (
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
