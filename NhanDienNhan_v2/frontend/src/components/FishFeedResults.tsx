import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductInfo } from "../apis/imageApi";
import { getFieldWarning, isFieldEmpty } from "../apis/imageApi";
import {
  getNetContentTitle,
  getFormTypeLabel,
  getUnitLabel,
} from "../utils/dataMapper";

interface FishFeedResultsProps {
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

export function FishFeedResults({
  data,
  images,
  onReset,
}: FishFeedResultsProps) {
  // Use overall_confidence from metadata if available, otherwise use confidence_score
  const confidenceScore =
    data.metadata?.overall_confidence ?? data.confidence_score ?? 0;
  const confidence = confidenceScore * 100;

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
      label: "Mã biến thể",
      key: "variant_code",
      icon: "🏷️",
      value: data.variant_code,
      isEmpty: isFieldEmpty(data.variant_code),
      warning: getFieldWarning(data, "variant_code"),
    },
    {
      label: "Loài cá",
      key: "species",
      icon: "🐟",
      value: data.species,
      isEmpty: isFieldEmpty(data.species),
      warning: getFieldWarning(data, "species"),
    },
    {
      label: "Nhà sản xuất",
      key: "registrant",
      icon: "🏭",
      value: data.registrant,
      isEmpty: isFieldEmpty(data.registrant),
      warning: getFieldWarning(data, "registrant"),
    },
    {
      label: "Loại sản phẩm",
      key: "product_type",
      icon: "📋",
      value: data.product_type,
      isEmpty: isFieldEmpty(data.product_type),
      warning: getFieldWarning(data, "product_type"),
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
  ];

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
      <div className="border-b-2 border-blue-400 pb-6 text-center">
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
      <div className="border-b-2 border-blue-600 pb-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
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
                  className={`text-xs font-semibold uppercase ${isOrange ? "text-orange-700" : "text-blue-600"}`}
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

      {/* Ingredients Section */}
      {data.ingredients && typeof data.ingredients === "string" && (
        <div className="bg-linear-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
            🥣 Thành phần
          </h2>
          {getFieldWarning(data, "ingredients") && (
            <div className="mb-3 pb-3 border-b border-amber-200">
              <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getFieldWarning(data, "ingredients")?.issue}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {getFieldWarning(data, "ingredients")?.message}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {data.ingredients}
          </p>
        </div>
      )}
      {!data.ingredients && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                🥣 Thành phần
              </p>
              <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Facts */}
      {data.nutrition_facts && data.nutrition_facts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            📊 Thành phần dinh dưỡng
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-green-300 px-4 py-2 text-left text-xs font-semibold text-green-700">
                    Chỉ tiêu
                  </th>
                  <th className="border border-green-300 px-4 py-2 text-left text-xs font-semibold text-green-700">
                    Giá trị
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.nutrition_facts.map((fact, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-green-50"}
                  >
                    <td className="border border-green-200 px-4 py-2 text-xs font-medium text-gray-900">
                      {fact.name}
                    </td>
                    <td className="border border-green-200 px-4 py-2 text-sm font-bold text-gray-900">
                      {fact.value + " " + (fact.unit || "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!data.nutrition_facts ||
        (data.nutrition_facts.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-orange-700">
                  📊 Thành phần dinh dưỡng
                </p>
                <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
              </div>
            </div>
          </div>
        ))}

      {/* Feeding Guide */}
      {data.feeding_guide && (
        <div
          className={`rounded-lg p-4 ${
            getFieldWarning(data, "feeding_guide")
              ? "bg-orange-50 border border-orange-200"
              : "bg-indigo-50 border-l-4 border-indigo-400"
          }`}
        >
          <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
            🍽️ Hướng dẫn cho ăn
          </h2>

          {/* Feeding Guide Warning */}
          {getFieldWarning(data, "feeding_guide") && (
            <div className="mb-3 pb-3 border-b border-orange-200">
              <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getFieldWarning(data, "feeding_guide")?.issue}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {getFieldWarning(data, "feeding_guide")?.message}
              </p>
            </div>
          )}

          {data.feeding_guide.code && (
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Mã: {data.feeding_guide.code}
            </p>
          )}

          {data.feeding_guide.guide && data.feeding_guide.guide.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="border border-indigo-300 px-4 py-2 text-left text-xs font-semibold text-indigo-700">
                      Chỉ tiêu
                    </th>
                    <th className="border border-indigo-300 px-4 py-2 text-left text-xs font-semibold text-indigo-700">
                      Giá trị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.feeding_guide.guide.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : getFieldWarning(data, "feeding_guide")
                            ? "bg-orange-50"
                            : "bg-indigo-50"
                      }
                    >
                      <td className="border border-indigo-200 px-4 py-2 text-xs font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="border border-indigo-200 px-4 py-2 text-sm font-bold text-gray-900">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(!data.feeding_guide.guide ||
            data.feeding_guide.guide.length === 0) && (
            <p className="text-sm text-gray-700 italic">
              Không trích xuất được dữ liệu
            </p>
          )}
        </div>
      )}
      {!data.feeding_guide && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                🍽️ Hướng dẫn cho ăn
              </p>
              <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
            </div>
          </div>
        </div>
      )}

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
        className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
      >
        ↺ Tải lên ảnh mới
      </button>
    </div>
  );
}
