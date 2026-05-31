import { Card, CardContent } from "@/components/ui/card"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { YearlySummary } from "@/engine/types"
import { maskAmount } from "@/lib/mask"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface SummaryCardsProps {
  yearlySummaries: YearlySummary[]
}

export default function SummaryCards({ yearlySummaries }: SummaryCardsProps) {
  const { balanceHidden } = usePrivacy()

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-medium">Yearly Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {yearlySummaries.map((summary) => (
            <div key={summary.year} className="rounded-lg bg-secondary/50 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{summary.year}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{maskAmount(currency.format(summary.endBalance), balanceHidden)}</p>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Saved</span>
                  <span className="tabular-nums text-foreground">{maskAmount(currency.format(summary.totalSaved), balanceHidden)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest</span>
                  <span className="tabular-nums text-foreground">{maskAmount(currency.format(summary.totalInterest), balanceHidden)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
