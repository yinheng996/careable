import { NextRequest, NextResponse } from "next/server";
import { extractCalendarEventsStream } from "@/app/(staff)/staff/lib/calendarExtractor";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Increased limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimeType = file.type || getMimeFromExtension(filename);

    const correlationId = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log(`[${correlationId}] [ROUTE] Received extraction request for ${filename}`);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          console.log(`[${correlationId}] [ROUTE] Starting stream for ${filename}`);
          for await (const chunk of extractCalendarEventsStream({ buffer, filename, mimeType })) {
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
          }
          console.log(`[${correlationId}] [ROUTE] Stream completed successfully for ${filename}`);
          controller.close();
        } catch (error: any) {
          console.error(`[${correlationId}] [ROUTE ERROR] Stream failed:`, error.message);
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", content: error.message }) + "\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
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
