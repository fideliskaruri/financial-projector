import type { RecurringBill, SpendingCategory, Transaction } from "@/db/database"
import {
  Car,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  Heart,
  Home,
  PiggyBank,
  Plane,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react"

export const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
})

export const monthFormatter = new Intl.DateTimeFormat("en-KE", {
  month: "long",
  year: "numeric",
})

export const shortDateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
})

export const longDateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatKES(amount: number) {
  return currencyFormatter.format(amount)
}

export function formatCompactKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function getMonthId(input: Date | string) {
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}$/.test(input)) {
      return input
    }

    const parsed = new Date(input)
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}`
  }

  return `${input.getFullYear()}-${pad(input.getMonth() + 1)}`
}

export function formatMonthLabel(monthId: string) {
  const [year, month] = monthId.split("-").map(Number)
  return monthFormatter.format(new Date(year, month - 1, 1))
}

export function shiftMonth(monthId: string, delta: number) {
  const [year, month] = monthId.split("-").map(Number)
  return getMonthId(new Date(year, month - 1 + delta, 1))
}

export function getTodayIsoDate() {
  const today = new Date()
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
}

export function monthBounds(monthId: string) {
  const [year, month] = monthId.split("-").map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)

  return {
    start: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    end: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
  }
}

export function normalizeImportedDate(value: string) {
  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slashMatch) {
    const first = Number(slashMatch[1])
    const second = Number(slashMatch[2])
    const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3])
    const month = first > 12 ? second : first
    const day = first > 12 ? first : second
    return `${year}-${pad(month)}-${pad(day)}`
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return getTodayIsoDate()
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`
}

export function parseAmount(value: string | number) {
  if (typeof value === "number") {
    return value
  }

  const normalized = value.replace(/[^\d,.-]/g, "").replace(/,/g, "")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0
}

export const categoryIcons: Record<string, LucideIcon> = {
  Home,
  ShoppingCart,
  Car,
  Zap,
  Heart,
  Utensils,
  Film,
  ShoppingBag,
  CreditCard,
  PiggyBank,
  Wallet,
  Wifi,
  Shield,
  Gift,
  GraduationCap,
  Plane,
}

export const categoryIconOptions = [
  "Home",
  "ShoppingCart",
  "Car",
  "Zap",
  "Heart",
  "Utensils",
  "Film",
  "ShoppingBag",
  "CreditCard",
  "PiggyBank",
  "Wallet",
  "Wifi",
  "Shield",
  "Gift",
  "GraduationCap",
  "Plane",
] as const

export function getCategoryIcon(icon: string) {
  return categoryIcons[icon] ?? Wallet
}

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isDateInMonth(date: string, monthId: string) {
  return date.startsWith(`${monthId}-`)
}

export function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function clampDueDay(year: number, monthIndex: number, dueDay: number) {
  return Math.min(dueDay, new Date(year, monthIndex + 1, 0).getDate())
}

export function isBillDueInMonth(bill: RecurringBill, monthId: string) {
  const month = Number(monthId.split("-")[1]) - 1

  if (bill.frequency === "monthly") {
    return true
  }

  if (bill.frequency === "quarterly") {
    return month % 3 === 0
  }

  return month === 0
}

export function getDueDateForMonth(bill: RecurringBill, monthId: string) {
  const [year, month] = monthId.split("-").map(Number)
  const day = clampDueDay(year, month - 1, bill.dueDay)
  return new Date(year, month - 1, day)
}

export function getNextDueDate(bill: RecurringBill, reference = new Date()) {
  const base = startOfDay(reference)

  for (let offset = 0; offset < 24; offset += 1) {
    const candidateMonth = new Date(base.getFullYear(), base.getMonth() + offset, 1)
    const candidateMonthId = getMonthId(candidateMonth)

    if (!isBillDueInMonth(bill, candidateMonthId)) {
      continue
    }

    const dueDate = getDueDateForMonth(bill, candidateMonthId)
    if (offset > 0 || dueDate >= base) {
      return dueDate
    }
  }

  return getDueDateForMonth(bill, getMonthId(reference))
}

export function daysUntil(date: Date, reference = new Date()) {
  const ms = startOfDay(date).getTime() - startOfDay(reference).getTime()
  return Math.round(ms / 86_400_000)
}

export function autoCategorizeTransaction(description: string, categories: SpendingCategory[]) {
  const normalized = description.toLowerCase()
  const keywordMap: Record<string, string[]> = {
    transport: ["uber", "bolt", "taxi", "fuel", "shell", "total", "rubis"],
    groceries: ["naivas", "quickmart", "carrefour", "grocery", "supermarket"],
    utilities: ["kplc", "water", "power", "internet", "airtime", "token"],
    subscriptions: ["netflix", "spotify", "showmax", "youtube", "apple.com/bill"],
    entertainment: ["cinema", "movie", "showmax", "netflix"],
    "eating-out": ["restaurant", "cafe", "java", "glovo", "uber eats", "kfc", "pizza"],
    rent: ["rent", "landlord"],
    health: ["hospital", "clinic", "chemist", "pharmacy"],
    shopping: ["shop", "jumia", "mall"],
    mmf: ["mmf", "investment", "saving"],
  }

  for (const category of categories) {
    const keywords = keywordMap[category.id] ?? []
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category.id
    }
  }

  const nameMatch = categories.find((category) => normalized.includes(category.name.toLowerCase()))
  return nameMatch?.id ?? categories[0]?.id ?? ""
}

export interface CategoryMonthSummary {
  categoryId: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  category?: SpendingCategory
}

export interface MonthSummary {
  month: string
  totalBudgeted: number
  totalSpent: number
  remaining: number
  categories: CategoryMonthSummary[]
}

export function buildMonthSummary(categories: SpendingCategory[], transactions: Transaction[], month: string): MonthSummary {
  const activeCategories = categories.filter((category) => !category.isArchived)
  const monthTransactions = transactions.filter((transaction) => isDateInMonth(transaction.date, month))

  const categorySummaries = activeCategories
    .map((category) => {
      const spent = monthTransactions
        .filter((transaction) => transaction.categoryId === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      const budgeted = category.monthlyBudget
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0

      return {
        categoryId: category.id,
        budgeted,
        spent,
        remaining: budgeted - spent,
        percentage,
        category,
      }
    })
    .sort((left, right) => right.spent - left.spent)

  const totalBudgeted = categorySummaries.reduce((sum, category) => sum + category.budgeted, 0)
  const totalSpent = categorySummaries.reduce((sum, category) => sum + category.spent, 0)

  return {
    month,
    totalBudgeted,
    totalSpent,
    remaining: totalBudgeted - totalSpent,
    categories: categorySummaries,
  }
}
