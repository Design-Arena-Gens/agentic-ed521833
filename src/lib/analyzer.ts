import { findProteinReference } from "@/lib/proteinReference";
import type { FoodItem } from "@/types/nutrition";

type AnalyzerOptions = {
  assumedServings?: Array<{ name: string; quantityGrams: number }>;
  fallbackFoods?: FoodItem[];
};

const DEFAULT_SUGGESTIONS = [
  "paneer tikka",
  "masoor dal",
  "tofu stir fry",
  "egg white omelette",
  "chicken breast",
  "greek yogurt",
  "soy chunks curry",
  "sprouted moong salad",
];

export function fallbackEstimate(
  options: AnalyzerOptions = {}
): { foods: FoodItem[]; suggestions: string[]; message: string } {
  if (options.fallbackFoods?.length) {
    return {
      foods: options.fallbackFoods,
      suggestions: DEFAULT_SUGGESTIONS,
      message:
        "Protein estimates were calculated using reference data because no AI key is configured.",
    };
  }
  const baseFoods =
    options.assumedServings ??
    [
      { name: "Paneer", quantityGrams: 120 },
      { name: "Lentils (Cooked)", quantityGrams: 200 },
      { name: "Cooked Rice", quantityGrams: 180 },
    ];

  const foods = baseFoods.map(({ name, quantityGrams }) => {
    const ref = findProteinReference(name) ?? {
      proteinPer100g: 8,
    };
    const proteinGrams = Number(
      ((ref.proteinPer100g / 100) * quantityGrams).toFixed(1)
    );
    return {
      name,
      quantityGrams,
      proteinGrams,
    };
  });

  return {
    foods,
    suggestions: DEFAULT_SUGGESTIONS,
    message:
      "No vision model configured. Displaying a template estimate; connect an OpenAI key for photo analysis.",
  };
}

export function parseAiResponse(content: string) {
  try {
    const parsed = JSON.parse(content) as {
      foods: FoodItem[];
      suggestions?: string[];
      notes?: string;
    };

    const foods = parsed.foods?.map((food) => ({
      ...food,
      proteinGrams: Number(food.proteinGrams.toFixed(1)),
      quantityGrams: Math.max(0, Math.round(food.quantityGrams)),
    }));

    return {
      foods,
      suggestions: parsed.suggestions ?? DEFAULT_SUGGESTIONS,
      message: parsed.notes ?? "",
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return fallbackEstimate();
  }
}
