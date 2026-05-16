/**
 * Image upload utilities for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface ImageAnalysisResponse {
  success: boolean;
  data?: {
    response: string;
    fileName: string;
    mimeType: string;
  };
  error?: string;
}

export interface MultipleImagesResponse {
  success: boolean;
  data?: {
    results: Array<{
      index: number;
      response: string;
      fileName: string;
    }>;
    totalImages: number;
  };
  error?: string;
}

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
 * @param prompt - Optional custom prompt for the analysis
 * @returns Analysis results from OpenAI
 */
export const uploadMultipleImagesForAnalysis = async (
  files: File[],
  prompt?: string,
): Promise<MultipleImagesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  if (prompt) {
    formData.append("prompt", prompt);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/image/analyze-multiple`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to analyze images",
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error while uploading images",
    };
  }
};
