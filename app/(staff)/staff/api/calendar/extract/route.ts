import { NextRequest, NextResponse } from "next/server";
import { extractCalendarEvents } from "@/app/(staff)/staff/lib/calendarExtractor";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB Vercel Serverless Function limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (max 4.5MB for Vercel). Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }, 
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimeType = file.type || getMimeFromExtension(filename);

    try {
      const result = await extractCalendarEvents({
        buffer,
        filename,
        mimeType,
      });

      return NextResponse.json(result);
    } catch (error: any) {
      console.error("Extraction error:", error);
      
      if (error.message === "file type not supported") {
        return NextResponse.json({ error: "file type not supported" }, { status: 415 });
      }

      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

function getMimeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "pdf": return "application/pdf";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    default: return "application/octet-stream";
  }
}
