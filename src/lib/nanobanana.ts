/**
 * Nanobanana Pro API client for face swapping.
 * Uses the nano-banana-pro-preview model via the Gemini API endpoint.
 */

/**
 * Performs face swap: takes the user's face from their photo and applies it
 * to the person in the template image, keeping the template's background,
 * pose, clothing, and styling intact.
 *
 * @param userImageBase64 - Raw base64-encoded user photo (no data URI prefix)
 * @param templateImageBase64 - Raw base64-encoded template image (no data URI prefix)
 * @returns Face-swapped result image as a data URI string (data:image/jpeg;base64,...)
 */
export async function faceSwap(
  userImageBase64: string,
  templateImageBase64: string,
  templateMimeType: string = "image/jpeg"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: userImageBase64,
            },
          },
          {
            inline_data: {
              mime_type: templateMimeType,
              data: templateImageBase64,
            },
          },
          {
            text: "Use the SECOND uploaded image as the base and final output. Do not generate a new scene. Keep the base image exactly the same in background, body, pose, clothing, framing, and lighting. Use the FIRST uploaded image only as a facial reference. Recreate the face of the person in the base image so that it closely resembles the facial features of the person in the reference image. Blend the adjusted face naturally to match skin tone, lighting, angle, and perspective. Keep the result subtle, realistic, and consistent. Output the result in 16:9 aspect ratio.",
          },
        ],
      },
    ],
    generationConfig: {
      response_modalities: ["IMAGE", "TEXT"],
      temperature: 0.7,
    },
  };

  console.log("[nanobanana] Sending face swap request to nano-banana-pro-preview...");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[nanobanana] API error response:", errorText);
    throw new Error(
      `Nanobanana API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  console.log("[nanobanana] Received response from nano-banana-pro-preview");

  // Check for refusal
  if (result.candidates?.[0]) {
    const finishReason = result.candidates[0].finishReason;
    if (finishReason === "OTHER" || finishReason === "SAFETY") {
      console.error("[nanobanana] Model refused generation. Reason:", finishReason);
      throw new Error(
        `Face swap refused by model. Reason: ${finishReason}`
      );
    }
  }

  // Extract image data from response parts
  let imageData: string | null = null;

  if (result.candidates?.[0]?.content?.parts) {
    const parts = result.candidates[0].content.parts;
    for (const part of parts) {
      // Handle both snake_case and camelCase response formats
      if (part.inline_data?.data) {
        imageData = part.inline_data.data;
        console.log("[nanobanana] Found image data via inline_data (snake_case)");
        break;
      } else if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        console.log("[nanobanana] Found image data via inlineData (camelCase)");
        break;
      }
    }
  }

  if (!imageData) {
    console.error(
      "[nanobanana] No image data found in response. Full response:",
      JSON.stringify(result, null, 2)
    );
    throw new Error("No image data returned from face swap API");
  }

  console.log("[nanobanana] Face swap completed successfully");
  return `data:image/jpeg;base64,${imageData}`;
}
