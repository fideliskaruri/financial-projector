import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { addBill, deleteBill, toggleBillPaid, useBills, useCategories, useTransactions } from "@/hooks/useBudget"
import { daysUntil, formatKES, getMonthId, getNextDueDate, isBillDueInMonth } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { CalendarClock, Plus, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const initialBillForm = {
  name: "",
  amount: "",
  categoryId: "",
  dueDay: "1",
  frequency: "monthly" as "monthly" | "quarterly" | "annual",
  isAutoPay: false,
}

function BillsOverviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-secondary" />
        <div className="h-11 w-24 rounded-md bg-secondary" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl border bg-card" />
        ))}
      </div>
    </div>
  )
}

export default function BillsOverview() {
  const [billDialogOpen, setBillDialogOpen] = useState(false)
  const [billForm, setBillForm] = useState(initialBillForm)

  const categories = useCategories()
  const bills = useBills()
  const month = getMonthId(new Date())
  const monthTransactions = useTransactions(month)
  const isLoading = categories.length === 0 && bills.length === 0 && monthTransactions.length === 0

  const paidBillIds = useMemo(
    () => new Set(monthTransactions.filter((transaction) => transaction.recurringBillId).map((transaction) => transaction.recurringBillId as string)),
    [monthTransactions],
  )

  const dueThisMonth = useMemo(() => bills.filter((bill) => isBillDueInMonth(bill, month)), [bills, month])
  const dueTotal = dueThisMonth.reduce((sum, bill) => sum + bill.amount, 0)

  const handleAddBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amount = Number(billForm.amount)
    const dueDay = Number(billForm.dueDay)
    if (!billForm.name.trim() || !billForm.categoryId || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter bill details")
      return
    }

    try {
      await addBill({
        name: billForm.name.trim(),
        amount,
        categoryId: billForm.categoryId,
        dueDay,
        frequency: billForm.frequency,
        isAutoPay: billForm.isAutoPay,
      })
      setBillDialogOpen(false)
      setBillForm({ ...initialBillForm, categoryId: categories[0]?.id ?? "" })
      toast.success("Bill added")
    } catch {
      toast.error("Unable to add bill")
    }
  }

  const handleDeleteBill = async (billId: string) => {
    try {
      await deleteBill(billId)
      toast.success("Bill deleted")
    } catch {
      toast.error("Unable to delete bill")
    }
  }

  const handleTogglePaid = async (billId: string) => {
    try {
      const isPaid = await toggleBillPaid(billId, month)
      toast.success(isPaid ? "Bill marked paid" : "Bill marked unpaid")
    } catch {
      toast.error("Unable to update bill")
    }
  }

  if (isLoading) {
    return <BillsOverviewSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {dueThisMonth.length} bills · {formatKES(dueTotal)} this month
        </p>
        <Button type="button" variant="ghost" size="sm" className="min-h-11 px-4 text-sm" onClick={() => setBillDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {bills.length > 0 ? (
        <div>
          {bills.map((bill) => {
            const category = categories.find((item) => item.id === bill.categoryId)
            const paid = paidBillIds.has(bill.id)
            const nextDue = getNextDueDate(bill)
            const proximity = daysUntil(nextDue)

            return (
              <div key={bill.id} className={cn("flex flex-col gap-2 border-b border-border/50 py-3 last:border-0 lg:flex-row lg:items-center lg:justify-between")}>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", paid ? "bg-success" : proximity < 0 ? "bg-destructive" : proximity <= 5 ? "bg-warning" : "bg-muted-foreground/30")} />
                    <h3 className="font-medium">{bill.name}</h3>
                    {bill.isAutoPay ? <Badge variant="secondary">Auto-pay</Badge> : null}
                    <Badge variant="outline">{bill.frequency}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{category?.name ?? "Category"}</span>
                    <span>Day {bill.dueDay}</span>
                    <span>{proximity < 0 && !paid ? "Overdue" : proximity <= 5 && !paid ? `${proximity}d left` : nextDue.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <div className="min-w-28 text-left lg:text-right">
                    <p className="font-semibold tabular-nums">{formatKES(bill.amount)}</p>
                  </div>
                  <Button type="button" variant={paid ? "default" : "outline"} className="min-h-11" onClick={() => void handleTogglePaid(bill.id)}>
                    <CalendarClock className="h-4 w-4" />
                    {paid ? "Paid" : "Mark Paid"}
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => void handleDeleteBill(bill.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">No bills added yet</div>
      )}

      {billDialogOpen ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" onClick={() => setBillDialogOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-lg border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add bill</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setBillDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleAddBill}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={billForm.name} onChange={(event) => setBillForm((current) => ({ ...current, name: event.target.value }))} placeholder="Bill" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input value={billForm.amount} onChange={(event) => setBillForm((current) => ({ ...current, amount: event.target.value }))} type="number" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due day</label>
                  <Input value={billForm.dueDay} onChange={(event) => setBillForm((current) => ({ ...current, dueDay: event.target.value }))} type="number" min="1" max="31" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={billForm.categoryId} onChange={(event) => setBillForm((current) => ({ ...current, categoryId: event.target.value }))}>
                  <option value="">Select</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select value={billForm.frequency} onChange={(event) => setBillForm((current) => ({ ...current, frequency: event.target.value as typeof current.frequency }))}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </Select>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={billForm.isAutoPay} onChange={(event) => setBillForm((current) => ({ ...current, isAutoPay: event.target.checked }))} className="h-4 w-4 rounded border-border text-primary" />
                Auto-pay
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setBillDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  )
}
