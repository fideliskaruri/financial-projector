import AddTransactionDialog from "@/components/Budget/AddTransactionDialog"
import CSVImport from "@/components/Transactions/CSVImport"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { Transaction } from "@/db/database"
import { deleteTransaction, useCategories, useTransactions } from "@/hooks/useBudget"
import { categoryIcons, formatKES, longDateFormatter } from "@/lib/finance"
import { motion } from "motion/react"
import { Edit3, Search, Trash2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

export default function TransactionList() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [csvOpen, setCsvOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction>()

  const categories = useCategories()
  const transactions = useTransactions()

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

  return (
    <div className="space-y-4">
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="pl-9" />
            </div>
            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-44">
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-40" />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-40" />
            <Button type="button" variant="outline" onClick={() => setCsvOpen(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                        <motion.div key={transaction.id} layout transition={{ duration: 0.15 }} className="flex flex-col gap-3 rounded-xl border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${category?.color ?? "#64748b"}1A`, color: category?.color ?? "#64748b" }}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>{category?.name ?? "Unassigned"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:justify-end">
                            <p className="min-w-28 text-right font-semibold tabular-nums">{formatKES(transaction.amount)}</p>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => void handleDelete(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>

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