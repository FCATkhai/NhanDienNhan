import type { ProductInfo } from "../apis/imageApi";
import { getFieldWarning, isFieldEmpty } from "../apis/imageApi";
import {
  getNetContentTitle,
  getFormTypeLabel,
  getUnitLabel,
} from "../utils/dataMapper";
import {
  ImageGallery,
  ErrorState,
  FieldsGrid,
  DataSection,
  QualityWarnings,
  ResultFooter,
  type FieldDisplay,
} from "./ResultShared";

interface SeedResultsProps {
  data: ProductInfo;
  images: File[];
  onReset: () => void;
}

const ACCENT = "emerald" as const;

export function SeedResults({ data, images, onReset }: SeedResultsProps) {
  const confidenceScore =
    data.metadata?.overall_confidence ?? data.confidence_score ?? 0;
  const confidence = confidenceScore * 100;

  if (!data.success) {
    return (
      <ErrorState
        data={data}
        images={images}
        accentColor={ACCENT}
        onReset={onReset}
      />
    );
  }

  const basicFields: FieldDisplay[] = [
    {
      label: "Tên sản phẩm / Giống",
      key: "product_name",
      icon: "🌱",
      value: data.product_name,
      isEmpty: isFieldEmpty(data.product_name),
      warning: getFieldWarning(data, "product_name"),
    },
    {
      label: "Nhà sản xuất / Đăng ký",
      key: "registrant",
      icon: "🏭",
      value: data.registrant,
      isEmpty: isFieldEmpty(data.registrant),
      warning: getFieldWarning(data, "registrant"),
    },
    {
      label: "Nơi sản xuất / Trại giống",
      key: "manufacturer",
      icon: "🏗️",
      value: data.manufacturer,
      isEmpty: isFieldEmpty(data.manufacturer),
      warning: getFieldWarning(data, "manufacturer"),
    },
    {
      label: "Xuất xứ",
      key: "origin",
      icon: "📍",
      value: data.origin,
      isEmpty: isFieldEmpty(data.origin),
      warning: getFieldWarning(data, "origin"),
    },
    {
      label: "Mã số lô giống",
      key: "lot_number",
      icon: "🏷️",
      value: data.lot_number,
      isEmpty: isFieldEmpty(data.lot_number),
      warning: getFieldWarning(data, "lot_number"),
    },
    {
      label: "Thời gian sinh trưởng",
      key: "growth_duration",
      icon: "⏱️",
      value: data.growth_duration,
      isEmpty: isFieldEmpty(data.growth_duration),
      warning: getFieldWarning(data, "growth_duration"),
    },
    {
      label: "Dạng sản phẩm",
      key: "form_type",
      icon: "🌾",
      value: getFormTypeLabel(data.form_type || ""),
      isEmpty: isFieldEmpty(data.form_type),
      warning: getFieldWarning(data, "form_type"),
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
      label: "Ngày sản xuất",
      key: "mfg_date",
      icon: "📅",
      value: data.mfg_date,
      isEmpty: isFieldEmpty(data.mfg_date),
      warning: getFieldWarning(data, "mfg_date"),
    },
    {
      label: "Hạn sử dụng",
      key: "exp_date",
      icon: "⏰",
      value: data.exp_date,
      isEmpty: isFieldEmpty(data.exp_date),
      warning: getFieldWarning(data, "exp_date"),
    },
  ];

  const hasCroppingSeasons =
    data.cropping_season && data.cropping_season.length > 0;

  return (
    <div className="space-y-6">
      <ImageGallery images={images} accentColor={ACCENT} />

      <FieldsGrid fields={basicFields} accentColor={ACCENT} />

      {/* Cropping Seasons */}
      <DataSection
        title="Vụ mùa trồng"
        icon="🗓️"
        fieldKey="cropping_season"
        data={data}
        hasData={!!hasCroppingSeasons}
      >
        <div className="flex flex-wrap gap-2">
          {data.cropping_season?.map((season, idx) => (
            <span
              key={idx}
              className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-200"
            >
              {season}
            </span>
          ))}
        </div>
      </DataSection>

      {/* Quality Criteria */}
      <DataSection
        title="Chỉ tiêu chất lượng"
        icon="📋"
        fieldKey="quality_criteria"
        data={data}
        hasData={!isFieldEmpty(data.quality_criteria)}
      >
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
              {data.quality_criteria?.map((criterion, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-green-50"}
                >
                  <td className="border border-green-200 px-4 py-2 text-sm font-medium text-gray-900">
                    {criterion.name}
                  </td>
                  <td className="border border-green-200 px-4 py-2 text-sm font-bold text-gray-900">
                    {criterion.value +
                      (criterion.unit ? ` ${criterion.unit}` : "") || "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataSection>

      {data.metadata?.review_warnings && (
        <QualityWarnings warnings={data.metadata.review_warnings} />
      )}

      <ResultFooter
        confidence={
          data.metadata?.overall_confidence !== undefined ||
          data.confidence_score !== undefined
            ? confidence
            : undefined
        }
        accentColor={ACCENT}
        onReset={onReset}
      />
    </div>
  );
}
