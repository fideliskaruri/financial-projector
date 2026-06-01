import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MONTH_NAMES } from "@/data/defaults"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { MonthlyRow } from "@/engine/types"
import { currencyFormatter as currency } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Fragment, useMemo, useState } from "react"

interface ProjectionTableProps {
  rows: MonthlyRow[]
}

interface QuarterlyGroup {
  id: string
  label: string
  openingBalance: number
  totalInflows: number
  totalSpending: number
  totalInterest: number
  closingBalance: number
  months: MonthlyRow[]
}

export default function ProjectionTable({ rows }: ProjectionTableProps) {
  const { balanceHidden } = usePrivacy()
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const quarterlyRows = useMemo<QuarterlyGroup[]>(() => {
    const groupedRows = new Map<string, MonthlyRow[]>()

    for (const row of rows) {
      const quarter = Math.floor((row.date.month - 1) / 3) + 1
      const key = `${row.date.year}-Q${quarter}`
      const existingRows = groupedRows.get(key)

      if (existingRows) {
        existingRows.push(row)
      } else {
        groupedRows.set(key, [row])
      }
    }

    return Array.from(groupedRows.entries()).map(([id, quarterRows]) => {
      const firstMonth = quarterRows[0]
      const lastMonth = quarterRows[quarterRows.length - 1]
      const quarter = Math.floor((firstMonth.date.month - 1) / 3) + 1

      return {
        id,
        label: `Q${quarter} ${firstMonth.date.year}`,
        openingBalance: firstMonth.startBalance,
        totalInflows: quarterRows.reduce((sum, row) => sum + row.totalInflows, 0),
        totalSpending: quarterRows.reduce((sum, row) => sum + row.spending, 0),
        totalInterest: quarterRows.reduce((sum, row) => sum + row.interest, 0),
        closingBalance: lastMonth.endBalance,
        months: quarterRows,
      }
    })
  }, [rows])

  const toggleRow = (quarterId: string) => {
    setExpandedRows((current) => (current.includes(quarterId) ? current.filter((row) => row !== quarterId) : [...current, quarterId]))
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Projection table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="px-1 text-xs text-muted-foreground sm:hidden">Swipe to view the quarterly summary table.</p>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-[640px] border-collapse text-sm">
              <thead className="bg-muted/60 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Quarter</th>
                  <th className="px-4 py-3 font-medium">Opening</th>
                  <th className="px-4 py-3 font-medium">Inflows</th>
                  <th className="px-4 py-3 font-medium">Spending</th>
                  <th className="px-4 py-3 font-medium">Interest</th>
                  <th className="px-4 py-3 font-medium">Closing</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyRows.map((quarter) => {
                  const isExpanded = expandedRows.includes(quarter.id)

                  return (
                    <Fragment key={quarter.id}>
                      <tr className="border-t transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <button type="button" className="flex min-h-11 items-center gap-2 py-1 text-left font-medium" onClick={() => toggleRow(quarter.id)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            <span>{quarter.label}</span>
                            <Badge variant="outline">{quarter.months.length} {quarter.months.length === 1 ? "month" : "months"}</Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(quarter.openingBalance), balanceHidden)}</td>
                        <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(quarter.totalInflows), balanceHidden)}</td>
                        <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(quarter.totalSpending), balanceHidden)}</td>
                        <td className="px-4 py-3 tabular-nums text-success">{maskAmount(currency.format(quarter.totalInterest), balanceHidden)}</td>
                        <td className="px-4 py-3 font-medium tabular-nums">{maskAmount(currency.format(quarter.closingBalance), balanceHidden)}</td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-t bg-muted/20">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="overflow-hidden rounded-xl border bg-background">
                              <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                                  <tr>
                                    <th className="px-4 py-2 font-medium">Month</th>
                                    <th className="px-4 py-2 font-medium">Inflows</th>
                                    <th className="px-4 py-2 font-medium">Spending</th>
                                    <th className="px-4 py-2 font-medium">Interest</th>
                                    <th className="px-4 py-2 font-medium">Closing</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {quarter.months.map((row) => (
                                    <tr key={row.dateStr} className="border-t first:border-t-0">
                                      <td className="px-4 py-3 font-medium">{MONTH_NAMES[row.date.month - 1]} {row.date.year}</td>
                                      <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(row.totalInflows), balanceHidden)}</td>
                                      <td className="px-4 py-3 tabular-nums">{maskAmount(currency.format(row.spending), balanceHidden)}</td>
                                      <td className="px-4 py-3 tabular-nums text-success">{maskAmount(currency.format(row.interest), balanceHidden)}</td>
                                      <td className="px-4 py-3 font-medium tabular-nums">{maskAmount(currency.format(row.endBalance), balanceHidden)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
