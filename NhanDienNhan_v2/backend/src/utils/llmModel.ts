import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

export const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
