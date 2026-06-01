import { usePrivacy } from "@/contexts/PrivacyContext"
import type { CategoryMonthSummary } from "@/lib/finance"
import { categoryIcons, formatKES } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"

interface CategoryRowProps {
  summary: CategoryMonthSummary
  selected?: boolean
  onClick?: () => void
}

export default function CategoryRow({ summary, selected = false, onClick }: CategoryRowProps) {
  const { balanceHidden } = usePrivacy()
  const category = summary.category
  const color = category?.color ?? "#64748b"
  const Icon = categoryIcons[category?.icon ?? "Wallet"] ?? categoryIcons.Wallet
  const isOverBudget = summary.spent > summary.budgeted
  const progress = Math.min(summary.percentage, 100)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-stretch gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/60 bg-primary/5",
      )}
    >
      <span className="w-1 self-stretch rounded-full" style={{ backgroundColor: isOverBudget ? "var(--color-destructive)" : color }} />
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1A`, color }}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 space-y-2 self-center">
        <span className="flex min-w-0 items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{category?.name ?? "Category"}</span>
          <span className={cn("shrink-0 text-right text-sm tabular-nums", isOverBudget ? "font-semibold text-destructive" : "text-muted-foreground")}>
            {maskAmount(formatKES(summary.spent), balanceHidden)} / {maskAmount(formatKES(summary.budgeted), balanceHidden)}
          </span>
        </span>
        <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: isOverBudget ? "var(--color-destructive)" : color }} />
        </span>
      </span>
    </button>
  )
}
