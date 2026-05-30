import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthSummary } from "@/hooks/useBudget"
import { formatKES } from "@/lib/finance"

interface BudgetMiniCardProps {
  summary?: MonthSummary
}

export default function BudgetMiniCard({ summary }: BudgetMiniCardProps) {
  const spent = summary?.totalSpent ?? 0
  const budgeted = summary?.totalBudgeted ?? 0
  const progress = budgeted > 0 ? Math.min(spent / budgeted, 1) : 0
  const circumference = 2 * Math.PI * 36
  const offset = circumference - progress * circumference

  return (
    <Card className="border-border/70 bg-card/85">
      <CardHeader>
        <CardTitle className="text-base">This Month's Budget</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
            <circle cx="48" cy="48" r="36" className="fill-none stroke-muted" strokeWidth="10" />
            <circle cx="48" cy="48" r="36" className="fill-none stroke-primary transition-all" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{Math.round(progress * 100)}%</div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Spent / budgeted</p>
          <p className="text-xl font-semibold tabular-nums">{formatKES(spent)}</p>
          <p className="text-sm text-muted-foreground">of {formatKES(budgeted)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
