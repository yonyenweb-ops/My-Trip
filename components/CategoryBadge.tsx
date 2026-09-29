import { getCategory } from "@/lib/categories";

export function CategoryBadge({ name }: { name: string }) {
  const c = getCategory(name);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>
      <span aria-hidden>{c.emoji}</span>
      {c.name}
    </span>
  );
}

export function CategoryIcon({ name }: { name: string }) {
  const c = getCategory(name);
  return (
    <span aria-hidden className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${c.color}`}>
      {c.emoji}
    </span>
  );
}
