import { Card, CardContent } from "@/components/ui/card"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { CategoryMonthSummary } from "@/lib/finance"
import { categoryIcons, formatKES } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

interface CategoryCardProps {
  summary: CategoryMonthSummary
  selected?: boolean
  onClick?: () => void
}

export default function CategoryCard({ summary, selected = false, onClick }: CategoryCardProps) {
  const { balanceHidden } = usePrivacy()
  const category = summary.category
  const Icon = categoryIcons[category?.icon ?? "Wallet"] ?? categoryIcons.Wallet
  const budgetState = summary.spent > summary.budgeted ? "over" : summary.percentage >= 80 ? "near" : "under"

  return (
    <motion.button type="button" whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="w-full min-w-0 text-left">
      <Card className={cn("h-full rounded-xl border bg-card transition-colors", selected && "border-primary/50 bg-primary/5") }>
        <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${category?.color ?? "#64748b"}1A`, color: category?.color ?? "#64748b" }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{category?.name ?? "Category"}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{category?.type ?? "budget"}</p>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-1 text-xs font-medium", budgetState === "over" ? "bg-destructive/10 text-destructive" : budgetState === "near" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
              {Math.round(summary.percentage)}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", budgetState === "over" ? "bg-destructive" : budgetState === "near" ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(summary.percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium tabular-nums text-foreground">{maskAmount(formatKES(summary.spent), balanceHidden)}</span>
              <span className="truncate tabular-nums text-muted-foreground">/ {maskAmount(formatKES(summary.budgeted), balanceHidden)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  )
}
