export interface Category {
  name: string;
  emoji: string;
  color: string; // Tailwind classes for the badge / icon tile (light + dark)
  bar: string; // Tailwind class for the summary chart bar
}

export const CATEGORIES: Category[] = [
  { name: "Food", emoji: "🍜", color: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300", bar: "bg-orange-500" },
  { name: "Drink", emoji: "🥤", color: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300", bar: "bg-sky-500" },
  { name: "Transport", emoji: "🛺", color: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300", bar: "bg-violet-500" },
  { name: "Hotel", emoji: "🏨", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300", bar: "bg-indigo-500" },
  { name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-300", bar: "bg-pink-500" },
  { name: "Entertainment", emoji: "🎉", color: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300", bar: "bg-amber-500" },
  { name: "Entrance Fee", emoji: "🎟️", color: "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300", bar: "bg-teal-500" },
  { name: "Other", emoji: "📦", color: "bg-slate-200 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300", bar: "bg-slate-500" },
];

const FALLBACK: Omit<Category, "name"> = {
  emoji: "🏷️",
  color: "bg-slate-200 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  bar: "bg-slate-500",
};

export function getCategory(name: string): Category {
  return CATEGORIES.find((c) => c.name === name) ?? { name, ...FALLBACK };
}
