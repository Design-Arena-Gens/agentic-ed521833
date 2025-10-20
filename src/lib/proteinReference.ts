export type ProteinReference = {
  name: string;
  aliases: string[];
  proteinPer100g: number;
  category: "animal" | "plant" | "dairy" | "grain" | "misc";
};

export const PROTEIN_REFERENCE_TABLE: ProteinReference[] = [
  {
    name: "Chicken Breast",
    aliases: ["grilled chicken", "chicken", "chicken curry"],
    proteinPer100g: 31,
    category: "animal",
  },
  {
    name: "Egg",
    aliases: ["boiled egg", "omelette", "scrambled egg", "egg bhurji"],
    proteinPer100g: 13,
    category: "animal",
  },
  {
    name: "Paneer",
    aliases: ["cottage cheese"],
    proteinPer100g: 18,
    category: "dairy",
  },
  {
    name: "Tofu",
    aliases: ["soy paneer"],
    proteinPer100g: 15,
    category: "plant",
  },
  {
    name: "Lentils (Cooked)",
    aliases: ["dal", "lentils", "sambar"],
    proteinPer100g: 9,
    category: "plant",
  },
  {
    name: "Chickpeas (Cooked)",
    aliases: ["chole", "channa", "hummus"],
    proteinPer100g: 8,
    category: "plant",
  },
  {
    name: "Kidney Beans (Cooked)",
    aliases: ["rajma"],
    proteinPer100g: 8,
    category: "plant",
  },
  {
    name: "Black Beans (Cooked)",
    aliases: ["kaala channa"],
    proteinPer100g: 8.9,
    category: "plant",
  },
  {
    name: "Quinoa (Cooked)",
    aliases: [],
    proteinPer100g: 4.4,
    category: "grain",
  },
  {
    name: "Cooked Rice",
    aliases: ["rice", "white rice", "brown rice"],
    proteinPer100g: 2.5,
    category: "grain",
  },
  {
    name: "Roti",
    aliases: ["chapati", "paratha"],
    proteinPer100g: 8,
    category: "grain",
  },
  {
    name: "Curd",
    aliases: ["yogurt", "dahi"],
    proteinPer100g: 3.5,
    category: "dairy",
  },
  {
    name: "Milk",
    aliases: ["toned milk", "skim milk"],
    proteinPer100g: 3.4,
    category: "dairy",
  },
  {
    name: "Peanuts",
    aliases: ["groundnuts", "peanut butter"],
    proteinPer100g: 26,
    category: "plant",
  },
  {
    name: "Almonds",
    aliases: [],
    proteinPer100g: 21,
    category: "plant",
  },
  {
    name: "Walnuts",
    aliases: [],
    proteinPer100g: 15,
    category: "plant",
  },
  {
    name: "Fish",
    aliases: ["salmon", "rohu", "hilsa", "tilapia"],
    proteinPer100g: 22,
    category: "animal",
  },
  {
    name: "Prawns",
    aliases: ["shrimp"],
    proteinPer100g: 24,
    category: "animal",
  },
  {
    name: "Mutton",
    aliases: ["goat meat", "lamb"],
    proteinPer100g: 25,
    category: "animal",
  },
  {
    name: "Beef",
    aliases: [],
    proteinPer100g: 26,
    category: "animal",
  },
  {
    name: "Soy Chunks",
    aliases: ["soy nuggets", "nutrela"],
    proteinPer100g: 52,
    category: "plant",
  },
  {
    name: "Sprouts",
    aliases: ["moong sprout", "sprouted moong"],
    proteinPer100g: 8,
    category: "plant",
  },
  {
    name: "Greek Yogurt",
    aliases: [],
    proteinPer100g: 10,
    category: "dairy",
  },
  {
    name: "Whey Protein Shake",
    aliases: ["protein shake"],
    proteinPer100g: 80,
    category: "misc",
  },
];

export function findProteinReference(foodName: string) {
  const lowercase = foodName.toLowerCase();
  return PROTEIN_REFERENCE_TABLE.find((entry) => {
    if (entry.name.toLowerCase() === lowercase) return true;
    return entry.aliases.some((alias) => alias.toLowerCase() === lowercase);
  });
}
