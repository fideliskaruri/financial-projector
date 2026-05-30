import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MonthlyRow } from "@/engine/types"
import { motion } from "motion/react"
import { Fragment, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface ProjectionTableProps {
  rows: MonthlyRow[]
}

export default function ProjectionTable({ rows }: ProjectionTableProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  const toggleRow = (dateStr: string) => {
    setExpandedRows((current) => (current.includes(dateStr) ? current.filter((row) => row !== dateStr) : [...current, dateStr]))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader>
          <CardTitle>Projection table</CardTitle>
          <CardDescription>Detailed month-by-month balances, inflows, spending, and interest.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted/60 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Opening</th>
                  <th className="px-4 py-3 font-medium">Inflows</th>
                  <th className="px-4 py-3 font-medium">Spending</th>
                  <th className="px-4 py-3 font-medium">Interest</th>
                  <th className="px-4 py-3 font-medium">Closing</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isExpanded = expandedRows.includes(row.dateStr)
                  return (
                    <Fragment key={row.dateStr}>
                      <tr className="border-t border-border/70 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <button type="button" className="flex items-center gap-2 font-medium" onClick={() => toggleRow(row.dateStr)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            {row.dateStr}
                          </button>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{currency.format(row.startBalance)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">{currency.format(row.totalInflows)}</span>
                            <Badge variant="outline">{row.inflows.length}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{currency.format(row.spending)}</td>
                        <td className="px-4 py-3 tabular-nums text-success">{currency.format(row.interest)}</td>
                        <td className="px-4 py-3 font-medium tabular-nums">{currency.format(row.endBalance)}</td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-t border-border/70 bg-muted/20">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                              {row.inflows.length > 0 ? (
                                row.inflows.map((inflow) => (
                                  <div key={`${row.dateStr}-${inflow.name}`} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                                    <p className="text-xs text-muted-foreground">{inflow.name}</p>
                                    <p className={cn("mt-1 font-medium tabular-nums", inflow.amount >= 0 ? "text-foreground" : "text-destructive")}>
                                      {currency.format(inflow.amount)}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No additional inflows this month.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
