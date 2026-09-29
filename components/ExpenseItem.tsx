import { formatTime } from "@/lib/dates";
import { formatMoney, formatRiel } from "@/lib/money";
import type { Expense } from "@/lib/types";
import { CategoryIcon } from "./CategoryBadge";
import { ChevronRightIcon } from "./Icons";

type Props = {
  expense: Expense;
  onOpen?: () => void; // tap to edit/delete; omitted for closed trips
};

export function ExpenseItem({ expense, onOpen }: Props) {
  const content = (
    <>
      <CategoryIcon name={expense.category} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{expense.description || expense.category}</div>
        <div className="truncate text-sm text-muted">
          {expense.description ? `${expense.category} · ` : ""}
          {formatTime(expense.date)}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-bold tabular-nums">−{formatMoney(expense.amount)}</div>
        {expense.original && <div className="text-xs text-faint tabular-nums">{formatRiel(expense.original.amount)}</div>}
      </div>
      {onOpen && <ChevronRightIcon size={18} className="-mr-1 shrink-0 text-faint" />}
    </>
  );

  return (
    <li>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Edit ${expense.description || expense.category}, ${formatMoney(expense.amount)}`}
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-soft active:bg-soft"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-3 px-2 py-2.5">{content}</div>
      )}
    </li>
  );
}
