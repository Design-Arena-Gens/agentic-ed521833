import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fallbackEstimate, parseAiResponse } from "@/lib/analyzer";
import { PROTEIN_REFERENCE_TABLE } from "@/lib/proteinReference";
import type { FoodItem } from "@/types/nutrition";

const MODEL = process.env.PROTEIN_MODEL ?? "gpt-4o-mini";

type AnalyzeRequestBody = {
  imageData: string;
  timezoneOffset?: number;
  manualFoods?: FoodItem[];
};

const systemPrompt = `You are a registered dietician specialising in Indian cuisine.
Given a meal photograph you must:
- identify each food item and estimate cooked serving size in grams or millilitres.
- estimate protein content for each item.
- return JSON with fields: foods (array of { name, quantityGrams, proteinGrams, notes? }), suggestions (string[]), notes.

Use the following reference table of average protein per 100g where applicable:
${PROTEIN_REFERENCE_TABLE.map(
  (item) => `${item.name} (${item.proteinPer100g}g protein)`
).join(", ")}.

Prefer dishes common to Indian home cooking. If you are uncertain about an item, include a note in the notes field.`;

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "undefined"
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    : null;

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequestBody = await request.json();

    if (!body.imageData) {
      return NextResponse.json(
        { error: "imageData is required" },
        { status: 400 }
      );
    }

    const manualFoods = body.manualFoods ?? [];

    if (!openai) {
      return NextResponse.json(
        fallbackEstimate({ fallbackFoods: manualFoods }),
        { status: 200 }
      );
    }

    const response = await openai.responses.create({
      model: MODEL,
      input: [
        {
          role: "system",
          content: `${systemPrompt}\nRespond strictly in JSON with keys: foods (array), suggestions (array), notes (string).`,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Estimate protein for this meal photo.",
            },
            {
              type: "input_image",
              image_url: body.imageData,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const content = response.output_text ?? "";
    const parsed = parseAiResponse(content);

    const foods = parsed.foods?.map((food) => ({
      ...food,
      proteinGrams: Number(food.proteinGrams.toFixed(1)),
      quantityGrams: Number(food.quantityGrams.toFixed(0)),
    }));

    if (!foods?.length) {
      return NextResponse.json(fallbackEstimate(), { status: 200 });
    }

    return NextResponse.json(
      {
        foods,
        suggestions: parsed.suggestions,
        message: parsed.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(fallbackEstimate(), { status: 200 });
  }
}
