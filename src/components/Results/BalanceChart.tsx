import { Card, CardContent } from "@/components/ui/card"
import { monthYearToString } from "@/data/defaults"
import type { Milestone, MonthlyRow } from "@/engine/types"
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })
const currencyCompact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 })

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
    <Card>
      <CardContent className="p-0">
        <div className="h-[300px] w-full lg:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                dy={8}
              />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value) => currencyCompact.format(Number(value))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                formatter={(value) => [currency.format(Number(value ?? 0)), "Balance"]}
                labelStyle={{ color: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              {milestones
                .filter((milestone) => milestone.reachedDate)
                .map((milestone) => (
                  <ReferenceLine
                    key={milestone.name}
                    x={monthYearToString(milestone.reachedDate!)}
                    stroke="var(--color-muted-foreground)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                  />
                ))}
              <Area
                type="natural"
                dataKey="baseline"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#balanceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-chart-1)", strokeWidth: 0 }}
              />
              {normalizedSeries.map((entry, index) => (
                <Area
                  key={entry.key}
                  type="natural"
                  dataKey={entry.key}
                  stroke={`var(--color-chart-${(index % 4) + 2})`}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
