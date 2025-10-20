'use client';

import Image from "next/image";
import { useMemo } from "react";
import type { MealEntry } from "@/types/nutrition";

type Props = {
  meals: MealEntry[];
};

export default function MealHistory({ meals }: Props) {
  const totalProtein = useMemo(
    () => meals.reduce((total, meal) => total + meal.totalProtein, 0),
    [meals]
  );

  if (!meals.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-100">
          No meals logged today
        </h2>
        <p className="mt-2">
          Upload your first meal photo to begin tracking your daily protein.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-50 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today&apos;s meals</h2>
        <span className="text-sm text-emerald-200">
          Total protein: {totalProtein} g
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {meals
          .slice()
          .reverse()
          .map((meal) => {
            const time = new Date(meal.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <article
                key={meal.id}
                className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[96px_1fr]"
              >
                {meal.imageDataUrl ? (
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900/60">
                    <Image
                      src={meal.imageDataUrl}
                      alt="Meal"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/10">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      No photo
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">
                      Logged {time}
                    </p>
                    <p className="text-base font-semibold text-emerald-200">
                      {meal.totalProtein} g protein
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {meal.foods.map((food, index) => (
                      <li
                        key={`${meal.id}-${index}`}
                        className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-xs text-slate-400">
                            {food.quantityGrams} g
                            {food.notes ? ` · ${food.notes}` : ""}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-200">
                          {food.proteinGrams} g
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
