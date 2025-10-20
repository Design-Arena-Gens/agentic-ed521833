'use client';

import { useMemo } from "react";
import { useNutrition } from "@/contexts/NutritionContext";
import GoalConfigurator from "@/components/GoalConfigurator";
import AnalyzerPanel from "@/components/AnalyzerPanel";
import MealHistory from "@/components/MealHistory";
import SummaryHeader from "@/components/SummaryHeader";

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

export default function NutritionApp() {
  const { state } = useNutrition();
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayEntries = state.history[todayKey] ?? [];
  const totalProtein = todayEntries.reduce(
    (sum, meal) => sum + meal.totalProtein,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="bg-gradient-to-b from-emerald-500/20 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-12 lg:px-8">
          <SummaryHeader
            dateLabel={formatDate(new Date())}
            todaysProtein={totalProtein}
            dailyTarget={state.dailyTarget}
          />
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
            <div className="space-y-8">
              <AnalyzerPanel />
              <MealHistory meals={todayEntries} />
            </div>
            <div className="space-y-8">
              <GoalConfigurator />
              <section className="rounded-3xl border border-emerald-500/30 bg-slate-900/50 p-6 shadow-lg shadow-emerald-500/10">
                <h2 className="text-lg font-semibold text-emerald-200">
                  Pro Tips
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Upload clear, well-lit meal photos for best results. Include
                  beverages or condiments in the frame to capture hidden
                  protein. Adjust any estimate manually if the serving differs.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
