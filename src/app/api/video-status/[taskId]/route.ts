import { NextRequest, NextResponse } from "next/server";
import { getVideoStatus } from "@/lib/runway";

/**
 * GET /api/video-status/[taskId]
 *
 * Polls the status of a RunwayML video generation task.
 *
 * Route params: taskId — the RunwayML task ID
 * Response: { status: string, videoUrl?: string }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid taskId parameter." },
        { status: 400 }
      );
    }

    console.log("[video-status] Polling status for task:", taskId);

    const result = await getVideoStatus(taskId);

    console.log("[video-status] Task", taskId, "status:", result.status);

    return NextResponse.json({
      success: true,
      status: result.status,
      ...(result.videoUrl && { videoUrl: result.videoUrl }),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[video-status] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
