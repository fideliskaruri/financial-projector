import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { monthYearToString } from "@/data/defaults"
import type { Milestone, MonthlyRow } from "@/engine/types"
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
const comparisonColors = ["var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export interface BalanceChartSeries {
  name: string
  rows: MonthlyRow[]
}

interface BalanceChartProps {
  rows: MonthlyRow[]
  milestones?: Milestone[]
  comparisonRows?: MonthlyRow[]
  comparisonSeries?: BalanceChartSeries[]
}

export default function BalanceChart({ rows, milestones = [], comparisonRows, comparisonSeries }: BalanceChartProps) {
  const series = comparisonSeries ?? (comparisonRows ? [{ name: "Lean scenario", rows: comparisonRows }] : [])
  const normalizedSeries = series.map((entry, index) => ({ ...entry, key: `comparison-${index}` }))
  const seriesMaps = normalizedSeries.map((entry) => [entry.key, new Map(entry.rows.map((row) => [row.dateStr, row.endBalance]))] as const)
  const data = rows.map((row) => {
    const nextRow: Record<string, number | string | undefined> = { date: row.dateStr, baseline: row.endBalance }

    for (const [key, valueMap] of seriesMaps) {
      nextRow[key] = valueMap.get(row.dateStr)
    }

    return nextRow
  })

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Balance trajectory</CardTitle>
            <CardDescription>Projected closing balance by month, including equity, bonuses, and saved scenario overlays.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Current</Badge>
            {normalizedSeries.map((entry) => (
              <Badge key={entry.key} variant="outline">{entry.name}</Badge>
            ))}
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
                  formatter={(value, name) => [currency.format(Number(value ?? 0)), String(name)]}
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
                <Line type="monotone" dataKey="baseline" name="Current" stroke="var(--color-chart-1)" strokeWidth={3} dot={false} />
                {normalizedSeries.map((entry, index) => (
                  <Line
                    key={entry.key}
                    type="monotone"
                    dataKey={entry.key}
                    name={entry.name}
                    stroke={comparisonColors[index % comparisonColors.length]}
                    strokeDasharray="6 4"
                    strokeWidth={2.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
