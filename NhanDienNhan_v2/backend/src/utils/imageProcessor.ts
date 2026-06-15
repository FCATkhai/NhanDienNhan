import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat, zodResponseFormat } from "openai/helpers/zod";
import { SchemaType } from "@backend/validation/types";
import {
  FishFeedResponseSchema,
  PesticideResponseSchema,
  FertilizerResponseSchema,
} from "@backend/validation/productInfo";
import { formatDatesInResponse } from "./dateProcessor";

dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.wokushop_api_key,
//   baseURL: "https://llm.wokushop.com/v1/",
// });

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const schemaTypeToModelMap: {
  [key in SchemaType]: string;
} = {
  fish_feed: "gemini-3-flash-preview",
  pesticide: "gemini-3.1-flash-lite",
  fertilizer: "gemini-3.1-flash-lite",
};

export const processImagesWithOpenAI = async (
  imageBuffers: Buffer[],
  imageTypes: string[],
  prompt: string = "what's in these images?",
  schemaType: SchemaType = "pesticide",
  isParsed: boolean = false,
  formatDates: boolean = false,
) => {
  try {
    // Convert buffers to base64
    const base64Images = imageBuffers.map((buffer) =>
      buffer.toString("base64"),
    );

    // Map MIME types to data URL prefixes
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "data:image/jpeg;base64,",
      "image/png": "data:image/png;base64,",
      "image/gif": "data:image/gif;base64,",
      "image/webp": "data:image/webp;base64,",
    };

    interface ImageInput {
      type: "input_image";
      image_url: string;
      detail: "auto" | "low";
    }

    const imageInputs: ImageInput[] = base64Images.map(
      (base64Image, index) => ({
        type: "input_image",
        image_url: `${mimeTypeMap[imageTypes[index] as string] || "data:image/jpeg;base64,"}${base64Image}`,
        detail: "auto",
      }),
    );

    const response = await client.responses.parse({
      model: schemaTypeToModelMap[schemaType],
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }, ...imageInputs],
        },
      ],
      text: {
        format: zodTextFormat(
          schemaType === "fish_feed"
            ? FishFeedResponseSchema
            : schemaType === "fertilizer"
              ? FertilizerResponseSchema
              : PesticideResponseSchema,
          "schema",
        ),
      },
    });

    let parsedResponse = isParsed
      ? JSON.parse(response.output_text)
      : response.output_text;

    // Format dates if requested (independent of isParsed)
    if (formatDates) {
      // Parse if not already parsed
      if (typeof parsedResponse === "string") {
        parsedResponse = JSON.parse(parsedResponse);
      }
      // Format dates
      parsedResponse = formatDatesInResponse(parsedResponse);
      // Stringify back if isParsed was false
      if (!isParsed) {
        parsedResponse = JSON.stringify(parsedResponse);
      }
    }

    return {
      success: true,
      response: parsedResponse,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const processImagesWithOpenAI_chatCompletions = async (
  imageBuffers: Buffer[],
  imageTypes: string[],
  prompt: string = "what's in these images?",
  schemaType: SchemaType = "pesticide",
  isParsed: boolean = false,
  formatDates: boolean = false,
) => {
  try {
    // Convert buffers to base64
    const base64Images = imageBuffers.map((buffer) =>
      buffer.toString("base64"),
    );

    // Map MIME types to data URL prefixes
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "data:image/jpeg;base64,",
      "image/png": "data:image/png;base64,",
      "image/gif": "data:image/gif;base64,",
      "image/webp": "data:image/webp;base64,",
    };

    // Định dạng chuẩn của OpenAI Chat Completions cho hình ảnh
    const imageInputs = base64Images.map((base64Image, index) => ({
      type: "image_url" as const,
      image_url: {
        url: `${mimeTypeMap[imageTypes[index] as string] || "data:image/jpeg;base64,"}${base64Image}`,
        detail: "auto" as const,
      },
    }));

    // Lựa chọn schema dựa trên tham số
    const targetSchema =
      schemaType === "fish_feed"
        ? FishFeedResponseSchema
        : schemaType === "fertilizer"
          ? FertilizerResponseSchema
          : PesticideResponseSchema;

    // Gọi hàm qua client.chat.completions.create
    const response = await client.chat.completions.create({
      model: schemaTypeToModelMap[schemaType],
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageInputs],
        },
      ],
      // Sử dụng zodResponseFormat để ép API trả về JSON đúng với schema
      response_format: zodResponseFormat(targetSchema, "schema_name"),
    });

    const outputText = response.choices[0]?.message?.content;

    if (!outputText) {
      throw new Error("No content received from model.");
    }

    let parsedResponse = isParsed ? JSON.parse(outputText) : outputText;

    // Format dates if requested (independent of isParsed)
    if (formatDates) {
      // Parse if not already parsed
      if (typeof parsedResponse === "string") {
        parsedResponse = JSON.parse(parsedResponse);
      }
      // Format dates
      parsedResponse = formatDatesInResponse(parsedResponse);
      // Stringify back if isParsed was false
      if (!isParsed) {
        parsedResponse = JSON.stringify(parsedResponse);
      }
    }

    return {
      success: true,
      response: parsedResponse,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const processImagesTest = async (
  imageBuffers: Buffer[],
  imageTypes: string[],
  prompt: string = "what's in these images?",
  schemaType: SchemaType | "" = "pesticide",
  isParsed: boolean = false,
  formatDates: boolean = false,
) => {
  try {
    // Convert buffers to base64
    const base64Images = imageBuffers.map((buffer) =>
      buffer.toString("base64"),
    );

    // Map MIME types to data URL prefixes
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "data:image/jpeg;base64,",
      "image/png": "data:image/png;base64,",
      "image/gif": "data:image/gif;base64,",
      "image/webp": "data:image/webp;base64,",
    };

    // Định dạng chuẩn của OpenAI Chat Completions cho hình ảnh
    const imageInputs = base64Images.map((base64Image, index) => ({
      type: "image_url" as const,
      image_url: {
        url: `${mimeTypeMap[imageTypes[index] as string] || "data:image/jpeg;base64,"}${base64Image}`,
        detail: "auto" as const,
      },
    }));

    // Lựa chọn schema dựa trên tham số
    let targetSchema = null;
    if (schemaType === "fish_feed") {
      targetSchema = FishFeedResponseSchema;
    } else if (schemaType === "pesticide") {
      targetSchema = PesticideResponseSchema;
    } else if (schemaType === "fertilizer") {
      targetSchema = FertilizerResponseSchema;
    }

    // Gọi hàm qua client.chat.completions.create
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageInputs],
        },
      ],
      // Sử dụng zodResponseFormat để ép API trả về JSON đúng với schema
      ...(targetSchema && {
        response_format: zodResponseFormat(targetSchema, "schema_name"),
      }),
    });

    const outputText = response.choices[0]?.message?.content;

    if (!outputText) {
      throw new Error("No content received from model.");
    }

    let parsedResponse = isParsed ? JSON.parse(outputText) : outputText;

    // Format dates if requested (independent of isParsed)
    if (formatDates) {
      // Parse if not already parsed
      if (typeof parsedResponse === "string") {
        parsedResponse = JSON.parse(parsedResponse);
      }
      // Format dates
      parsedResponse = formatDatesInResponse(parsedResponse);
      // Stringify back if isParsed was false
      if (!isParsed) {
        parsedResponse = JSON.stringify(parsedResponse);
      }
    }

    return {
      success: true,
      response: parsedResponse,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const testCallOpenAI = async () => {
  const response = await client.chat.completions.create({
    model: "gemini-3.1-flash-lite",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "bạn là model AI nào? Hãy giới thiệu về mình bằng tiếng Việt.",
      },
    ],
  });
  if (response.choices[0]) {
    console.log(response.choices[0].message);
  }
};
