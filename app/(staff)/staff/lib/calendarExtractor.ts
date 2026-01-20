import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Define the schema using Zod
export const ExtractedEventSchema = z.object({
  title: z.string().describe("The name of the activity or event"),
  date_iso: z.string().describe("The full ISO date YYYY-MM-DD based on the calendar grid and the identified Month/Year"),
  start_time: z.string().nullable().describe("Start time in 'HH:MM' 24h format. Convert 12h (e.g. 3pm) to 24h (15:00)"),
  end_time: z.string().nullable().describe("End time in 'HH:MM' 24h format. Convert 12h (e.g. 4pm) to 24h (16:00)"),
  location: z.string().nullable().describe("The full address or meeting venue mapped from the legend icons/colors or explicitly stated"),
  is_accessible: z.boolean().default(true).describe("Set to true if wheelchair accessible icon is present, else true by default for this organization"),
  description: z.string().nullable().describe("Any additional notes, 'Things to bring', or context visible for this specific event"),
});

export const CalendarExtractionSchema = z.object({
  meta: z.object({
    month: z.string().describe("The month identified from the calendar header (e.g., 'December')"),
    year: z.number().describe("The year identified from the calendar header (e.g., 2025)"),
    calendar_type: z.enum(["monthly_grid", "weekly_grid", "agenda_list", "unknown"])
  }),
  events: z.array(ExtractedEventSchema)
});

export type CalendarExtraction = z.infer<typeof CalendarExtractionSchema>;

export interface ExtractionInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf"
];

/**
 * Extracts calendar events from a file buffer using Gemini API with streaming support.
 */
export async function* extractCalendarEventsStream(input: ExtractionInput) {
  const { buffer, filename, mimeType: originalMimeType } = input;
  let currentMimeType = originalMimeType.toLowerCase();
  
  if (currentMimeType === "image/jpg") currentMimeType = "image/jpeg";

  if (!SUPPORTED_MIME_TYPES.includes(currentMimeType)) {
    throw new Error("File type not supported. Please upload an image or PDF.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  const correlationId = Math.random().toString(36).substring(2, 10).toUpperCase();
  console.log(`[${correlationId}] [AUDIT] Starting extraction for: ${filename}`);
  console.log(`[${correlationId}] [AUDIT] Model: ${modelName} | MIME: ${currentMimeType}`);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "calendar-extract-"));
  const tempInputPath = path.join(tempDir, filename);
  await fs.writeFile(tempInputPath, buffer);

  try {
    const uploadResult = await fileManager.uploadFile(tempInputPath, {
      mimeType: currentMimeType,
      displayName: filename,
    });

    let file = uploadResult.file;
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === FileState.FAILED) throw new Error("Gemini file processing failed");

    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const prompt = `You are a Senior Data Engineer specializing in Computer Vision and Document Extraction.
Your task is to extract event data from a caregiver organization's calendar image with 100% precision.

STEP-BY-STEP EXTRACTION PROCESS:
1. HEADER ANALYSIS: 
   - Identify the Month and Year (e.g., "DEC 2025" or "NOVEMBER 2025").
2. LEGEND & VENUE MAPPING:
   - Carefully read the "Legend", "Meeting Venues", or "Locations" section (usually at the bottom or side).
   - Create a mental map of activity categories/colors to their full addresses.
3. GRID EXTRACTION:
   - Iterate through every numbered day in the calendar grid.
   - For each day that contains text (an event), generate YYYY-MM-DD, extract title, start/end time, and map venue.

OUTPUT FORMAT:
First, output your reasoning process in plain text. Explain how you are identifying the month, mapping the venues, and processing the grid.
Then, output exactly the string "[RESULT_START]" followed by the final result as a single JSON block matching the schema below.
Finally, output "[RESULT_END]".

SCHEMA:
${JSON.stringify(zodToJsonSchema(CalendarExtractionSchema))}

Begin your reasoning now:`;

    const result = await model.generateContentStream([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: prompt },
    ]);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield { type: "text", content: chunkText };
    }

    console.log(`\n[${correlationId}] [AUDIT] Received full response from Gemini`);
    
    const resultMatch = fullText.match(/\[RESULT_START\]([\s\S]*?)\[RESULT_END\]/);
    if (resultMatch) {
      try {
        const jsonContent = resultMatch[1].trim();
        const parsed = JSON.parse(jsonContent);
        console.log(`[${correlationId}] [AUDIT] Successfully parsed JSON. Found ${parsed.events?.length || 0} events.`);
        yield { type: "json", content: parsed };
      } catch (e) {
        console.error(`[${correlationId}] [AUDIT ERROR] Failed to parse JSON:`, e);
        yield { type: "error", content: "Failed to parse extraction results." };
      }
    } else {
      console.warn(`[${correlationId}] [AUDIT WARNING] No [RESULT_START] block found`);
      yield { type: "error", content: "No structured data found in response." };
    }

  } catch (error: any) {
    console.error(`[${correlationId}] [AUDIT ERROR] Exception:`, error.message);
    throw error;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`[${correlationId}] [AUDIT] Cleanup completed.`);
  }
}

