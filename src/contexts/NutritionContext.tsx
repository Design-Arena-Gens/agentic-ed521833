'use client';

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { FoodItem, MealEntry, NutritionState, GoalProfile } from "@/types/nutrition";

type NutritionAction =
  | { type: "set-daily-target"; target: number; profile?: GoalProfile }
  | { type: "log-meal"; meal: MealEntry }
  | { type: "reset-day"; date: string }
  | { type: "hydrate"; state: NutritionState };

const defaultDateKey = () => new Date().toISOString().slice(0, 10);

const defaultState: NutritionState = {
  dailyTarget: 100,
  goalProfile: { activity: "maintain" },
  history: { [defaultDateKey()]: [] },
};

function nutritionReducer(state: NutritionState, action: NutritionAction): NutritionState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state };
    case "set-daily-target": {
      return {
        ...state,
        dailyTarget: action.target,
        goalProfile: action.profile ?? state.goalProfile,
      };
    }
    case "log-meal": {
      const dateKey = action.meal.createdAt.slice(0, 10);
      const currentMeals = state.history[dateKey] ?? [];
      return {
        ...state,
        history: {
          ...state.history,
          [dateKey]: [...currentMeals, action.meal],
        },
      };
    }
    case "reset-day": {
      const nextHistory = { ...state.history };
      nextHistory[action.date] = [];
      return { ...state, history: nextHistory };
    }
    default:
      return state;
  }
}

type NutritionContextValue = {
  state: NutritionState;
  setDailyTarget: (target: number, profile?: GoalProfile) => void;
  logMeal: (
    meal: Omit<MealEntry, "id" | "createdAt" | "totalProtein"> &
      Partial<Pick<MealEntry, "id" | "createdAt" | "totalProtein">>
  ) => void;
  clearToday: () => void;
};

const NutritionContext = createContext<NutritionContextValue | undefined>(undefined);

const STORAGE_KEY = "ai-protein-tracker-state-v1";

function enrichMeal(
  meal: Omit<MealEntry, "id" | "createdAt" | "totalProtein"> &
    Partial<Pick<MealEntry, "id" | "createdAt" | "totalProtein">>
): MealEntry {
  const id = meal.id ?? crypto.randomUUID();
  const createdAt = meal.createdAt ?? new Date().toISOString();
  const totalProtein =
    meal.totalProtein ??
    meal.foods.reduce((acc, item) => acc + item.proteinGrams, 0);
  return { id, createdAt, totalProtein, ...meal };
}

type ProviderProps = {
  children: React.ReactNode;
};

export function NutritionProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(nutritionReducer, defaultState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const value = JSON.parse(stored) as NutritionState;
      dispatch({ type: "hydrate", state: value });
    } catch (error) {
      console.error("Failed to restore state", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setDailyTarget = useCallback(
    (target: number, profile?: GoalProfile) =>
      dispatch({ type: "set-daily-target", target, profile }),
    []
  );

  const logMeal = useCallback(
    (
      meal: Omit<MealEntry, "id" | "createdAt" | "totalProtein"> &
        Partial<Pick<MealEntry, "id" | "createdAt" | "totalProtein">>
    ) => dispatch({ type: "log-meal", meal: enrichMeal(meal) }),
    []
  );

  const clearToday = useCallback(
    () => dispatch({ type: "reset-day", date: defaultDateKey() }),
    []
  );

  const value = useMemo<NutritionContextValue>(
    () => ({
      state,
      setDailyTarget,
      logMeal,
      clearToday,
    }),
    [state, setDailyTarget, logMeal, clearToday]
  );

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const ctx = useContext(NutritionContext);
  if (!ctx) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return ctx;
}

export function getDailySummary(foods: FoodItem[]) {
  const totalProtein = foods.reduce((sum, food) => sum + food.proteinGrams, 0);
  const totalQuantity = foods.reduce((sum, food) => sum + food.quantityGrams, 0);
  return { totalProtein, totalQuantity };
}
