'use client';

import { useEffect, useState } from "react";
import { useNutrition } from "@/contexts/NutritionContext";

const activityPreset: Record<
  "maintain" | "gain" | "lose",
  { label: string; multiplier: number; description: string }
> = {
  maintain: {
    label: "Maintain",
    multiplier: 1.6,
    description: "Steady fitness with balanced macros",
  },
  gain: {
    label: "Gain muscle",
    multiplier: 1.8,
    description: "Building muscle mass and strength",
  },
  lose: {
    label: "Cut / Fat loss",
    multiplier: 1.5,
    description: "Maintain lean mass while leaning out",
  },
};

export default function GoalConfigurator() {
  const { state, setDailyTarget } = useNutrition();
  const [weight, setWeight] = useState<number | undefined>(
    state.goalProfile.weightKg
  );
  const [activity, setActivity] = useState(state.goalProfile.activity);
  const [customTarget, setCustomTarget] = useState(state.goalProfile.customGoal);

  const computedTarget =
    customTarget ??
    (weight ? Math.round(weight * activityPreset[activity].multiplier) : 100);

  useEffect(() => {
    setDailyTarget(computedTarget, {
      activity,
      weightKg: weight,
      customGoal: customTarget,
    });
  }, [computedTarget, activity, weight, customTarget, setDailyTarget]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Daily Protein Goal</h2>
          <p className="mt-1 text-sm text-slate-300">
            We use your weight and goal to set a personalised target.
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-4 py-1 text-sm font-semibold text-emerald-200">
          {computedTarget} g
        </span>
      </div>
      <form className="mt-6 space-y-5 text-sm">
        <label className="flex flex-col gap-2">
          <span className="text-slate-200">Weight (kg)</span>
          <input
            type="number"
            min={20}
            max={200}
            value={weight ?? ""}
            onChange={(event) =>
              setWeight(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none ring-emerald-500/40 focus:ring"
            placeholder="e.g., 68"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-slate-200">Goal</legend>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(activityPreset).map(([key, meta]) => {
              const active = activity === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivity(key as typeof activity)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-400/10"
                      : "border-white/10 bg-slate-900/40 hover:border-emerald-400/40 hover:bg-emerald-400/5"
                  }`}
                >
                  <div className="text-sm font-semibold text-emerald-100">
                    {meta.label}
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    {meta.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Multiplier: {meta.multiplier} × weight
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-slate-200">Custom target (optional)</span>
          <input
            type="number"
            min={40}
            max={250}
            value={customTarget ?? ""}
            onChange={(event) =>
              setCustomTarget(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none ring-emerald-500/40 focus:ring"
            placeholder="Override auto target"
          />
        </label>
      </form>
    </section>
  );
}
