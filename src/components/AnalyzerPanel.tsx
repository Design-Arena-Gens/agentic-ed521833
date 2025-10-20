'use client';

import { FormEvent, useMemo, useState } from "react";
import { useNutrition } from "@/contexts/NutritionContext";
import type { FoodItem } from "@/types/nutrition";

type ManualFoodDraft = {
  id: string;
  name: string;
  quantityGrams: number;
  proteinGrams: number;
};

const emptyDraft: ManualFoodDraft = {
  id: "",
  name: "",
  quantityGrams: 0,
  proteinGrams: 0,
};

export default function AnalyzerPanel() {
  const { logMeal, state } = useNutrition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodItem[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [manualFoods, setManualFoods] = useState<ManualFoodDraft[]>([]);
  const [draft, setDraft] = useState<ManualFoodDraft>(emptyDraft);

  const totalProtein = useMemo(() => {
    const auto = analysis?.reduce((sum, item) => sum + item.proteinGrams, 0) ?? 0;
    const manual =
      manualFoods.reduce((sum, item) => sum + item.proteinGrams, 0) ?? 0;
    return Number((auto + manual).toFixed(1));
  }, [analysis, manualFoods]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImagePayload(result);
      setIsUploading(false);
      setAnalysis(null);
      setSuggestions([]);
      setMessage("");
      setError(null);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setError("Unable to read image. Try a different file.");
    };
    reader.readAsDataURL(file);
  };

  const onAnalyze = async () => {
    if (!imagePayload) {
      setError("Please upload a meal photo first.");
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: imagePayload,
          manualFoods: manualFoods.length
            ? manualFoods.map(
                ({ name, quantityGrams, proteinGrams }) => ({
                  name,
                  quantityGrams,
                  proteinGrams,
                })
              )
            : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Analysis failed");
      }
      const foods = payload.foods as FoodItem[];
      const combined = [
        ...(foods ?? []),
        ...manualFoods.map(({ name, quantityGrams, proteinGrams }) => ({
          name,
          quantityGrams,
          proteinGrams,
        })),
      ];
      setAnalysis(combined);
      setSuggestions(payload.suggestions ?? []);
      setMessage(payload.message ?? "");
      logMeal({
        foods: combined,
        imageDataUrl: imagePreview ?? undefined,
      });
      setManualFoods([]);
      setDraft(emptyDraft);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetPanel = () => {
    setImagePreview(null);
    setImagePayload(null);
    setAnalysis(null);
    setManualFoods([]);
    setSuggestions([]);
    setMessage("");
    setDraft(emptyDraft);
    setError(null);
  };

  const submitManualFood = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name || !draft.quantityGrams || !draft.proteinGrams) {
      setError("Please fill in food name, quantity, and protein.");
      return;
    }
    setManualFoods((prev) => [
      ...prev,
      { ...draft, id: crypto.randomUUID() },
    ]);
    setDraft(emptyDraft);
    setError(null);
  };

  const removeManualFood = (id: string) => {
    setManualFoods((prev) => prev.filter((item) => item.id !== id));
  };

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentProtein =
    state.history[todayKey]?.reduce(
      (sum, meal) => sum + meal.totalProtein,
      0
    ) ?? 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-50 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analyze a meal photo</h2>
          <p className="text-sm text-slate-300">
            Upload a clear photo of your plate. We estimate protein per item in
            seconds.
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-emerald-200 hover:text-emerald-100"
          onClick={resetPanel}
        >
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="relative flex aspect-video cursor-pointer items-center justify-center rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/5 p-6 text-center transition hover:border-emerald-300 hover:bg-emerald-300/10">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Meal preview"
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <div>
                <p className="font-medium text-emerald-100">
                  Drop image or click to upload
                </p>
                <p className="mt-2 text-xs text-emerald-200/70">
                  JPG, PNG up to 5MB
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isUploading || !imagePayload}
            className="w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Analyzing..." : "Analyze meal"}
          </button>
          {error && (
            <p className="text-xs text-rose-300">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
              Estimated protein
            </h3>
            <span className="text-base font-semibold text-emerald-200">
              {totalProtein} g
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {(analysis ?? []).map((food, index) => (
              <div
                key={`${food.name}-${index}`}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-100">{food.name}</p>
                  <p className="text-xs text-slate-400">
                    {food.quantityGrams} g{food.notes ? ` · ${food.notes}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-200">
                  {food.proteinGrams} g
                </span>
              </div>
            ))}

            {manualFoods.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Manual adjustments
                </p>
                {manualFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100"
                  >
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-xs text-emerald-200/80">
                        {food.quantityGrams} g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {food.proteinGrams} g
                      </span>
                      <button
                        type="button"
                        onClick={() => removeManualFood(food.id)}
                        className="text-xs text-emerald-200/70 hover:text-emerald-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submitManualFood} className="space-y-3 text-xs">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Add manual food
            </p>
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Food name"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={1}
                value={draft.quantityGrams || ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    quantityGrams: Number(event.target.value),
                  }))
                }
                placeholder="Quantity (g)"
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              />
              <input
                type="number"
                min={0}
                step={0.1}
                value={draft.proteinGrams || ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    proteinGrams: Number(event.target.value),
                  }))
                }
                placeholder="Protein (g)"
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-emerald-300/60 bg-emerald-300/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/30"
            >
              Add food
            </button>
          </form>

          {message && (
            <p className="text-xs text-slate-300">
              {message}
            </p>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                High-protein ideas
              </p>
              <ul className="flex flex-wrap gap-2 text-xs">
                {suggestions.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl bg-slate-900/40 px-4 py-3 text-xs text-slate-400">
            <p>
              Logged today:{" "}
              <span className="text-emerald-200">{currentProtein} g</span> /{" "}
              <span className="text-emerald-200">{state.dailyTarget} g</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
