import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductInfo, ReviewWarning } from "../apis/imageApi";
import { getFieldWarning, isFieldEmpty } from "../apis/imageApi";

// ─── Types ──────────────────────────────────────────────────

export interface FieldDisplay {
  label: string;
  key: string;
  icon?: string;
  value?: any;
  isEmpty: boolean;
  warning?: any;
}

type AccentColor = "purple" | "blue" | "emerald";

const ACCENT_CLASSES: Record<
  AccentColor,
  {
    border: string;
    gradient: string;
    fieldBg: string;
    fieldBorder: string;
    fieldLabel: string;
  }
> = {
  purple: {
    border: "border-purple-400",
    gradient: "from-purple-600 to-purple-700",
    fieldBg: "bg-blue-50",
    fieldBorder: "border-blue-200",
    fieldLabel: "text-purple-600",
  },
  blue: {
    border: "border-blue-400",
    gradient: "from-blue-600 to-blue-700",
    fieldBg: "bg-blue-50",
    fieldBorder: "border-blue-200",
    fieldLabel: "text-blue-600",
  },
  emerald: {
    border: "border-emerald-400",
    gradient: "from-emerald-600 to-emerald-700",
    fieldBg: "bg-emerald-50",
    fieldBorder: "border-emerald-200",
    fieldLabel: "text-emerald-600",
  },
};

// ─── ImageGallery ───────────────────────────────────────────

interface ImageGalleryProps {
  images: File[];
  accentColor: AccentColor;
}

export function ImageGallery({ images, accentColor }: ImageGalleryProps) {
  const colors = ACCENT_CLASSES[accentColor];
  return (
    <div className={`border-b-2 ${colors.border} pb-6 text-center`}>
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
  );
}

// ─── ErrorState ─────────────────────────────────────────────

interface ErrorStateProps {
  data: ProductInfo;
  images: File[];
  accentColor: AccentColor;
  onReset: () => void;
}

export function ErrorState({
  data,
  images,
  accentColor,
  onReset,
}: ErrorStateProps) {
  const colors = ACCENT_CLASSES[accentColor];
  return (
    <div className="space-y-6">
      <ImageGallery images={images} accentColor={accentColor} />

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
        className={`w-full py-3 bg-linear-to-r ${colors.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-shadow`}
      >
        ↺ Tải lên ảnh mới
      </button>
    </div>
  );
}

// ─── FieldsGrid ─────────────────────────────────────────────

interface FieldsGridProps {
  fields: FieldDisplay[];
  accentColor: AccentColor;
}

export function FieldsGrid({ fields, accentColor }: FieldsGridProps) {
  const colors = ACCENT_CLASSES[accentColor];
  return (
    <div className={`border-b-2 border-${accentColor}-600 pb-6`}>
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b text-center">
        ℹ️ Thông tin sản phẩm
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const hasWarning = field.warning !== undefined;
          const isOrange = field.isEmpty || hasWarning;

          return (
            <div
              key={field.key}
              className={`rounded-lg p-3 ${isOrange ? "bg-orange-50 border border-orange-200" : `${colors.fieldBg} border ${colors.fieldBorder}`}`}
            >
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

              <p
                className={`text-xs font-semibold uppercase ${isOrange ? "text-orange-700" : colors.fieldLabel}`}
              >
                {field.label}
              </p>

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
  );
}

// ─── DataSection ────────────────────────────────────────────

interface DataSectionProps {
  title: string;
  icon: string;
  fieldKey: string;
  data: ProductInfo;
  hasData: boolean;
  children: React.ReactNode;
}

/**
 * Renders a data section. If hasData is false, shows an orange "no data" box instead.
 */
export function DataSection({
  title,
  icon,
  fieldKey,
  data,
  hasData,
  children,
}: DataSectionProps) {
  const warning = getFieldWarning(data, fieldKey);

  if (!hasData) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase text-orange-700">
              {icon} {title}
            </p>
            <p className="text-sm text-orange-700 mt-1">Không có dữ liệu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b">
        {icon} {title}
      </h2>
      {warning && (
        <div className="mb-3 pb-3 border-b border-orange-200">
          <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {warning.issue}
          </p>
          <p className="text-xs text-orange-600 mt-1">{warning.message}</p>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── QualityWarnings ────────────────────────────────────────

interface QualityWarningsProps {
  warnings: ReviewWarning[];
}

export function QualityWarnings({ warnings }: QualityWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        Tóm tắt cảnh báo chất lượng
      </h2>
      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700">
                  {warning.field_path}
                </p>
                <p className="text-xs text-amber-600 mt-1">{warning.issue}</p>
                <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
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
  );
}

// ─── ResultFooter ───────────────────────────────────────────

interface ResultFooterProps {
  confidence?: number; // 0-100 scale
  accentColor: AccentColor;
  onReset: () => void;
}

export function ResultFooter({
  confidence,
  accentColor,
  onReset,
}: ResultFooterProps) {
  const colors = ACCENT_CLASSES[accentColor];
  return (
    <>
      {confidence !== undefined && (
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
        className={`w-full py-3 bg-linear-to-r ${colors.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-shadow`}
      >
        ↺ Tải lên ảnh mới
      </button>
    </>
  );
}
