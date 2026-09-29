export interface Category {
  name: string;
  emoji: string;
  color: string; // Tailwind classes for the badge
}

export const CATEGORIES: Category[] = [
  { name: "Food", emoji: "🍜", color: "bg-orange-100 text-orange-800" },
  { name: "Drink", emoji: "🥤", color: "bg-sky-100 text-sky-800" },
  { name: "Transport", emoji: "🛺", color: "bg-violet-100 text-violet-800" },
  { name: "Hotel", emoji: "🏨", color: "bg-indigo-100 text-indigo-800" },
  { name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-800" },
  { name: "Entertainment", emoji: "🎉", color: "bg-amber-100 text-amber-800" },
  { name: "Entrance Fee", emoji: "🎟️", color: "bg-teal-100 text-teal-800" },
  { name: "Other", emoji: "📦", color: "bg-slate-200 text-slate-700" },
];

const FALLBACK: Omit<Category, "name"> = { emoji: "🏷️", color: "bg-slate-200 text-slate-700" };

export function getCategory(name: string): Category {
  return CATEGORIES.find((c) => c.name === name) ?? { name, ...FALLBACK };
}
