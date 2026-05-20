/**
 * Image upload utilities for communicating with the backend
 */

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export type ProductCategory = "pesticide" | "fish_feed";

export interface ProductInfo {
  success: boolean;
  category?: ProductCategory;
  message?: string;
  error_code?: string;
  // Pesticide fields
  product_name?: string;
  product_type?: string;
  manufacturer?: string;
  registration_number?: string;
  active_ingredients?: Array<{ name: string; content: string }>;
  dosage?: string;
  target_crops?: string[];
  target_pests?: string[];
  pre_harvest_interval_days?: number;
  // Fish feed fields
  variant_code?: string;
  species?: string;
  net_content?: string;
  ingredients?: string;
  nutrition_facts?: Array<{ name: string; value: string }>;
  feeding_guide?: {
    code?: string;
    guide?: Array<{ name: string; value: string }>;
  };
  confidence_score?: number;
}

export interface ImageAnalysisResponse {
  success: boolean;
  data?: {
    response: string;
    fileName: string;
    mimeType: string;
  };
  message?: string;
  error?: string;
}

export interface MultipleImagesResponse {
  success: boolean;
  data?: {
    response: string;
    totalImages: number;
  };
  message?: string;
  error?: string;
}

/**
 * Parse product info from API response
 */
export const parseProductInfo = (
  response: ImageAnalysisResponse | MultipleImagesResponse,
): ProductInfo => {
  try {
    if (!response.data?.response) {
      return {
        success: false,
        message:
          response.message || "Không thể trích xuất thông tin từ phản hồi",
        error_code: "INVALID_RESPONSE",
      };
    }

    const productInfo = JSON.parse(response.data.response) as ProductInfo;
    return productInfo;
  } catch (error) {
    return {
      success: false,
      message: "Lỗi xử lý dữ liệu phản hồi",
      error_code: "PARSE_ERROR",
    };
  }
};

/**
 * Upload a single image for analysis
 * @param file - Image file to upload
 * @param prompt - Optional custom prompt for the analysis
 * @returns Analysis result from OpenAI
 */
export const uploadImageForAnalysis = async (
  file: File,
  prompt?: string,
): Promise<ImageAnalysisResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  if (prompt) {
    formData.append("prompt", prompt);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/image/analyze`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to analyze image",
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error while uploading image",
    };
  }
};

/**
 * Upload multiple images for analysis
 * @param files - Array of image files to upload
 * @param category - Product category: "pesticide" (default) or "fish_feed"
 * @returns Analysis results from OpenAI
 */
export const uploadMultipleImagesForAnalysis = async (
  files: File[],
  category: ProductCategory = "pesticide",
): Promise<MultipleImagesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const url = new URL(`${API_BASE_URL}/api/image/analyze`);
    url.searchParams.append("category", category);

    const response = await fetch(url.toString(), {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        return {
          success: false,
          message: error.detail || error.error || "Failed to analyze images",
        };
      } catch {
        return {
          success: false,
          message: `Server error: ${response.status}`,
        };
      }
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Network error while uploading images",
    };
  }
};
