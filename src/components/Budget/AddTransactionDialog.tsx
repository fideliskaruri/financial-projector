import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { SpendingCategory, Transaction } from "@/db/database"
import { addTransaction, updateTransaction } from "@/hooks/useBudget"
import { getTodayIsoDate } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AddTransactionDialogProps {
  categories: SpendingCategory[]
  initialTransaction?: Transaction
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideFloatingTrigger?: boolean
}

function createDraft(categories: SpendingCategory[], initialTransaction?: Transaction) {
  return {
    amount: initialTransaction?.amount ? String(initialTransaction.amount) : "",
    categoryId: initialTransaction?.categoryId ?? categories[0]?.id ?? "",
    description: initialTransaction?.description ?? "",
    date: initialTransaction?.date ?? getTodayIsoDate(),
  }
}

export default function AddTransactionDialog({ categories, initialTransaction, open, onOpenChange, hideFloatingTrigger = false }: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [draft, setDraft] = useState(() => createDraft(categories, initialTransaction))
  const [submitting, setSubmitting] = useState(false)

  const controlled = open !== undefined
  const isOpen = controlled ? open : internalOpen
  const dialogTitle = initialTransaction ? "Edit transaction" : "Add transaction"
  const submitLabel = initialTransaction ? "Save" : "Add"

  const setDialogOpen = (nextOpen: boolean) => {
    if (!controlled) {
      setInternalOpen(nextOpen)
    }

    onOpenChange?.(nextOpen)
  }

  const openDialog = () => {
    setDraft(createDraft(categories, initialTransaction))
    setDialogOpen(true)
  }

  const resetDraft = () => setDraft(createDraft(categories, initialTransaction))

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

      setDialogOpen(false)
      resetDraft()
    } catch {
      toast.error("Unable to save transaction")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {!hideFloatingTrigger ? (
        <motion.div className="fixed bottom-6 right-6 z-30" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <Button type="button" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={openDialog} disabled={categories.length === 0}>
            <Plus className="h-5 w-5" />
          </Button>
        </motion.div>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDialogOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-3xl border bg-card p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{dialogTitle}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    resetDraft()
                    setDialogOpen(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" type="number" min="0" step="0.01" placeholder="0" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={draft.categoryId} onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} type="date" />
                </div>

                <div className={cn("flex items-center justify-end gap-2 pt-2", submitting && "opacity-80")}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetDraft()
                      setDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || categories.length === 0}>
                    {submitLabel}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
