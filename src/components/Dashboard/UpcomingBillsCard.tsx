import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecurringBill, SpendingCategory } from "@/db/database"
import { daysUntil, formatKES, getNextDueDate } from "@/lib/finance"

interface UpcomingBillsCardProps {
  bills: RecurringBill[]
  categories: SpendingCategory[]
}

export default function UpcomingBillsCard({ bills, categories }: UpcomingBillsCardProps) {
  const upcomingBills = bills
    .slice()
    .sort((left, right) => getNextDueDate(left).getTime() - getNextDueDate(right).getTime())
    .slice(0, 3)

  return (
    <Card className="border-border/70 bg-card/85">
      <CardHeader>
        <CardTitle className="text-base">Upcoming Bills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingBills.length > 0 ? (
          upcomingBills.map((bill) => {
            const category = categories.find((item) => item.id === bill.categoryId)
            const dueDate = getNextDueDate(bill)
            const dueIn = daysUntil(dueDate)

            return (
              <div key={bill.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{category?.name ?? "Category"}</span>
                    <Badge variant="outline">{dueIn <= 0 ? "Due now" : `${dueIn}d`}</Badge>
                  </div>
                </div>
                <p className="font-semibold tabular-nums">{formatKES(bill.amount)}</p>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            No upcoming bills
          </div>
        )}
      </CardContent>
    </Card>
  )
}
