import BottomSheet from "@/components/ui/BottomSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { SpendingCategory, Transaction } from "@/db/database"
import { addTransaction, updateTransaction } from "@/hooks/useBudget"
import { getTodayIsoDate } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

interface AddTransactionDialogProps {
  categories: SpendingCategory[]
  initialTransaction?: Transaction
  initialCategoryId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createDraft(categories: SpendingCategory[], initialTransaction?: Transaction, initialCategoryId?: string) {
  return {
    amount: initialTransaction?.amount ? String(initialTransaction.amount) : "",
    categoryId: initialTransaction?.categoryId ?? initialCategoryId ?? categories[0]?.id ?? "",
    description: initialTransaction?.description ?? "",
    date: initialTransaction?.date ?? getTodayIsoDate(),
  }
}

export default function AddTransactionDialog({ categories, initialTransaction, initialCategoryId, open, onOpenChange }: AddTransactionDialogProps) {
  const [draft, setDraft] = useState(() => createDraft(categories, initialTransaction, initialCategoryId))
  const [submitting, setSubmitting] = useState(false)

  const dialogTitle = initialTransaction ? "Edit transaction" : "Add transaction"
  const submitLabel = initialTransaction ? "Save" : "Add"

  const resetDraft = () => setDraft(createDraft(categories, initialTransaction, initialCategoryId))

  const closeDialog = () => {
    resetDraft()
    onOpenChange(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.categoryId) {
      toast.error("Choose a category")
      return
    }

    const parsedAmount = Number(draft.amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount")
      return
    }

    setSubmitting(true)

    try {
      if (initialTransaction) {
        await updateTransaction(initialTransaction.id, {
          amount: parsedAmount,
          categoryId: draft.categoryId,
          description: draft.description.trim(),
          date: draft.date,
        })
        toast.success("Transaction updated")
      } else {
        await addTransaction({
          amount: parsedAmount,
          categoryId: draft.categoryId,
          description: draft.description.trim() || "Expense",
          date: draft.date,
          isRecurring: false,
        })
        toast.success("Transaction added")
      }

      onOpenChange(false)
      resetDraft()
    } catch {
      toast.error("Unable to save transaction")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={closeDialog} title={dialogTitle}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" type="number" min="0" step="0.01" placeholder="0" className="h-11 text-base" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={draft.categoryId} onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))} className="h-11 text-base">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="h-11 text-base" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} type="date" className="h-11 text-base" />
        </div>

        <div className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end", submitting && "opacity-80")}>
          <Button type="button" variant="outline" onClick={closeDialog} className="min-h-11 w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || categories.length === 0} className="min-h-11 w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
