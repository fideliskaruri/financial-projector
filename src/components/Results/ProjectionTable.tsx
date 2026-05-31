import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { MonthlyRow } from "@/engine/types"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Fragment, useState } from "react"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface ProjectionTableProps {
  rows: MonthlyRow[]
}

export default function ProjectionTable({ rows }: ProjectionTableProps) {
  const { balanceHidden } = usePrivacy()
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  const toggleRow = (dateStr: string) => {
    setExpandedRows((current) => (current.includes(dateStr) ? current.filter((row) => row !== dateStr) : [...current, dateStr]))
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Projection table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="px-1 text-xs text-muted-foreground sm:hidden">Swipe to view the full projection table.</p>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-[640px] border-collapse text-sm">
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
                      <tr className="border-t transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <button type="button" className="flex min-h-11 items-center gap-2 py-1 text-left font-medium" onClick={() => toggleRow(row.dateStr)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            {row.dateStr}
                          </button>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(row.startBalance), balanceHidden)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">{maskAmount(currency.format(row.totalInflows), balanceHidden)}</span>
                            <Badge variant="outline">{row.inflows.length}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(row.spending), balanceHidden)}</td>
                        <td className="px-4 py-3 tabular-nums text-success">{maskAmount(currency.format(row.interest), balanceHidden)}</td>
                        <td className="px-4 py-3 font-medium tabular-nums">{maskAmount(currency.format(row.endBalance), balanceHidden)}</td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-t bg-muted/20">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                              {row.inflows.length > 0 ? (
                                row.inflows.map((inflow) => (
                                  <div key={`${row.dateStr}-${inflow.name}`} className="rounded-xl border bg-background px-3 py-2">
                                    <p className="text-xs text-muted-foreground">{inflow.name}</p>
                                    <p className={cn("mt-1 font-medium tabular-nums", inflow.amount >= 0 ? "text-foreground" : "text-destructive")}>
                                      {maskAmount(currency.format(inflow.amount), balanceHidden)}
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
    </div>
  )
}
