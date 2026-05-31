import AddTransactionDialog from "@/components/Budget/AddTransactionDialog"
import CategoryCard from "@/components/Budget/CategoryCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { addCategory, useCategories, useMonthSummary, useTransactions } from "@/hooks/useBudget"
import { categoryIconOptions, categoryIcons, formatKES, formatMonthLabel, getMonthId, longDateFormatter, shiftMonth, slugifyCategoryName } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CircleDashed, Plus, X } from "lucide-react"
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
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-12 w-52 rounded-xl border bg-card" />
        <div className="h-11 w-36 rounded-md bg-secondary" />
      </div>
      <div className="flex gap-4">
        <div className="h-5 w-24 rounded bg-secondary" />
        <div className="h-5 w-24 rounded bg-secondary" />
        <div className="h-5 w-20 rounded bg-secondary" />
      </div>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr),320px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 rounded-2xl border bg-card" />
          ))}
        </div>
        <div className="h-[280px] rounded-2xl border bg-card" />
      </div>
      <div className="h-60 rounded-2xl border bg-card" />
    </div>
  )
}

export default function BudgetOverview() {
  const [month, setMonth] = useState(getMonthId(new Date()))
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
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
    <div className="space-y-4">
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

        <Button type="button" className="min-h-11" onClick={() => setCategoryDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            Budget <span className="font-medium tabular-nums text-foreground">{formatKES(summary.totalBudgeted)}</span>
          </span>
          <span className="text-muted-foreground">
            Spent <span className="font-medium tabular-nums text-foreground">{formatKES(summary.totalSpent)}</span>
          </span>
          <span className={cn("font-medium tabular-nums", summary.remaining >= 0 ? "text-success" : "text-destructive")}>
            {formatKES(summary.remaining)} left
          </span>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr),320px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.categories.map((categorySummary) => (
            <CategoryCard
              key={categorySummary.categoryId}
              summary={categorySummary}
              selected={activeCategoryId === categorySummary.categoryId}
              onClick={() => setSelectedCategoryId(categorySummary.categoryId)}
            />
          ))}
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Spending mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[280px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="spent" nameKey="category.name" innerRadius={64} outerRadius={100} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.category?.color ?? "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatKES(Number(value ?? 0))} />
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

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{selectedCategory?.name ?? "Transactions"}</CardTitle>
          <span className="text-sm text-muted-foreground">{formatMonthLabel(month)}</span>
        </CardHeader>
        <CardContent>
          {selectedTransactions.length > 0 ? (
            <div className="space-y-3">
              {selectedTransactions.map((transaction) => {
                const Icon = categoryIcons[selectedCategory?.icon ?? "Wallet"] ?? categoryIcons.Wallet
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${selectedCategory?.color ?? "#64748b"}1A`, color: selectedCategory?.color ?? "#64748b" }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{longDateFormatter.format(new Date(transaction.date))}</p>
                      </div>
                    </div>
                    <p className="font-semibold tabular-nums">{formatKES(transaction.amount)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No transactions this month</div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog categories={categories} />

      {categoryDialogOpen ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" onClick={() => setCategoryDialogOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-lg border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add category</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCategoryDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

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
                    type="number"
                    min="0"
                    step="0.01"
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
          </div>
        </>
      ) : null}
    </div>
  )
}
