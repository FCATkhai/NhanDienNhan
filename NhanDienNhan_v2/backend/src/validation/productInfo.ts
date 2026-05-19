import { z } from "zod";

// ActiveIngredient
export const ActiveIngredientSchema = z.object({
  name: z.string().describe("Tên hoạt chất"),
  content: z.string().describe("Hàm lượng hoạt chất"),
});

// ProductInfo
export const ProductInfoSchema = z.object({
  // ===== STATUS =====
  success: z.boolean().describe("Có trích xuất thành công hay không"),

  error_code: z
    .enum([
      "NONE",
      "BLURRY_IMAGE",
      "NOT_A_PRODUCT",
      "TEXT_NOT_READABLE",
      "MISSING_LABEL",
      "UNKNOWN",
    ])
    .describe("Mã lỗi nếu thất bại"),

  message: z.string().describe("Thông báo cho UI"),

  // ===== PRODUCT INFO =====
  product_name: z.string().optional().nullable().describe("Tên sản phẩm"),

  product_type: z.string().optional().nullable().describe("Loại sản phẩm"),

  manufacturer: z.string().optional().nullable().describe("Nhà sản xuất"),

  registration_number: z.string().optional().nullable().describe("Số đăng ký"),

  active_ingredients: z
    .array(ActiveIngredientSchema)
    .optional()
    .nullable()
    .describe("Danh sách hoạt chất"),

  dosage: z.string().optional().nullable().describe("Liều lượng sử dụng"),

  target_crops: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("Danh sách cây trồng áp dụng"),

  target_pests: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("Danh sách bệnh/dịch hại"),

  pre_harvest_interval_days: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe("Thời gian cách ly trước thu hoạch"),

  expiry_date: z.string().optional().nullable().describe("Ngày hết hạn"),

  confidence_score: z
    .number()
    .min(0)
    .max(1)
    .describe("Độ tin cậy OCR/trích xuất"),
});
