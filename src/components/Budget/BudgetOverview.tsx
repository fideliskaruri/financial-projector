import AddTransactionDialog from "@/components/Budget/AddTransactionDialog"
import CategoryRow from "@/components/Budget/CategoryRow"
import BottomSheet from "@/components/ui/BottomSheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { usePrivacy } from "@/contexts/PrivacyContext"
import { addCategory, useCategories, useMonthSummary, useTransactions } from "@/hooks/useBudget"
import { categoryIconOptions, categoryIcons, formatKES, formatMonthLabel, getMonthId, longDateFormatter, shiftMonth, slugifyCategoryName } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CircleDashed, Plus } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const categoryTypes = [
  { value: "need", label: "Need" },
  { value: "want", label: "Want" },
  { value: "savings", label: "Savings" },
] as const

const initialCategoryForm = {
  name: "",
  icon: "Wallet",
  color: "#6366f1",
  monthlyBudget: "",
  type: "need" as "need" | "want" | "savings",
}

function BudgetOverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-12 w-52 rounded-xl border bg-card" />
        <div className="h-11 w-36 rounded-md bg-secondary" />
      </div>
      <div className="flex gap-4">
        <div className="h-5 w-24 rounded bg-secondary" />
        <div className="h-5 w-24 rounded bg-secondary" />
        <div className="h-5 w-20 rounded bg-secondary" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 w-[200px] flex-shrink-0 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="h-60 rounded-xl border bg-card" />
    </div>
  )
}

export default function BudgetOverview() {
  const { balanceHidden } = usePrivacy()
  const [month, setMonth] = useState(getMonthId(new Date()))
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
  const [addTransactionCategoryId, setAddTransactionCategoryId] = useState<string>()
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)

  const categories = useCategories()
  const summary = useMonthSummary(month)
  const activeCategoryId = selectedCategoryId ?? categories[0]?.id
  const selectedTransactions = useTransactions(month, activeCategoryId)

  const selectedCategory = categories.find((category) => category.id === activeCategoryId)
  const pieData = useMemo(() => summary?.categories.filter((category) => category.spent > 0) ?? [], [summary])

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const monthlyBudget = Number(categoryForm.monthlyBudget)
    if (!categoryForm.name.trim() || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
      toast.error("Enter category details")
      return
    }

    const baseId = slugifyCategoryName(categoryForm.name)
    const id = categories.some((category) => category.id === baseId) ? `${baseId}-${Date.now()}` : baseId

    try {
      await addCategory({
        id,
        name: categoryForm.name.trim(),
        icon: categoryForm.icon,
        color: categoryForm.color,
        monthlyBudget,
        type: categoryForm.type,
      })
      setCategoryDialogOpen(false)
      setCategoryForm(initialCategoryForm)
      setSelectedCategoryId(id)
      toast.success("Category added")
    } catch {
      toast.error("Unable to add category")
    }
  }

  if (summary === undefined) {
    return <BudgetOverviewSkeleton />
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center rounded-xl border bg-card p-1">
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => setMonth((current) => shiftMonth(current, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-36 px-4 text-center text-sm font-medium">{formatMonthLabel(month)}</div>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => setMonth((current) => shiftMonth(current, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button type="button" className="min-h-11 rounded-xl" onClick={() => setCategoryDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            Budget <span className="font-medium tabular-nums text-foreground">{maskAmount(formatKES(summary.totalBudgeted), balanceHidden)}</span>
          </span>
          <span className="text-muted-foreground">
            Spent <span className="font-medium tabular-nums text-foreground">{maskAmount(formatKES(summary.totalSpent), balanceHidden)}</span>
          </span>
          <span className={cn("font-medium tabular-nums", summary.remaining >= 0 ? "text-success" : "text-destructive")}>
            {maskAmount(formatKES(summary.remaining), balanceHidden)} left
          </span>
        </div>
      </div>

      <div className="space-y-3 2xl:grid 2xl:grid-cols-[minmax(0,1fr),320px] 2xl:items-start 2xl:gap-4 2xl:space-y-0">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-1">
          {summary.categories.map((categorySummary) => (
            <CategoryRow
              key={categorySummary.categoryId}
              summary={categorySummary}
              selected={activeCategoryId === categorySummary.categoryId}
              onClick={() => {
                setSelectedCategoryId(categorySummary.categoryId)
                setAddTransactionCategoryId(categorySummary.categoryId)
              }}
            />
          ))}
        </div>

        <Card className="hidden rounded-xl bg-card sm:block">
          <CardHeader>
            <CardTitle>Spending mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="spent" nameKey="category.name" innerRadius={64} outerRadius={100} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.category?.color ?? "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip trigger="click" formatter={(value) => maskAmount(formatKES(Number(value ?? 0)), balanceHidden)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <CircleDashed className="h-8 w-8 opacity-30" />
                <p className="text-sm">No spending yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="-mx-4 rounded-none border-x-0 bg-transparent sm:mx-0 sm:rounded-xl sm:border sm:bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pb-3 sm:px-5">
          <CardTitle>{selectedCategory?.name ?? "Transactions"}</CardTitle>
          <span className="text-sm text-muted-foreground">{formatMonthLabel(month)}</span>
        </CardHeader>
        <CardContent className="p-0">
          {selectedTransactions.length > 0 ? (
            <div>
              {selectedTransactions.map((transaction) => {
                const Icon = categoryIcons[selectedCategory?.icon ?? "Wallet"] ?? categoryIcons.Wallet
                return (
                  <div key={transaction.id} className="flex h-[60px] items-center gap-3 border-t border-border/50 px-4 first:border-t sm:px-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${selectedCategory?.color ?? "#64748b"}1A`, color: selectedCategory?.color ?? "#64748b" }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight">{transaction.description}</p>
                      <p className="truncate text-xs text-muted-foreground">{longDateFormatter.format(new Date(transaction.date))}</p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-semibold tabular-nums">{maskAmount(formatKES(transaction.amount), balanceHidden)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">No transactions this month</div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        key={addTransactionCategoryId ?? "budget-add"}
        categories={categories}
        initialCategoryId={addTransactionCategoryId}
        open={Boolean(addTransactionCategoryId)}
        onOpenChange={(open) => { if (!open) setAddTransactionCategoryId(undefined) }}
      />

      <BottomSheet open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} title="Add category">
        <form className="space-y-4" onSubmit={handleAddCategory}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    value={categoryForm.monthlyBudget}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, monthlyBudget: event.target.value }))}
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="0.01"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={categoryForm.type} onChange={(event) => setCategoryForm((current) => ({ ...current, type: event.target.value as typeof current.type }))}>
                    {categoryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr,96px]">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Select value={categoryForm.icon} onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}>
                    {categoryIconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input value={categoryForm.color} onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))} type="color" className="h-10 p-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
        </form>
      </BottomSheet>
    </div>
  )
}
