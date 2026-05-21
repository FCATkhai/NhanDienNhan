import { z } from "zod";

// ==========================================
// 1. METADATA & CẢNH BÁO (REVIEW WARNINGS)
// ==========================================

export const ReviewWarningSchema = z.object({
  field_path: z
    .string()
    .describe(
      "Đường dẫn đến trường bị nghi ngờ (VD: 'ingredients', 'feeding_guide.0.value')",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Độ tin cậy của trường này (0-1)"),
  issue: z
    .string()
    .describe(
      "Phân loại lỗi (VD: 'TEXT_BLURRY', 'TABLE_UNCLEAR', 'AMBIGUOUS_VALUE')",
    ),
  message: z
    .string()
    .describe("Mô tả chi tiết vấn đề bằng tiếng Việt cho người duyệt xem"),
});

export const MetadataSchema = z.object({
  overall_confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Độ tin cậy tổng thể của quá trình OCR/Trích xuất"),
  review_warnings: z
    .array(ReviewWarningSchema)
    .describe(
      "Danh sách các trường có độ tin cậy thấp cần con người xem lại. Nếu tất cả đều rõ ràng, trả về mảng rỗng []",
    ),
});

const BaseProductSchema = z.object({
  // ===== STATUS =====
  success: z.boolean().describe("Có trích xuất thành công hay không"),

  error_code: z
    .enum([
      "NONE",
      "BLURRY_IMAGE",
      "WRONG_PRODUCT_CATEGORY",
      "TEXT_NOT_READABLE",
      "MISSING_LABEL",
      "UNKNOWN",
    ])
    .describe("Mã lỗi nếu thất bại"),

  message: z.string().describe("Thông báo cho UI"),

  category: z
    .enum(["fish_feed", "pesticide", "fertilizer", "unknown"])
    .describe("Danh mục sản phẩm"),

  confidence_score: z
    .number()
    .min(0)
    .max(1)
    .describe("Độ tin cậy OCR/trích xuất"),

  form_type: z
    .enum(["bot", "nuoc", "vien", "khac"])
    .nullable()
    .describe("Dạng vật lý/thương phẩm của sản phẩm (bột, nước, viên...)"),

  manufacturer: z.string().nullable().describe("Nhà sản xuất"),
  product_name: z.string().nullable().describe("Tên sản phẩm"),
  net_content: z.string().nullable().describe("Giá trị định lượng (số)"),
  net_unit: z
    .string()
    .nullable()
    .describe("Đơn vị của giá trị định lượng (g, kg, l...)"),

  mfg_date: z.string().nullable().describe("Ngày sản xuất"),
  exp_date: z.string().nullable().describe("Hạn sử dụng"),
});

// ---- SCHEMA CHI TIẾT THEO DANH MỤC SẢN PHẨM ---

// Pesticide schema
// ActiveIngredient
export const ActiveIngredientSchema = z.object({
  name: z.string().describe("Tên hoạt chất"),
  content: z.string().describe("Hàm lượng hoạt chất"),
});

export const PesticideSchema = BaseProductSchema.extend({
  // ===== PRODUCT INFO =====
  category: z.literal("pesticide").describe("Danh mục sản phẩm"),

  product_type: z.string().nullable().describe("Loại sản phẩm"),

  registration_number: z.string().nullable().describe("Số đăng ký"),

  active_ingredients: z
    .array(ActiveIngredientSchema)
    .nullable()
    .describe("Danh sách hoạt chất"),

  dosage: z.string().nullable().describe("Liều lượng sử dụng"),

  target_crops: z
    .array(z.string())
    .nullable()
    .describe("Danh sách cây trồng áp dụng"),

  target_pests: z
    .array(z.string())
    .nullable()
    .describe("Danh sách bệnh/dịch hại"),

  pre_harvest_interval_days: z
    .number()
    .int()
    .nullable()
    .describe("Thời gian cách ly trước thu hoạch"),

  expiry_date: z.string().nullable().describe("Ngày hết hạn"),
});

// Fish feed schema

const FeedGuideVariantSchema = z.object({
  code: z
    .string()
    .nullable()
    .describe(
      "Mã biến thể thức ăn, phải giống với variant_code của sản phẩm nếu có",
    ),
  guide: z
    .array(
      z.object({
        name: z.string().describe("Tên mục hướng dẫn"),
        value: z.string().describe("Nội dung hướng dẫn cho mục này"),
      }),
    )
    .describe(
      "hướng dẫn bóc tách riêng cho mã code này. Tuyệt đối không gom data của mã khác vào.",
    ),
});

export const FishFeedSchema = BaseProductSchema.extend({
  category: z.literal("fish_feed").describe("Danh mục sản phẩm"),
  // ===== PRODUCT INFO =====
  product_type: z.string().nullable().describe("Loại sản phẩm"),
  species: z.string().nullable().describe("Loài thủy sản áp dụng"),
  ingredients: z.string().nullable().describe("Thành phần nguyên liệu"),
  variant_code: z.string().nullable().describe("Mã biến thể của sản phẩm"),
  nutrition_facts: z
    .array(
      z.object({
        name: z.string().describe(`
            Tên thành phần dinh dưỡng.
            - Ưu tiên tiếng Việt nếu có song ngữ
            - Không dịch tự động
            `),
        value: z
          .string()
          .describe(
            `Giá trị định lượng (số), nếu có đơn vị riêng thì chỉ lấy số`,
          ),
        unit: z.string().nullable()
          .describe(`Đơn vị của giá trị dinh dưỡng (g, mg, %...)
            `),
      }),
    )
    .nullable()
    .describe(
      "Thành phần dinh dưỡng (composition) tương ứng với biến thể thức ăn",
    ),
  //   feeding_guide: z
  //     .array(FeedVariantSchema)
  //     .nullable()
  //     .describe("Hướng dẫn cho từng biến thể thức ăn"),
  feeding_guide: z
    .union([
      FeedGuideVariantSchema,
      z
        .string()
        .describe(
          "Hướng dẫn chung cho sản phẩm nếu không có biến thể nào được chọn",
        ),
    ])
    .nullable()
    .describe("Hướng dẫn cho ăn tương ứng với biến thể (variant_code)"),
});
