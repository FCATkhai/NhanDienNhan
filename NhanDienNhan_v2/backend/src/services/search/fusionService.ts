// ============================================================
// Fusion LLM service — merges image extraction + web search results
// ============================================================

import OpenAI from "openai";
import dotenv from "dotenv";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  PesticideResponseSchema,
  FertilizerResponseSchema,
} from "@backend/validation/productInfo.js";
import type { PesticideSearchResult, FertilizerSearchResult } from "./types.js";

dotenv.config();

// Re-use the same OpenAI client configuration as imageProcessor
const client = new OpenAI({
  apiKey: process.env.wokushop_api_key,
  baseURL: "https://llm.wokushop.com/v1/",
});

// Use gemini-3.1-flash-lite-preview for the fusion step (good at structured reasoning)
const FUSION_MODEL = "gemini-3.1-flash-lite-preview";

const FUSION_SYSTEM_PROMPT = `You are an expert at merging product information from two sources:
1. "imageExtraction": information extracted by OCR/Vision AI from a product label image
2. "webSearchResult": official information retrieved from a government agricultural database

Your task is to produce a single unified product data object that:
- VERIFY the searched product is the same product as the image-extracted product. If the product names or key attributes differ significantly and you cannot confirm they are the same product, return only the image extraction data unchanged.
- RESOLVE conflicts by preferring official database information (webSearchResult) over image extraction.
- FILL MISSING fields in imageExtraction using data from webSearchResult when available.
- PRESERVE the "metadata" (overall_confidence, review_warnings) exactly from the imageExtraction — do NOT modify it.
- PRESERVE the "success", "error_code", and "message" fields from imageExtraction.
- OUTPUT must conform exactly to the schema provided — do not add extra fields.

Return only valid JSON matching the schema. No explanations.`;

/**
 * Call the fusion LLM to merge image extraction and web search results.
 * Returns the enriched response object, or the original if fusion fails.
 */
export async function fuseResults(
  imageExtraction: object,
  webSearchResult: PesticideSearchResult | FertilizerSearchResult,
  category: "pesticide" | "fertilizer",
): Promise<object> {
  const targetSchema =
    category === "fertilizer"
      ? FertilizerResponseSchema
      : PesticideResponseSchema;

  const userMessage = JSON.stringify(
    {
      imageExtraction,
      webSearchResult,
    },
    null,
    2,
  );

  const response = await client.chat.completions.create({
    model: FUSION_MODEL,
    messages: [
      { role: "system", content: FUSION_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: zodResponseFormat(targetSchema, "schema_name"),
  });

  const outputText = response.choices[0]?.message?.content;
  if (!outputText) {
    throw new Error("[fusionService] No content received from fusion model.");
  }

  return JSON.parse(outputText) as object;
}
