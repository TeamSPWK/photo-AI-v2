import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/runway";

/**
 * POST /api/generate-video
 *
 * Submits an image-to-video generation task to RunwayML.
 * Constructs a dynamic cinematic prompt based on user characteristics.
 *
 * Request body: { image: string, userMood: string, userDescription: string }
 *   - image: publicly accessible URL or data URI of the source image
 *   - userMood: mood/energy keyword (e.g., "elegant", "bold")
 *   - userDescription: brief description of user/scene for prompt context
 *
 * Response: { taskId: string, status: "RUNNING" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, userMood, userDescription } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid image field." },
        { status: 400 }
      );
    }

    console.log("[generate-video] Starting video generation...");
    console.log("[generate-video] User mood:", userMood || "not specified");
    console.log("[generate-video] User description:", userDescription || "not specified");

    // Construct a dynamic cinematic prompt based on user characteristics
    const moodModifier = getMoodModifier(userMood);
    const sceneDetail = userDescription
      ? `The scene features ${userDescription}.`
      : "The billboard features a striking advertisement.";

    const videoPrompt = [
      "Cinematic slow motion.",
      sceneDetail,
      `The billboard advertisement comes alive with ${moodModifier}.`,
      "Dramatic lighting shifts as a camera slowly pulls back to reveal the full scene.",
      "Professional advertising quality with subtle atmospheric effects.",
      "The overall feeling is premium, polished, and captivating.",
    ].join(" ");

    console.log("[generate-video] Constructed prompt:", videoPrompt);

    const taskId = await generateVideo(image, videoPrompt);

    console.log("[generate-video] Task submitted. ID:", taskId);

    return NextResponse.json({
      success: true,
      taskId,
      status: "RUNNING",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-video] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * Maps a user mood keyword to appropriate cinematic motion descriptors.
 */
function getMoodModifier(mood?: string): string {
  if (!mood) {
    return "subtle wind effects, gentle light shifts, and elegant movement";
  }

  const moodLower = mood.toLowerCase();

  if (moodLower.includes("dramatic") || moodLower.includes("bold") || moodLower.includes("power")) {
    return "dramatic shadow play, intense lighting contrasts, and powerful sweeping camera movement";
  }

  if (moodLower.includes("warm") || moodLower.includes("classic") || moodLower.includes("vintage")) {
    return "warm golden light rays, gentle nostalgic haze, and a soft dreamy camera drift";
  }

  if (moodLower.includes("playful") || moodLower.includes("fun") || moodLower.includes("eclectic")) {
    return "playful light bounces, vibrant color shifts, and energetic subtle camera movement";
  }

  if (moodLower.includes("luxury") || moodLower.includes("elegant") || moodLower.includes("luxe")) {
    return "refined golden highlights, silky smooth transitions, and a prestigious slow dolly reveal";
  }

  if (moodLower.includes("athletic") || moodLower.includes("sport") || moodLower.includes("energy")) {
    return "dynamic motion blur, sharp lighting pulses, and an adrenaline-fueled camera sweep";
  }

  if (moodLower.includes("natural") || moodLower.includes("garden") || moodLower.includes("organic")) {
    return "gentle breeze effects through foliage, dappled natural light, and a serene floating camera";
  }

  // Default cinematic motion
  return "subtle wind effects, dramatic lighting shifts, and elegant slow-motion movement";
}
