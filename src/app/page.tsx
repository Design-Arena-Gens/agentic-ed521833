import NutritionApp from "@/components/NutritionApp";
import { NutritionProvider } from "@/contexts/NutritionContext";

export default function Home() {
  return (
    <NutritionProvider>
      <NutritionApp />
    </NutritionProvider>
  );
}
