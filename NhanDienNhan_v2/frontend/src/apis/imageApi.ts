/**
 * Image upload utilities for communicating with the backend
 */

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export type ProductCategory = "pesticide" | "fertilizer" | "fish_feed";
export type SearchMode = "none" | "always" | "interactive";

export interface ReviewWarning {
  confidence?: number;
  field_path: string;
  issue: string;
  message: string;
}

export interface ResponseMetadata {
  overall_confidence?: number;
  review_warnings?: ReviewWarning[];
}

export interface ProductInfo {
  success: boolean;
  category?: ProductCategory;
  message?: string;
  error_code?: string;
  metadata?: ResponseMetadata;
  mfg_date?: string;
  exp_date?: string;
  form_type?: string;
  net_unit?: string;
  ingredients?: Array<{ name: string; content: string }> | string;
  // Pesticide fields
  product_name?: string;
  product_type?: string;
  registrant?: string;
  registration_number?: string;
  uses?: string;
  dosage?: Array<{ target: string; instruction: string }> | string;
  target_crops?: string[];
  target_pests?: string[];
  pre_harvest_interval_days?: number;
  // Fish feed fields
  variant_code?: string;
  species?: string;
  net_content?: string;
  nutrition_facts?: Array<{ name: string; value: string; unit?: string }>;
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

export interface SearchMetadata {
  search_status: "enriched" | "not_found" | "skipped" | "failed";
  source_url?: string;
  search_query?: string;
}

export interface MultipleImagesResponse {
  success: boolean;
  data?: {
    response: string;
    raw?: string; // Original extraction before search enrichment
    totalImages: number;
    search_metadata?: SearchMetadata;
    // LLM's search decision (only present in interactiveSearch mode)
    search_decision?: { needs_web_search: boolean; search_reason: string | null };
  };
  message?: string;
  error?: string;
}

/**
 * Parse product info from API response
 * The response.data.response is a JSON string containing the actual product info
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

    // Handle both string and object responses
    let parsedResponse: any;
    if (typeof response.data.response === "string") {
      parsedResponse = JSON.parse(response.data.response);
    } else {
      parsedResponse = response.data.response;
    }

    // The response contains a 'data' field with product info, and metadata
    const productData = parsedResponse.data || parsedResponse;

    // Combine data and metadata into ProductInfo
    const productInfo: ProductInfo = {
      success: parsedResponse.success,
      error_code: parsedResponse.error_code,
      message: parsedResponse.message,
      metadata: parsedResponse.metadata,
      ...productData,
    };

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
 * Get warning for a specific field
 */
export const getFieldWarning = (
  productInfo: ProductInfo,
  fieldPath: string,
): ReviewWarning | undefined => {
  return productInfo.metadata?.review_warnings?.find(
    (w) => w.field_path === fieldPath,
  );
};

/**
 * Check if a field is empty or has a warning
 */
export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
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
 * @param category - Product category: "pesticide" | "fertilizer" | "fish_feed"
 * @param searchMode - Search enrichment mode: "none" (default) | "always" | "interactive"
 * @returns Analysis results from the backend
 */
export const uploadMultipleImagesForAnalysis = async (
  files: File[],
  category: ProductCategory = "pesticide",
  searchMode: SearchMode = "none",
): Promise<MultipleImagesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const url = new URL(`${API_BASE_URL}/api/image/analyze`);
    url.searchParams.append("category", category);
    url.searchParams.append("parsed", "true");
    url.searchParams.append("formatDates", "true");
    if (searchMode === "always")      url.searchParams.append("alwaysSearch",      "true");
    if (searchMode === "interactive") url.searchParams.append("interactiveSearch", "true");

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
