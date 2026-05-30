import AddTransactionDialog from "@/components/Budget/AddTransactionDialog"
import CategoryCard from "@/components/Budget/CategoryCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { addCategory, useCategories, useMonthSummary, useTransactions } from "@/hooks/useBudget"
import { categoryIconOptions, categoryIcons, formatKES, formatMonthLabel, getMonthId, longDateFormatter, shiftMonth, slugifyCategoryName } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
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
  const pieData = useMemo(
    () => summary?.categories.filter((category) => category.spent > 0) ?? [],
    [summary],
  )

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Budget</h2>
          <p className="text-sm text-muted-foreground">Monthly budget view</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => setMonth((current) => shiftMonth(current, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-36 px-4 text-center text-sm font-medium">{formatMonthLabel(month)}</div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setMonth((current) => shiftMonth(current, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button type="button" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/85">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Budgeted</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatKES(summary?.totalBudgeted ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{formatKES(summary?.totalSpent ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={cn("mt-2 text-2xl font-semibold tabular-nums", (summary?.remaining ?? 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
              {formatKES(summary?.remaining ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {(summary?.categories ?? []).map((categorySummary) => (
            <CategoryCard
              key={categorySummary.categoryId}
              summary={categorySummary}
              selected={activeCategoryId === categorySummary.categoryId}
              onClick={() => setSelectedCategoryId(categorySummary.categoryId)}
            />
          ))}
        </div>

        <Card className="border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle>Spending mix</CardTitle>
            <CardDescription>{formatMonthLabel(month)}</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="spent" nameKey="category.name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.category?.color ?? "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatKES(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                No spending yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>{selectedCategory?.name ?? "Transactions"}</CardTitle>
          <CardDescription>{formatMonthLabel(month)}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTransactions.length > 0 ? (
            <div className="space-y-3">
              {selectedTransactions.map((transaction) => {
                const Icon = categoryIcons[selectedCategory?.icon ?? "Wallet"] ?? categoryIcons.Wallet
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
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
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              No transactions
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog categories={categories} />

      <AnimatePresence>
        {categoryDialogOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryDialogOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-3xl border border-border/70 bg-card p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Add category</h3>
                  <p className="text-sm text-muted-foreground">Budget setup</p>
                </div>
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
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
