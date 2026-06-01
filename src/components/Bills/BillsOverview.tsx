import BottomSheet from "@/components/ui/BottomSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { usePrivacy } from "@/contexts/PrivacyContext"
import { addBill, deleteBill, toggleBillPaid, useBills, useCategories, useTransactions } from "@/hooks/useBudget"
import { daysUntil, formatKES, getMonthId, getNextDueDate, isBillDueInMonth } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import { CalendarClock, Check, Plus, Trash2 } from "lucide-react"
import { useId, useMemo, useState } from "react"
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
    <div className="animate-pulse space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-secondary" />
        <div className="h-11 w-24 rounded-md bg-secondary" />
      </div>
      <div className="space-y-0 border-y border-border/50">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[60px] border-b border-border/50 last:border-b-0" />
        ))}
      </div>
    </div>
  )
}

export default function BillsOverview() {
  const { balanceHidden } = usePrivacy()
  const [billDialogOpen, setBillDialogOpen] = useState(false)
  const [billForm, setBillForm] = useState(initialBillForm)
  const fieldId = useId()

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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {dueThisMonth.length} bills · {maskAmount(formatKES(dueTotal), balanceHidden)} this month
        </p>
        <Button type="button" className="min-h-11 rounded-xl" onClick={() => setBillDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Bill
        </Button>
      </div>

      {bills.length > 0 ? (
        <div className="-mx-4 border-y border-border/50 sm:mx-0 sm:overflow-hidden sm:rounded-xl sm:border">
          {bills.map((bill) => {
            const category = categories.find((item) => item.id === bill.categoryId)
            const paid = paidBillIds.has(bill.id)
            const nextDue = getNextDueDate(bill)
            const proximity = daysUntil(nextDue)
            const statusLabel = paid ? "Paid" : proximity < 0 ? "Overdue" : proximity <= 5 ? `${proximity}d left` : "Upcoming"
            const badgeVariant = paid ? "success" : proximity < 0 ? "destructive" : proximity <= 5 ? "warning" : "secondary"

            return (
              <div key={bill.id} className="flex h-[60px] items-center gap-3 border-b border-border/50 px-4 last:border-b-0 sm:px-3">
                <button
                  type="button"
                  onClick={() => void handleTogglePaid(bill.id)}
                  aria-pressed={paid}
                  aria-label={paid ? `Mark ${bill.name} unpaid` : `Mark ${bill.name} paid`}
                  title={paid ? "Mark unpaid" : "Mark paid"}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    paid ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground hover:border-muted-foreground/60",
                  )}
                >
                  {paid ? <Check className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{bill.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {category?.name ?? "Category"} · Day {bill.dueDay}
                    {bill.isAutoPay ? " · Auto-pay" : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{maskAmount(formatKES(bill.amount), balanceHidden)}</p>
                <Badge variant={badgeVariant} className={cn("shrink-0")}>{statusLabel}</Badge>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => void handleDeleteBill(bill.id)} aria-label="Delete bill">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">No bills added yet</div>
      )}

      <BottomSheet open={billDialogOpen} onClose={() => setBillDialogOpen(false)} title="Add bill">
        <form className="space-y-4" onSubmit={handleAddBill}>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-name`} className="text-sm font-medium">Name</label>
            <Input id={`${fieldId}-name`} value={billForm.name} onChange={(event) => setBillForm((current) => ({ ...current, name: event.target.value }))} placeholder="Bill" className="h-11 text-base" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor={`${fieldId}-amount`} className="text-sm font-medium">Amount</label>
              <Input id={`${fieldId}-amount`} value={billForm.amount} onChange={(event) => setBillForm((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" type="number" min="0" step="0.01" className="h-11 text-base" />
            </div>
            <div className="space-y-2">
              <label htmlFor={`${fieldId}-dueDay`} className="text-sm font-medium">Due day</label>
              <Input id={`${fieldId}-dueDay`} value={billForm.dueDay} onChange={(event) => setBillForm((current) => ({ ...current, dueDay: event.target.value }))} type="number" min="1" max="31" className="h-11 text-base" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-category`} className="text-sm font-medium">Category</label>
            <Select id={`${fieldId}-category`} value={billForm.categoryId} onChange={(event) => setBillForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-11 text-base">
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-frequency`} className="text-sm font-medium">Frequency</label>
            <Select id={`${fieldId}-frequency`} value={billForm.frequency} onChange={(event) => setBillForm((current) => ({ ...current, frequency: event.target.value as typeof current.frequency }))} className="h-11 text-base">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </Select>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={billForm.isAutoPay} onChange={(event) => setBillForm((current) => ({ ...current, isAutoPay: event.target.checked }))} className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            Auto-pay
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setBillDialogOpen(false)} className="min-h-11 w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 w-full sm:w-auto">Save</Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
