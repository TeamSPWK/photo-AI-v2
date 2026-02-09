import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/templates";

/**
 * POST /api/analyze-templates
 *
 * Returns the pre-cached template metadata for all available templates.
 * No Gemini API call is needed since the metadata is hardcoded.
 */
export async function POST() {
  try {
    console.log("[analyze-templates] Returning pre-cached template metadata");

    return NextResponse.json({
      success: true,
      templates: TEMPLATES,
      count: TEMPLATES.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[analyze-templates] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
