import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat, zodResponseFormat } from "openai/helpers/zod";
import {
  FishFeedResponseSchema,
  PesticideResponseSchema,
} from "@backend/validation/productInfo";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.wokushop_api_key,
  baseURL: "https://llm.wokushop.com/v1/",
});

// const client = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

export const processImagesWithOpenAI = async (
  imageBuffers: Buffer[],
  imageTypes: string[],
  prompt: string = "what's in these images?",
  schemaType: "fish_feed" | "pesticide" = "pesticide",
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
      detail: "auto";
    }

    const imageInputs: ImageInput[] = base64Images.map(
      (base64Image, index) => ({
        type: "input_image",
        image_url: `${mimeTypeMap[imageTypes[index] as string] || "data:image/jpeg;base64,"}${base64Image}`,
        detail: "auto",
      }),
    );

    const response = await client.responses.parse({
      model: "gpt-4.1-mini",
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
            : PesticideResponseSchema,
          "schema",
        ),
      },
    });

    return {
      success: true,
      //   response: JSON.parse(response.output_text),
      response: response.output_text,
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
  schemaType: "fish_feed" | "pesticide" = "pesticide",
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
        : PesticideResponseSchema;

    // Gọi hàm qua client.chat.completions.create
    const response = await client.chat.completions.create({
      model: "gemini-3.5-flash",
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

    return {
      success: true,
      response: JSON.parse(outputText),
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const testCallOpenAI = async () => {
  const response = await client.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "Explain to me how AI works",
      },
    ],
  });
  console.log(response.choices[0].message);
};
