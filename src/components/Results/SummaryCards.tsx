import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { YearlySummary } from "@/engine/types"
import { motion } from "motion/react"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface SummaryCardsProps {
  yearlySummaries: YearlySummary[]
}

export default function SummaryCards({ yearlySummaries }: SummaryCardsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.12 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Yearly summaries</CardTitle>
              <CardDescription>Year-end checkpoints.</CardDescription>
            </div>
            <Badge variant="secondary">{yearlySummaries.length} years</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {yearlySummaries.map((summary) => (
            <div key={summary.year} className="rounded-2xl border border-border/70 p-4">
              <p className="text-sm font-medium text-muted-foreground">{summary.year}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(summary.endBalance)}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>Total saved</span>
                  <span className="tabular-nums text-foreground">{currency.format(summary.totalSaved)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Interest earned</span>
                  <span className="tabular-nums text-foreground">{currency.format(summary.totalInterest)}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
