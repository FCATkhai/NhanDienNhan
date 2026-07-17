import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.wokushop_api_key,
//   baseURL: "https://llm.wokushop.com/v1/",
// });

export const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