/**
 * Extracts calendar events from a file buffer using Gemini API.
 */
export async function extractCalendarEvents(input: ExtractionInput): Promise<CalendarExtraction> {
  const { buffer, filename, mimeType: originalMimeType } = input;
  let currentMimeType = originalMimeType.toLowerCase();
  
  if (currentMimeType === "image/jpg") currentMimeType = "image/jpeg";

  if (!SUPPORTED_MIME_TYPES.includes(currentMimeType)) {
    throw new Error("File type not supported. Please upload an image or PDF.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  const correlationId = Math.random().toString(36).substring(2, 10).toUpperCase();
  console.log(`[${correlationId}] [AUDIT] Starting single extraction for: ${filename}`);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "calendar-extract-"));
  const tempInputPath = path.join(tempDir, filename);
  await fs.writeFile(tempInputPath, buffer);

  try {
    const uploadResult = await fileManager.uploadFile(tempInputPath, {
      mimeType: currentMimeType,
      displayName: filename,
    });

    let file = uploadResult.file;
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === FileState.FAILED) throw new Error("Gemini file processing failed");

    const jsonSchema: any = zodToJsonSchema(CalendarExtractionSchema);
    const cleanSchema = { ...jsonSchema };
    delete cleanSchema.$schema;
    delete cleanSchema.definitions;
    delete cleanSchema.$ref;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: cleanSchema as any,
        temperature: 0.1,
      },
    });

    const prompt = `You are a Senior Data Engineer specializing in Computer Vision and Document Extraction.
Your task is to extract event data from a caregiver organization's calendar image with 100% precision.

STEP-BY-STEP EXTRACTION PROCESS:
1. HEADER ANALYSIS: 
   - Identify the Month and Year (e.g., "DEC 2025" or "NOVEMBER 2025").
2. LEGEND & VENUE MAPPING:
   - Carefully read the "Legend", "Meeting Venues", or "Locations" section (usually at the bottom or side).
   - Create a mental map of activity categories/colors to their full addresses.
   - Examples: 
     - "Activities in MTC Office" -> "MTC Eunos Office, Level 2"
     - "Gardens by the Bay" -> "Gardens by the Bay"
     - "Bowling @ Yishun SAFRA" -> "Yishun SAFRA"
3. GRID EXTRACTION:
   - Iterate through every numbered day in the calendar grid.
   - For each day that contains text (an event):
     - Generate 'date_iso' as YYYY-MM-DD using the year and month from the header and the day number from the box.
     - Extract 'title' exactly as written (e.g., "Terrarium @ Tampines East").
     - Extract 'start_time' and 'end_time'. 
       - Convert 12h formats (e.g., "3-4pm", "10am-12.30pm") to 24h ISO format "HH:MM".
       - Example: "3-4pm" -> start="15:00", end="16:00".
       - Example: "10am-12.30pm" -> start="10:00", end="12:30".
     - Map 'location' by looking at the title or the activity category (via color/icon). Use the full address from the legend if available.
     - Detect 'is_accessible': Set to true if you see a wheelchair icon (♿) or if the legend/title implies it.
4. QUALITY CONTROL:
   - Ensure 'events' is a flat array of all activities found across the entire month.
   - If no events are found, return an empty array for 'events', but still include the 'meta' object.

Output must be strictly valid JSON matching the provided schema.`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    console.log(`\n[${correlationId}] [AUDIT] Received full response from Gemini`);
    console.log(responseText);
    
    const parsed = JSON.parse(responseText);
    
    // Ensure events is always an array
    if (!parsed.events) {
      console.warn(`[${correlationId}] [AUDIT WARNING] No events array in response`);
      parsed.events = [];
    } else {
      console.log(`[${correlationId}] [AUDIT] Successfully parsed JSON. Found ${parsed.events.length} events.`);
    }
    
    return parsed;
  } catch (error: any) {
    console.error(`[${correlationId}] [AUDIT ERROR] Exception:`, error.message);
    throw error;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`[${correlationId}] [AUDIT] Cleanup completed.`);
  }
}
