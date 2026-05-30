import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ProjectionResult } from "@/engine/types"
import { motion } from "motion/react"
import { GitCompareArrows, Sparkles } from "lucide-react"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface ScenarioToggleProps {
  comparisonEnabled: boolean
  onToggle: () => void
  baselineResult: ProjectionResult
  comparisonResult: ProjectionResult
}

export default function ScenarioToggle({ comparisonEnabled, onToggle, baselineResult, comparisonResult }: ScenarioToggleProps) {
  const baselineEnd = baselineResult.rows.at(-1)?.endBalance ?? 0
  const comparisonEnd = comparisonResult.rows.at(-1)?.endBalance ?? 0
  const delta = comparisonEnd - baselineEnd

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Scenario comparison</CardTitle>
          </div>
          <Button type="button" variant={comparisonEnabled ? "default" : "outline"} onClick={onToggle}>
            <GitCompareArrows className="h-4 w-4" />
            {comparisonEnabled ? "Hide comparison" : "Compare lean scenario"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Baseline end balance</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(baselineEnd)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Lean scenario end balance</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(comparisonEnd)}</p>
          </div>
          <div className={cn("rounded-2xl border p-4", delta >= 0 ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10")}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Impact at horizon</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{currency.format(Math.abs(delta))}</p>
              </div>
              <Badge variant={delta >= 0 ? "success" : "warning"} className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                {delta >= 0 ? "Ahead" : "Behind"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
