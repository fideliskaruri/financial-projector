import Dexie, { type Table } from "dexie"

export interface SpendingCategory {
  id: string
  name: string
  icon: string
  color: string
  monthlyBudget: number
  type: "need" | "want" | "savings"
  isArchived: boolean
}

export interface Transaction {
  id: string
  date: string
  amount: number
  categoryId: string
  description: string
  isRecurring: boolean
  recurringBillId?: string
}

export interface RecurringBill {
  id: string
  name: string
  amount: number
  categoryId: string
  dueDay: number
  frequency: "monthly" | "quarterly" | "annual"
  isAutoPay: boolean
  isActive: boolean
}

export interface MonthlySnapshot {
  id: string
  totalBudgeted: number
  totalSpent: number
  categories: { categoryId: string; budgeted: number; spent: number }[]
}

export class FinanceDB extends Dexie {
  categories!: Table<SpendingCategory, string>
  transactions!: Table<Transaction, string>
  bills!: Table<RecurringBill, string>
  snapshots!: Table<MonthlySnapshot, string>

  constructor() {
    super("financial-projector")
    this.version(1).stores({
      categories: "id, type, isArchived",
      transactions: "id, date, categoryId, recurringBillId",
      bills: "id, categoryId, isActive",
      snapshots: "id",
    })
  }
}

export const db = new FinanceDB()
