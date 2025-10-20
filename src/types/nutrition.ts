export type FoodItem = {
  name: string;
  quantityGrams: number;
  proteinGrams: number;
  notes?: string;
};

export type MealEntry = {
  id: string;
  createdAt: string;
  foods: FoodItem[];
  totalProtein: number;
  imageDataUrl?: string;
};

export type GoalProfile = {
  weightKg?: number;
  activity: "maintain" | "gain" | "lose";
  customGoal?: number;
};

export type NutritionState = {
  dailyTarget: number;
  goalProfile: GoalProfile;
  history: Record<string, MealEntry[]>;
};
