import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod";
import { ProductInfoSchema } from "@backend/validation/productInfo";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.wokushop_api_key,
  baseURL: "https://llm.wokushop.com/v1",
});

export const processImageWithOpenAI = async (
  imageBuffer: Buffer,
  imageType: string,
  prompt: string = "what's in this image?",
) => {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Map MIME types to data URL prefixes
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "data:image/jpeg;base64,",
      "image/png": "data:image/png;base64,",
      "image/gif": "data:image/gif;base64,",
      "image/webp": "data:image/webp;base64,",
    };

    const dataUrlPrefix = mimeTypeMap[imageType] || "data:image/jpeg;base64,";

    const response = await client.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `${dataUrlPrefix}${base64Image}`,
              detail: "auto",
            },
          ],
        },
      ],
      text: { format: zodTextFormat(ProductInfoSchema, "schema") },
    });

    return {
      success: true,
      response: response.output_text,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const processMultipleImagesWithOpenAI = async (
  imageBuffers: Buffer[],
  imageTypes: string[],
  prompt: string = "what's in these images?",
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
      text: { format: zodTextFormat(ProductInfoSchema, "schema") },
    });

    return {
      success: true,
      response: response.output_text,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};
