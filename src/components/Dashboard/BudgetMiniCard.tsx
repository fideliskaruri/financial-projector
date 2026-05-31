import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { MonthSummary } from "@/hooks/useBudget"
import { formatKES } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"

interface BudgetMiniCardProps {
  summary?: MonthSummary
}

export default function BudgetMiniCard({ summary }: BudgetMiniCardProps) {
  const { balanceHidden } = usePrivacy()
  const spent = summary?.totalSpent ?? 0
  const budgeted = summary?.totalBudgeted ?? 0
  const remaining = budgeted - spent
  const progress = budgeted > 0 ? Math.min(spent / budgeted, 1) : 0
  const circumference = 2 * Math.PI * 36
  const offset = circumference - progress * circumference

  return (
    <Card className="border bg-card">
      <CardHeader>
        <CardTitle className="text-base">This Month's Budget</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4 p-5 sm:p-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
            <circle cx="48" cy="48" r="36" className="fill-none stroke-muted" strokeWidth="10" />
            <circle cx="48" cy="48" r="36" className="fill-none stroke-primary transition-all" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{Math.round(progress * 100)}%</div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-2xl font-semibold tabular-nums">{maskAmount(formatKES(spent), balanceHidden)}</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Budgeted</span>
              <span className="font-medium tabular-nums">{maskAmount(formatKES(budgeted), balanceHidden)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Remaining</span>
              <span className={cn("font-medium tabular-nums", remaining >= 0 ? "text-emerald-500" : "text-destructive")}>{maskAmount(formatKES(remaining), balanceHidden)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
