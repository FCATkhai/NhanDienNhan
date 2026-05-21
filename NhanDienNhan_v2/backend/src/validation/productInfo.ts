import { z } from "zod";

// ==========================================
// 1. METADATA & CẢNH BÁO (REVIEW WARNINGS)
// ==========================================

export const ReviewWarningSchema = z.object({
  field: z.string().describe("Tên trường bị nghi ngờ"),
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

// ==========================================
// 2. BASE SCHEMA CHO API RESPONSE & CORE DATA
// ==========================================

// Khung ngoài cùng của JSON trả về
export const BaseResponseSchema = z.object({
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
  metadata: MetadataSchema.nullable().describe(
    "Thông tin cảnh báo độ tin cậy (để null nếu ảnh quá mờ không trích xuất được gì)",
  ),
});

// Dữ liệu chung của tất cả sản phẩm
const BaseProductDataSchema = z.object({
  category: z
    .enum(["fish_feed", "pesticide", "fertilizer", "unknown"])
    .describe("Danh mục sản phẩm"),
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

// ==========================================
// 3. SCHEMA CHI TIẾT THEO DANH MỤC (DATA & RESPONSE)
// ==========================================

// --- THUỐC BẢO VỆ THỰC VẬT (PESTICIDE) ---

export const ActiveIngredientSchema = z.object({
  name: z.string().describe("Tên hoạt chất"),
  content: z.string().describe("Hàm lượng hoạt chất"),
});

export const PesticideDataSchema = BaseProductDataSchema.extend({
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
});

export const PesticideResponseSchema = BaseResponseSchema.extend({
  data: PesticideDataSchema.nullable().describe("Dữ liệu sản phẩm thuốc BVTV"),
});

// --- THỨC ĂN THỦY SẢN (FISH FEED) ---

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
      "Hướng dẫn bóc tách riêng cho mã code này. Tuyệt đối không gom data của mã khác vào.",
    ),
});

export const FishFeedDataSchema = BaseProductDataSchema.extend({
  category: z.literal("fish_feed").describe("Danh mục sản phẩm"),
  product_type: z.string().nullable().describe("Loại sản phẩm"),
  species: z.string().nullable().describe("Loài thủy sản áp dụng"),
  ingredients: z.string().nullable().describe("Thành phần nguyên liệu"),
  variant_code: z.string().nullable().describe("Mã biến thể của sản phẩm"),
  nutrition_facts: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            `Tên thành phần dinh dưỡng. Ưu tiên tiếng Việt, không dịch tự động`,
          ),
        value: z
          .string()
          .describe(
            `Giá trị định lượng (số), nếu có đơn vị riêng thì chỉ lấy số`,
          ),
        unit: z
          .string()
          .nullable()
          .describe(`Đơn vị của giá trị dinh dưỡng (g, mg, %...)`),
      }),
    )
    .nullable()
    .describe(
      "Thành phần dinh dưỡng (composition) tương ứng với biến thể thức ăn",
    ),
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

export const FishFeedResponseSchema = BaseResponseSchema.extend({
  data: FishFeedDataSchema.nullable().describe(
    "Dữ liệu sản phẩm thức ăn thủy sản",
  ),
});
