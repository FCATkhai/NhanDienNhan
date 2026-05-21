import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod";
import {
  FishFeedResponseSchema,
  PesticideResponseSchema,
} from "@backend/validation/productInfo";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.wokushop_api_key,
  baseURL: "https://llm.wokushop.com/v1",
});

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
      response: response.output_text,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};
