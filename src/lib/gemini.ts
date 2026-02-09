export interface UserAnalysis {
  wittyComment: string;
  mood: string;
  dominantColor: string;
  suggestedMoods: string[];
}

/**
 * Analyzes a user's uploaded photo using Gemini 2.0 Flash.
 * Returns a structured analysis including a witty Korean compliment,
 * detected mood, dominant color, and suggested moods for template matching.
 *
 * @param imageBase64 - Raw base64-encoded image data (no data URI prefix)
 * @returns Parsed UserAnalysis object
 */
export async function analyzeUser(imageBase64: string): Promise<UserAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a luxury brand concierge with impeccable taste and charm. Analyze this person's photo and respond with ONLY a valid JSON object (no markdown, no code fences).

Your response must be this exact JSON structure:
{
  "wittyComment": "Korean language witty compliment (2-3 sentences). Be elegant, charming, and sophisticated. Comment on their appearance, clothing style, or overall vibe as if you were a luxury fashion house creative director meeting them for the first time. Use refined Korean, not overly casual.",
  "mood": "one word or short phrase describing the overall mood/energy (in English), e.g. 'elegant', 'bold', 'playful', 'dramatic', 'warm'",
  "dominantColor": "the dominant color palette of the person's appearance/clothing (in English), e.g. 'dark navy', 'warm beige', 'vibrant red'",
  "suggestedMoods": ["array", "of", "3-4", "mood keywords in English that would pair well with this person for a billboard campaign"]
}

Be charming and sophisticated in the Korean comment. Make the person feel like a star.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
    },
  };

  console.log("[gemini] Sending user analysis request to Gemini 2.0 Flash...");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[gemini] API error response:", errorText);
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  console.log("[gemini] Received response from Gemini 2.0 Flash");

  // Extract text content from response
  const textContent = result.candidates?.[0]?.content?.parts
    ?.filter((part: { text?: string }) => part.text)
    ?.map((part: { text: string }) => part.text)
    ?.join("");

  if (!textContent) {
    console.error("[gemini] No text content in response:", JSON.stringify(result, null, 2));
    throw new Error("No text content in Gemini response");
  }

  console.log("[gemini] Raw response text:", textContent);

  // Parse JSON from response — handle potential markdown code fences
  let jsonString = textContent.trim();

  // Remove markdown code fences if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString) as UserAnalysis;

    // Validate required fields
    if (!parsed.wittyComment || !parsed.mood || !parsed.dominantColor || !parsed.suggestedMoods) {
      throw new Error("Missing required fields in Gemini response");
    }

    console.log("[gemini] Successfully parsed user analysis:", {
      mood: parsed.mood,
      dominantColor: parsed.dominantColor,
      suggestedMoods: parsed.suggestedMoods,
    });

    return parsed;
  } catch (parseError) {
    console.error("[gemini] Failed to parse JSON response:", jsonString);
    throw new Error(
      `Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`
    );
  }
}

/**
 * Generates a short witty billboard message for a face-swapped image.
 * Used by the faceswap route to add a fun tagline.
 *
 * @param templateDescription - Description of the template used
 * @returns A short billboard tagline string
 */
export async function generateBillboardMessage(
  templateDescription: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a witty luxury billboard copywriter. Generate a SHORT, punchy billboard tagline (1 line, max 10 words) in Korean for this ad concept:

"${templateDescription}"

Respond with ONLY the tagline text, nothing else. Be clever, luxurious, and memorable. The tagline should make someone smile.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 100,
    },
  };

  console.log("[gemini] Generating billboard message...");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[gemini] Billboard message API error:", errorText);
    // Non-critical — return a default message instead of throwing
    return "당신이 주인공인 순간";
  }

  const result = await response.json();

  const textContent = result.candidates?.[0]?.content?.parts
    ?.filter((part: { text?: string }) => part.text)
    ?.map((part: { text: string }) => part.text)
    ?.join("")
    ?.trim();

  if (!textContent) {
    return "당신이 주인공인 순간";
  }

  console.log("[gemini] Generated billboard message:", textContent);
  return textContent;
}
