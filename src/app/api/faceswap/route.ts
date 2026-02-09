import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { faceSwap } from "@/lib/nanobanana";
import { generateBillboardMessage } from "@/lib/gemini";
import { TEMPLATES } from "@/lib/templates";

/**
 * POST /api/faceswap
 *
 * Performs face swap: takes the user's face and applies it to a template image.
 * Also generates a witty billboard message for the result.
 *
 * Request body: { userImage: string, templateFilename: string }
 *   - userImage: base64 data URI (e.g., "data:image/jpeg;base64,...")
 *   - templateFilename: filename of the template (e.g., "001.jpg")
 *
 * Response: { success: true, image: "data:image/jpeg;base64,...", billboardMessage: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userImage, templateFilename } = body;

    // Validate inputs
    if (!userImage || typeof userImage !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid userImage field. Expected a base64 data URI." },
        { status: 400 }
      );
    }

    if (!templateFilename || typeof templateFilename !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid templateFilename field." },
        { status: 400 }
      );
    }

    // Sanitize the filename to prevent path traversal
    const sanitizedFilename = path.basename(templateFilename);

    console.log("[faceswap] Starting face swap with template:", sanitizedFilename);

    // Read the template image from the filesystem
    const templatePath = path.join(process.cwd(), "public", "images", sanitizedFilename);

    if (!fs.existsSync(templatePath)) {
      console.error("[faceswap] Template file not found:", templatePath);
      return NextResponse.json(
        { success: false, error: `Template file not found: ${sanitizedFilename}` },
        { status: 400 }
      );
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const templateBase64 = templateBuffer.toString("base64");
    const templateMimeType = sanitizedFilename.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    console.log("[faceswap] Template image loaded. Size:", templateBuffer.length, "bytes, MIME:", templateMimeType);

    // Strip the data URI prefix from the user image
    const userImageBase64 = userImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    console.log("[faceswap] User image data length:", userImageBase64.length, "characters");

    // Perform face swap and generate billboard message in parallel
    const templateMeta = TEMPLATES.find(
      (t) => t.filename === sanitizedFilename
    );
    const templateDescription = templateMeta?.description || "Luxury billboard advertisement";

    const [faceSwapResult, billboardMessage] = await Promise.all([
      faceSwap(userImageBase64, templateBase64, templateMimeType),
      generateBillboardMessage(templateDescription),
    ]);

    console.log("[faceswap] Face swap completed successfully");
    console.log("[faceswap] Billboard message:", billboardMessage);

    return NextResponse.json({
      success: true,
      image: faceSwapResult,
      billboardMessage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[faceswap] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
