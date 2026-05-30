import { useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"

import { db, type MonthlySnapshot, type RecurringBill, type SpendingCategory, type Transaction } from "@/db/database"
import { DEFAULT_CATEGORIES } from "@/db/defaults"
import { buildMonthSummary, getDueDateForMonth, getMonthId, getTodayIsoDate, isDateInMonth, type MonthSummary } from "@/lib/finance"

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

function useSeededDatabase() {
  useEffect(() => {
    void ensureDefaultCategories()
  }, [])
}

function syncSnapshot(summary: MonthSummary) {
  const snapshot: MonthlySnapshot = {
    id: summary.month,
    totalBudgeted: summary.totalBudgeted,
    totalSpent: summary.totalSpent,
    categories: summary.categories.map((category) => ({
      categoryId: category.categoryId,
      budgeted: category.budgeted,
      spent: category.spent,
    })),
  }

  return db.snapshots.put(snapshot)
}

export function useCategories() {
  useSeededDatabase()

  return (
    useLiveQuery(async () => {
      await ensureDefaultCategories()
      const categories = await db.categories.toArray()
      return categories.filter((category) => !category.isArchived).sort((left, right) => left.name.localeCompare(right.name))
    }, []) ?? []
  )
}

export function useTransactions(month?: string, categoryId?: string) {
  useSeededDatabase()

  return (
    useLiveQuery(async () => {
      await ensureDefaultCategories()
      const transactions = await db.transactions.orderBy("date").reverse().toArray()

      return transactions.filter((transaction) => {
        if (month && !isDateInMonth(transaction.date, month)) {
          return false
        }

        if (categoryId && transaction.categoryId !== categoryId) {
          return false
        }

        return true
      })
    }, [month, categoryId]) ?? []
  )
}

export function useBills() {
  useSeededDatabase()

  return (
    useLiveQuery(async () => {
      await ensureDefaultCategories()
      const bills = await db.bills.toArray()
      return bills.filter((bill) => bill.isActive).sort((left, right) => left.dueDay - right.dueDay)
    }, []) ?? []
  )
}

export function useMonthSummary(month: string) {
  useSeededDatabase()

  return useLiveQuery(async () => {
    await ensureDefaultCategories()
    const [categories, transactions] = await Promise.all([db.categories.toArray(), db.transactions.toArray()])
    const summary = buildMonthSummary(categories, transactions, month)
    await syncSnapshot(summary)
    return summary
  }, [month])
}

export async function addTransaction(transaction: Omit<Transaction, "id"> & { id?: string }) {
  await ensureDefaultCategories()
  const payload: Transaction = {
    id: transaction.id ?? crypto.randomUUID(),
    ...transaction,
    amount: Math.abs(transaction.amount),
    date: transaction.date || getTodayIsoDate(),
  }

  await db.transactions.put(payload)
  return payload
}

export async function importTransactions(transactions: Array<Omit<Transaction, "id"> & { id?: string }>) {
  await ensureDefaultCategories()
  const payload = transactions.map((transaction) => ({
    id: transaction.id ?? crypto.randomUUID(),
    ...transaction,
    amount: Math.abs(transaction.amount),
    date: transaction.date || getTodayIsoDate(),
  }))

  await db.transactions.bulkPut(payload)
  return payload.length
}

export async function deleteTransaction(transactionId: string) {
  await db.transactions.delete(transactionId)
}

export async function updateTransaction(transactionId: string, changes: Partial<Omit<Transaction, "id">>) {
  await db.transactions.update(transactionId, {
    ...changes,
    amount: changes.amount === undefined ? undefined : Math.abs(changes.amount),
  })
}

export async function addCategory(category: Omit<SpendingCategory, "id" | "isArchived"> & { id?: string }) {
  await ensureDefaultCategories()
  const payload: SpendingCategory = {
    id: category.id ?? crypto.randomUUID(),
    isArchived: false,
    ...category,
    monthlyBudget: Math.abs(category.monthlyBudget),
  }

  await db.categories.put(payload)
  return payload
}

export async function updateCategory(categoryId: string, changes: Partial<Omit<SpendingCategory, "id">>) {
  await db.categories.update(categoryId, changes)
}

export async function archiveCategory(categoryId: string) {
  await db.categories.update(categoryId, { isArchived: true })
}

export async function addBill(bill: Omit<RecurringBill, "id" | "isActive"> & { id?: string }) {
  await ensureDefaultCategories()
  const payload: RecurringBill = {
    id: bill.id ?? crypto.randomUUID(),
    isActive: true,
    ...bill,
    amount: Math.abs(bill.amount),
    dueDay: Math.min(31, Math.max(1, bill.dueDay)),
  }

  await db.bills.put(payload)
  return payload
}

export async function toggleBillPaid(billId: string, month = getMonthId(new Date())) {
  const bill = await db.bills.get(billId)
  if (!bill) {
    return false
  }

  const existing = await db.transactions
    .where("recurringBillId")
    .equals(billId)
    .filter((transaction) => isDateInMonth(transaction.date, month))
    .first()

  if (existing) {
    await db.transactions.delete(existing.id)
    return false
  }

  await addTransaction({
    date: getDueDateForMonth(bill, month).toISOString().slice(0, 10),
    amount: bill.amount,
    categoryId: bill.categoryId,
    description: bill.name,
    isRecurring: true,
    recurringBillId: bill.id,
  })

  return true
}

export async function deleteBill(billId: string) {
  await db.bills.delete(billId)
}

export type { MonthSummary }
