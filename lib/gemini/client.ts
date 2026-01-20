import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiClient = genAI;

export const DEFAULT_MODEL = "gemini-1.5-flash";
