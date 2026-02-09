import { NextRequest, NextResponse } from "next/server";
import { analyzeUser } from "@/lib/gemini";
import { selectTemplate } from "@/lib/templates";

/**
 * POST /api/analyze-user
 *
 * Accepts a user's photo as a base64 data URI, analyzes their appearance
 * using Gemini 2.0 Flash, and selects the best matching template.
 *
 * Request body: { userImage: string } — base64 data URI (e.g., "data:image/jpeg;base64,...")
 * Response: { analysis: { wittyComment, mood, dominantColor, suggestedMoods, selectedTemplate } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userImage } = body;

    if (!userImage || typeof userImage !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid userImage field. Expected a base64 data URI." },
        { status: 400 }
      );
    }

    // Strip the data URI prefix to get raw base64
    const base64Data = userImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    if (!base64Data || base64Data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty image data after stripping data URI prefix." },
        { status: 400 }
      );
    }

    console.log("[analyze-user] Analyzing user image...");
    console.log("[analyze-user] Image data length:", base64Data.length, "characters");

    // Analyze the user's photo with Gemini
    const userAnalysis = await analyzeUser(base64Data);

    console.log("[analyze-user] Analysis complete. Mood:", userAnalysis.mood);

    // Select the best template based on user's mood
    // Default to 1 person; the frontend can specify personCount if needed
    const moodString = [
      userAnalysis.mood,
      ...userAnalysis.suggestedMoods,
    ].join(" ");

    const selectedTemplate = selectTemplate(1, moodString);

    console.log("[analyze-user] Selected template:", selectedTemplate.filename);

    return NextResponse.json({
      success: true,
      analysis: {
        wittyComment: userAnalysis.wittyComment,
        mood: userAnalysis.mood,
        dominantColor: userAnalysis.dominantColor,
        suggestedMoods: userAnalysis.suggestedMoods,
        selectedTemplate,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[analyze-user] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
