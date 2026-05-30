import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthlyRow } from "@/engine/types"
import { motion } from "motion/react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 })

interface InflowBreakdownChartProps {
  rows: MonthlyRow[]
}

export default function InflowBreakdownChart({ rows }: InflowBreakdownChartProps) {
  const data = rows.map((row) => {
    const breakdown = { salary: 0, espp: 0, stockVests: 0, bonus: 0 }

    row.inflows.forEach((inflow) => {
      const name = inflow.name.toLowerCase()
      if (name.includes("salary")) {
        breakdown.salary += inflow.amount
      } else if (name.includes("espp")) {
        breakdown.espp += inflow.amount
      } else if (name.includes("vest") || name.includes("stock")) {
        breakdown.stockVests += inflow.amount
      } else if (name.includes("bonus")) {
        breakdown.bonus += inflow.amount
      }
    })

    return { date: row.dateStr, ...breakdown }
  })

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Inflow breakdown</CardTitle>
              <CardDescription>Monthly stacked view of salary, ESPP, stock vesting, and bonus inflows.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Salary</Badge>
              <Badge variant="outline">ESPP</Badge>
              <Badge variant="outline">Stock vests</Badge>
              <Badge variant="outline">Bonus</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} width={72} tickFormatter={(value) => compact.format(Number(value))} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 16 }}
                  formatter={(value, name) => [currency.format(Number(value ?? 0)), String(name)]}
                />
                <Area type="monotone" dataKey="salary" stackId="stack" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.55} />
                <Area type="monotone" dataKey="espp" stackId="stack" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.55} />
                <Area type="monotone" dataKey="stockVests" stackId="stack" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.55} />
                <Area type="monotone" dataKey="bonus" stackId="stack" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.55} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
