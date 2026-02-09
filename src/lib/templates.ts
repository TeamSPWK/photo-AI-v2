export interface TemplateMetadata {
  filename: string;
  personCount: number;
  mood: string;
  colors: string;
  aspectRatio: string;
  description: string;
}

/**
 * Pre-analyzed template metadata cache.
 * These values were determined by analyzing each template image,
 * so we avoid redundant Gemini API calls at runtime.
 */
export const TEMPLATES: TemplateMetadata[] = [
  {
    filename: "001.jpg",
    personCount: 1,
    mood: "luxury fashion",
    colors: "warm orange/brown",
    aspectRatio: "16:9",
    description:
      "Woman with horse in an elegant luxury fashion setting. Warm orange and brown tones evoke sophistication and high-end lifestyle branding.",
  },
  {
    filename: "001.webp",
    personCount: 1,
    mood: "elegant natural",
    colors: "warm natural greens",
    aspectRatio: "4:3",
    description:
      "Woman in a lush garden with Hermes-style luxury aesthetic. Warm natural tones with soft greenery create an organic yet refined atmosphere.",
  },
  {
    filename: "002.jpg",
    personCount: 1,
    mood: "athletic dramatic",
    colors: "dark dramatic",
    aspectRatio: "4:3",
    description:
      "Female athlete in a Nike sports campaign setting. Dark, dramatic lighting with high-contrast shadows conveys power and determination.",
  },
  {
    filename: "002.webp",
    personCount: 1,
    mood: "sporty bold",
    colors: "dark contrast",
    aspectRatio: "4:3",
    description:
      "Sporty campaign image with bold dark contrast tones. Athletic energy with clean modern styling.",
  },
  {
    filename: "003.webp",
    personCount: 4,
    mood: "high fashion editorial",
    colors: "beige/ocean blue",
    aspectRatio: "16:9",
    description:
      "Four women in a high fashion editorial by the ocean. Soft beige and ocean blue palette creates a breezy yet glamorous group composition.",
  },
  {
    filename: "004.jpg",
    personCount: 1,
    mood: "artistic luxe",
    colors: "dark teal/sparkle",
    aspectRatio: "16:9",
    description:
      "Woman adorned with jewelry in an artistic, luxurious portrait. Dark teal background with sparkle accents evokes opulence and mystery.",
  },
  {
    filename: "005.jpg",
    personCount: 2,
    mood: "classic warm",
    colors: "beige vintage",
    aspectRatio: "16:9",
    description:
      "Elderly couple in a classic, warm-toned portrait. Beige vintage palette radiates timeless love and understated elegance.",
  },
  {
    filename: "006.jpg",
    personCount: 2,
    mood: "eclectic fun",
    colors: "colorful vibrant",
    aspectRatio: "16:9",
    description:
      "Man and woman on a colorful rooftop setting. Eclectic, fun energy with vibrant colors creates a playful and youthful campaign vibe.",
  },
  {
    filename: "007.jpg",
    personCount: 2,
    mood: "luxury couple",
    colors: "earth brown/gold",
    aspectRatio: "16:9",
    description:
      "Woman and man in Gucci-style luxury campaign. Earth brown and gold tones convey sophisticated, high-end couple branding.",
  },
];

/**
 * Selects the best matching template based on person count and optional mood.
 *
 * Selection strategy:
 * 1. Filter templates that match the exact person count.
 *    - If no exact match, fall back to templates with personCount >= requested count.
 *    - If still no match, use all templates.
 * 2. If a mood string is provided, score each candidate by how many mood keywords
 *    appear in the template's mood or description (case-insensitive).
 * 3. Return the highest-scoring candidate, or the first candidate if no mood is given.
 */
export function selectTemplate(
  personCount: number,
  mood?: string
): TemplateMetadata {
  // Step 1: Filter by person count
  let candidates = TEMPLATES.filter((t) => t.personCount === personCount);

  if (candidates.length === 0) {
    // Fallback: templates with at least that many person slots
    candidates = TEMPLATES.filter((t) => t.personCount >= personCount);
  }

  if (candidates.length === 0) {
    // Last resort: use all templates
    candidates = [...TEMPLATES];
  }

  // Step 2: If mood is provided, score candidates
  if (mood && mood.trim().length > 0) {
    const moodKeywords = mood
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((w) => w.length > 2);

    if (moodKeywords.length > 0) {
      const scored = candidates.map((template) => {
        const searchText =
          `${template.mood} ${template.colors} ${template.description}`.toLowerCase();
        let score = 0;
        for (const keyword of moodKeywords) {
          if (searchText.includes(keyword)) {
            score++;
          }
        }
        return { template, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Return the best match (highest score), or first candidate if all scores are 0
      return scored[0].template;
    }
  }

  // No mood provided or no keywords — return first candidate
  return candidates[0];
}
