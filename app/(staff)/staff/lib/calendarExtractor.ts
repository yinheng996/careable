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

CRITICAL RULES:
1. **LEGEND MAPPING IS MANDATORY**: 
   - Locate the "Legend", "Meeting Venues", or "Locations" section (usually at bottom/side)
   - Create a COMPLETE map of every color/icon to its full venue address
   - Examples:
     * Red/🏢 = "MTC Eunos Office, Level 2, 3 Paya Lebar Road, Singapore 409007"
     * Blue/🏊 = "Yishun Swimming Complex, 1 Yishun Ave 3, Singapore 768837"
     * Green/🌳 = "Gardens by the Bay, 18 Marina Gardens Dr, Singapore 018953"
   
2. **TIME CONVERSION**:
   - Convert ALL times to 24-hour format (HH:MM)
   - Examples:
     * "3-4pm" → start: "15:00", end: "16:00"
     * "10am-12.30pm" → start: "10:00", end: "12:30"
     * "9-11am" → start: "09:00", end: "11:00"
     * "2pm" → start: "14:00", end: null
   - If time is ambiguous, default to morning (09:00)
   - Always use leading zeros (09:00, not 9:00)

3. **MULTI-DAY EVENTS**:
   - If an event spans multiple days, create SEPARATE entries for each day
   - Example: "Swimming Camp (Mon 15-Wed 17)" → 3 separate event objects with dates 15th, 16th, 17th

4. **VENUE EXTRACTION PRIORITY**:
   - Priority 1: Use the legend/color mapping (most reliable)
   - Priority 2: Extract from event title if venue explicitly stated (e.g., "Art @ Gardens by the Bay")
   - Priority 3: If unclear, set to "To Be Confirmed"
   - ALWAYS use full Singapore addresses with postal codes when available

5. **SINGAPORE-SPECIFIC NORMALIZATION**:
   - "MTC" → "MTC Eunos Office, Level 2, 3 Paya Lebar Road"
   - "SAFRA" locations → Always include branch (e.g., "SAFRA Yishun, 1 Yishun Avenue 4")
   - "Tampines East" → "Tampines East Community Centre"
   - Parks/Gardens → Use official names with full addresses
   - Community Centres → Include "Community Centre" in name

STEP-BY-STEP EXTRACTION PROCESS:
1. **HEADER ANALYSIS**: 
   - Identify Month (e.g., "DEC", "DECEMBER") and Year (e.g., "2025")
   - Write down: "Month: [month], Year: [year]"
   
2. **LEGEND MAPPING** (CRITICAL):
   - Read legend section COMPLETELY
   - Map every color/icon to venue
   - Write down ALL your mappings explicitly:
     * Color/Icon X = Venue Name, Full Address
     * Color/Icon Y = Venue Name, Full Address
     * etc.

3. **CALENDAR TYPE IDENTIFICATION**:
   - Identify if: monthly_grid, weekly_grid, or agenda_list
   
4. **GRID EXTRACTION** (Day by Day):
   - For each day with content:
     a. Date: Extract day number, combine with month/year → YYYY-MM-DD format
     b. Title: Extract activity name EXACTLY as written
     c. Times: Extract and CONVERT to 24h format with leading zeros
     d. Location: Map using your legend mappings from step 2
     e. Accessibility: Check for wheelchair icon (♿) - set is_accessible: true if present
     f. Notes: Extract any "Things to bring" or additional notes

5. **QUALITY CONTROL**:
   - Count total events found
   - Verify NO venues say "TBD" (unless truly unknown in source)
   - Verify ALL times are 24h format (HH:MM)
   - Verify ALL dates are valid (no impossible dates like Feb 30)
   - Verify month/year are correctly identified

OUTPUT FORMAT:
First, output your DETAILED reasoning showing:
- Your legend mappings (write them ALL out)
- How you identified the month/year
- How you processed each day with events
- Any challenges or ambiguities you encountered

Then output exactly: [RESULT_START]
{your JSON here matching the schema}
[RESULT_END]

SCHEMA:
${JSON.stringify(zodToJsonSchema(CalendarExtractionSchema as any))}

Begin your detailed step-by-step reasoning now:`;

    // ADDED: Retry logic for 503 Overloaded errors
    let result;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        result = await model.generateContentStream([
          {
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          },
          { text: prompt },
        ]);
        // If we get here, the stream started successfully
        break;
      } catch (err: any) {
        if (err.message?.includes("503") || err.message?.includes("overloaded")) {
          retries++;
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.warn(`[${correlationId}] [AUDIT] Model overloaded. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          if (retries === maxRetries) throw err;
        } else {
          throw err;
        }
      }
    }

    if (!result) throw new Error("Failed to initialize Gemini stream after retries.");

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
        let jsonContent = resultMatch[1].trim();
        // Remove markdown code blocks if present
        jsonContent = jsonContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        
        const parsed = JSON.parse(jsonContent);
        
        // Comprehensive Normalization and Validation
        if (parsed.events) {
          parsed.events = parsed.events.map((e: any, idx: number) => {
            const errors = [];
            
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date_iso || e.date || '')) {
              errors.push(`Invalid date format: ${e.date_iso || e.date}`);
            }
            
            // Validate time format (HH:MM in 24h)
            const startTime = e.start_time || e.startTime || null;
            const endTime = e.end_time || e.endTime || null;
            
            if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) {
              errors.push(`Invalid start time format: ${startTime} (expected HH:MM)`);
            }
            
            if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) {
              errors.push(`Invalid end time format: ${endTime} (expected HH:MM)`);
            }
            
            // Warn if location is generic
            const location = e.location || e.venue || "To Be Confirmed";
            if (location === 'TBD' || location === 'To Be Confirmed' || !location) {
              console.warn(`[${correlationId}] [Event ${idx + 1}] Location not fully specified for: ${e.title || 'Untitled'}`);
            }
            
            if (errors.length > 0) {
              console.error(`[${correlationId}] [Event ${idx + 1}] Validation errors:`, errors);
            }
            
            return {
              title: e.title || e.eventTitle || e.activity || "Untitled Event",
              date_iso: e.date_iso || e.date || e.occurrenceDate || "",
              start_time: startTime,
              end_time: endTime,
              location: location,
              is_accessible: e.is_accessible ?? true,
              description: e.description || e.notes || null,
              sourceFile: filename,
              validationErrors: errors.length > 0 ? errors : undefined
            };
          });
        }

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

    const jsonSchema: any = zodToJsonSchema(CalendarExtractionSchema as any);
    const cleanSchema = { ...jsonSchema };
    delete cleanSchema.$schema;
    delete cleanSchema.definitions;
    delete cleanSchema.$ref;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: cleanSchema as any,
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
