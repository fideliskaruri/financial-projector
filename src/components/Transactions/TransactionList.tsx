import AddTransactionDialog from "@/components/Budget/AddTransactionDialog"
import CSVImport from "@/components/Transactions/CSVImport"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { Transaction } from "@/db/database"
import { deleteTransaction, useCategories, useTransactions } from "@/hooks/useBudget"
import { categoryIcons, formatKES, longDateFormatter } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { Edit3, Search, Trash2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

function TransactionListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr),11rem,10rem,10rem,auto] xl:items-center">
        <div className="h-11 rounded-md bg-secondary" />
        <div className="h-11 rounded-md bg-secondary" />
        <div className="h-11 rounded-md bg-secondary" />
        <div className="h-11 rounded-md bg-secondary" />
        <div className="h-11 rounded-md bg-secondary" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 rounded-lg bg-secondary/60" />
        ))}
      </div>
    </div>
  )
}

export default function TransactionList() {
  const { balanceHidden } = usePrivacy()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [csvOpen, setCsvOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction>()

  const categories = useCategories()
  const transactions = useTransactions()
  const isLoading = categories.length === 0 && transactions.length === 0

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return transactions.filter((transaction) => {
      if (categoryFilter !== "all" && transaction.categoryId !== categoryFilter) {
        return false
      }

      if (fromDate && transaction.date < fromDate) {
        return false
      }

      if (toDate && transaction.date > toDate) {
        return false
      }

      if (normalizedSearch && !transaction.description.toLowerCase().includes(normalizedSearch)) {
        return false
      }

      return true
    })
  }, [categoryFilter, fromDate, search, toDate, transactions])

  const groupedTransactions = useMemo(() => {
    const grouped = new Map<string, Transaction[]>()
    filteredTransactions.forEach((transaction) => {
      grouped.set(transaction.date, [...(grouped.get(transaction.date) ?? []), transaction])
    })
    return Array.from(grouped.entries())
  }, [filteredTransactions])

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId)
      toast.success("Transaction deleted")
    } catch {
      toast.error("Unable to delete transaction")
    }
  }

  if (isLoading) {
    return <TransactionListSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr),11rem,10rem,10rem,auto] xl:items-center">
          <div className="relative min-w-0 xl:min-w-60 xl:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="h-11 pl-9 text-base" />
          </div>
          <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full text-base xl:w-44">
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 w-full text-base xl:w-40" />
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 w-full text-base xl:w-40" />
          <Button type="button" variant="outline" className="min-h-11 w-full xl:w-auto" onClick={() => setCsvOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>

        {groupedTransactions.length > 0 ? (
          <div className="space-y-4">
            {groupedTransactions.map(([date, dayTransactions]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-medium">{longDateFormatter.format(new Date(date))}</h3>
                  <span className="text-sm text-muted-foreground">{dayTransactions.length} items</span>
                </div>
                <div className="space-y-3">
                  {dayTransactions.map((transaction) => {
                    const category = categories.find((item) => item.id === transaction.categoryId)
                    const Icon = categoryIcons[category?.icon ?? "Wallet"] ?? categoryIcons.Wallet

                    return (
                      <div key={transaction.id} className="flex flex-col gap-3 rounded-lg bg-secondary/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${category?.color ?? "#64748b"}1A`, color: category?.color ?? "#64748b" }}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{category?.name ?? "Unassigned"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 sm:justify-end">
                          <p className="min-w-0 flex-1 text-left font-semibold tabular-nums sm:min-w-28 sm:flex-none sm:text-right">{maskAmount(formatKES(transaction.amount), balanceHidden)}</p>
                          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => setEditingTransaction(transaction)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => void handleDelete(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">No transactions found</div>
        )}
      </div>

      <CSVImport categories={categories} open={csvOpen} onOpenChange={setCsvOpen} />
      <AddTransactionDialog
        key={editingTransaction?.id ?? "transaction-editor"}
        categories={categories}
        initialTransaction={editingTransaction}
        open={Boolean(editingTransaction)}
        onOpenChange={(open) => !open && setEditingTransaction(undefined)}
        hideFloatingTrigger
      />
    </div>
  )
}
