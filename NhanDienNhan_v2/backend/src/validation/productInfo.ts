import { z } from "zod";

// ActiveIngredient
export const ActiveIngredientSchema = z.object({
  name: z.string().describe("Tên hoạt chất"),
  content: z.string().describe("Hàm lượng hoạt chất"),
});

// ProductInfo
export const ProductInfoSchema = z.object({
  product_name: z.string().describe("Tên sản phẩm"),

  product_type: z.string().describe("Loại sản phẩm"),

  manufacturer: z.string().describe("Nhà sản xuất"),

  registration_number: z.string().optional().nullable().describe("Số đăng ký"),

  active_ingredients: z
    .array(ActiveIngredientSchema)
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
    .describe("Thời gian cách ly trước thu hoạch (ngày)"),

  expiry_date: z.iso.datetime().optional().nullable().describe("Ngày hết hạn"),

  confidence_score: z
    .number()
    .min(0)
    .max(1)
    .describe("Độ tin cậy OCR/trích xuất"),
});
