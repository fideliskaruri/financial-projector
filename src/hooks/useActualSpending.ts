import { useLiveQuery } from "dexie-react-hooks"

import { db } from "@/db/database"
import { DEFAULT_CATEGORIES } from "@/db/defaults"

export type ActualSpendingSource = "transactions" | "budget" | "none"

export interface ActualSpendingDetails {
  value: number | undefined
  source: ActualSpendingSource
}

let seedPromise: Promise<void> | null = null

async function ensureDefaultCategories() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const count = await db.categories.count()
      if (count === 0) {
        await db.categories.bulkAdd(DEFAULT_CATEGORIES)
      }
    })()
  }

  await seedPromise
}

function getMonthRange(months: number) {
  const normalizedMonths = Math.max(1, Math.floor(months))
  const now = new Date()
  const monthKeys = Array.from({ length: normalizedMonths }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }).reverse()

  const earliestMonth = new Date(now.getFullYear(), now.getMonth() - normalizedMonths + 1, 1)
  const startDate = `${earliestMonth.getFullYear()}-${String(earliestMonth.getMonth() + 1).padStart(2, "0")}-01`
  const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`

  return { normalizedMonths, monthKeys, startDate, endDate }
}

export function useActualSpendingDetails(months = 3): ActualSpendingDetails {
  const result = useLiveQuery(async () => {
    await ensureDefaultCategories()

    const { normalizedMonths, monthKeys, startDate, endDate } = getMonthRange(months)
    const [categories, transactions] = await Promise.all([
      db.categories.toArray(),
      db.transactions.where("date").between(startDate, endDate, true, true).toArray(),
    ])

    const totalBudget = categories.filter((category) => !category.isArchived).reduce((sum, category) => sum + category.monthlyBudget, 0)

    if (transactions.length === 0) {
      return {
        value: totalBudget > 0 ? totalBudget : undefined,
        source: totalBudget > 0 ? "budget" : "none",
      } satisfies ActualSpendingDetails
    }

    const monthlyTotals = new Map(monthKeys.map((monthKey) => [monthKey, 0]))

    for (const transaction of transactions) {
      const monthKey = transaction.date.slice(0, 7)
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + transaction.amount)
    }

    const totalSpent = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0)

    return {
      value: Math.round(totalSpent / normalizedMonths),
      source: "transactions",
    } satisfies ActualSpendingDetails
  }, [months])

  return result ?? { value: undefined, source: "none" }
}

export function useActualSpending(months = 3): number | undefined {
  return useActualSpendingDetails(months).value
}
