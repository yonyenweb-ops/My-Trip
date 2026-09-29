import { formatDay, formatTime } from "@/lib/dates";
import { formatMoney, formatRiel } from "@/lib/money";
import type { Expense } from "@/lib/types";
import { CategoryBadge, CategoryIcon } from "./CategoryBadge";

type Props = {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ExpenseItem({ expense, onEdit, onDelete }: Props) {
  return (
    <li className="flex items-start gap-3 py-3">
      <CategoryIcon name={expense.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{expense.description || expense.category}</span>
          <span className="shrink-0 font-semibold tabular-nums text-red-600">-{formatMoney(expense.amount)}</span>
        </div>
        {expense.original && (
          <div className="text-right text-xs tabular-nums text-slate-400">paid {formatRiel(expense.original.amount)}</div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <CategoryBadge name={expense.category} />
          <span>
            {formatDay(expense.date)} · {formatTime(expense.date)}
          </span>
          {(onEdit || onDelete) && (
            <span className="ml-auto flex gap-1">
              {onEdit && (
                <button type="button" onClick={onEdit} className="rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
                  Edit
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={onDelete} className="rounded-lg px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50">
                  Delete
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
