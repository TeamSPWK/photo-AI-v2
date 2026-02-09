/**
 * RunwayML API client for image-to-video generation.
 * Uses the Gen-3 Alpha Turbo model via RunwayML's REST API.
 */

export interface VideoStatus {
  status: string;
  videoUrl?: string;
}

/**
 * Submits an image-to-video generation task to RunwayML.
 *
 * @param imageUrl - Publicly accessible URL of the source image, or a data URI
 * @param prompt - Text prompt describing the desired video motion/style
 * @returns Task ID for polling the generation status
 */
export async function generateVideo(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const apiSecret = process.env.RUNWAYML_API_SECRET;
  if (!apiSecret) {
    throw new Error("RUNWAYML_API_SECRET environment variable is not set");
  }

  const endpoint = "https://api.dev.runwayml.com/v1/image_to_video";

  const requestBody = {
    model: "gen3a_turbo",
    promptImage: imageUrl,
    promptText: prompt,
    duration: 10,
    ratio: "1280:768",
  };

  console.log("[runway] Submitting image-to-video generation task...");
  console.log("[runway] Prompt:", prompt);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiSecret}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[runway] API error response:", errorText);
    throw new Error(
      `RunwayML API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  const taskId = result.id;
  if (!taskId) {
    console.error("[runway] No task ID in response:", JSON.stringify(result, null, 2));
    throw new Error("No task ID returned from RunwayML API");
  }

  console.log("[runway] Task submitted successfully. Task ID:", taskId);
  return taskId;
}

/**
 * Polls the status of a RunwayML video generation task.
 *
 * @param taskId - The task ID returned from generateVideo()
 * @returns Current status and video URL (when complete)
 */
export async function getVideoStatus(taskId: string): Promise<VideoStatus> {
  const apiSecret = process.env.RUNWAYML_API_SECRET;
  if (!apiSecret) {
    throw new Error("RUNWAYML_API_SECRET environment variable is not set");
  }

  const endpoint = `https://api.dev.runwayml.com/v1/tasks/${taskId}`;

  console.log("[runway] Polling task status for:", taskId);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiSecret}`,
      "X-Runway-Version": "2024-11-06",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[runway] Status poll error:", errorText);
    throw new Error(
      `RunwayML status poll error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  const status = result.status || "UNKNOWN";
  let videoUrl: string | undefined;

  // RunwayML returns the output URL in an array when the task is complete
  if (result.output && Array.isArray(result.output) && result.output.length > 0) {
    videoUrl = result.output[0];
  } else if (typeof result.output === "string") {
    videoUrl = result.output;
  }

  console.log("[runway] Task status:", status, videoUrl ? `| Video URL: ${videoUrl}` : "");

  return { status, videoUrl };
}
