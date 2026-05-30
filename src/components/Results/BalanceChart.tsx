import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Milestone, MonthlyRow } from "@/engine/types"
import { monthYearToString } from "@/data/defaults"
import { motion } from "motion/react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })
const currencyCompact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 })

interface BalanceChartProps {
  rows: MonthlyRow[]
  milestones?: Milestone[]
  comparisonRows?: MonthlyRow[]
}

export default function BalanceChart({ rows, milestones = [], comparisonRows }: BalanceChartProps) {
  const comparisonMap = new Map(comparisonRows?.map((row) => [row.dateStr, row.endBalance]) ?? [])
  const data = rows.map((row) => ({ date: row.dateStr, baseline: row.endBalance, comparison: comparisonMap.get(row.dateStr) }))

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Balance trajectory</CardTitle>
            <CardDescription>Projected closing balance by month, including equity and bonus events.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Baseline</Badge>
            {comparisonRows ? <Badge variant="outline">Lean spending overlay</Badge> : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tickFormatter={(value) => currencyCompact.format(Number(value))}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 16 }}
                  formatter={(value, name) => [currency.format(Number(value ?? 0)), name === "comparison" ? "Lean scenario" : "Baseline"]}
                />
                <Legend />
                {milestones
                  .filter((milestone) => milestone.reachedDate)
                  .map((milestone) => (
                    <ReferenceLine
                      key={milestone.name}
                      x={monthYearToString(milestone.reachedDate!)}
                      stroke="var(--color-warning)"
                      strokeDasharray="4 4"
                    />
                  ))}
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="var(--color-chart-1)" strokeWidth={3} dot={false} />
                {comparisonRows ? (
                  <Line type="monotone" dataKey="comparison" name="Lean scenario" stroke="var(--color-chart-2)" strokeWidth={3} dot={false} />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
