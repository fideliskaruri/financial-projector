import type { SpendingCategory } from "@/db/database"

export const DEFAULT_CATEGORIES: SpendingCategory[] = [
  { id: "rent", name: "Rent", icon: "Home", color: "#6366f1", monthlyBudget: 35000, type: "need", isArchived: false },
  { id: "groceries", name: "Groceries", icon: "ShoppingCart", color: "#22c55e", monthlyBudget: 25000, type: "need", isArchived: false },
  { id: "transport", name: "Transport & Fuel", icon: "Car", color: "#f59e0b", monthlyBudget: 15000, type: "need", isArchived: false },
  { id: "utilities", name: "Utilities", icon: "Zap", color: "#06b6d4", monthlyBudget: 8000, type: "need", isArchived: false },
  { id: "health", name: "Health", icon: "Heart", color: "#ef4444", monthlyBudget: 5000, type: "need", isArchived: false },
  { id: "eating-out", name: "Eating Out", icon: "Utensils", color: "#f97316", monthlyBudget: 15000, type: "want", isArchived: false },
  { id: "entertainment", name: "Entertainment", icon: "Film", color: "#a855f7", monthlyBudget: 10000, type: "want", isArchived: false },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "#ec4899", monthlyBudget: 12000, type: "want", isArchived: false },
  { id: "subscriptions", name: "Subscriptions", icon: "CreditCard", color: "#8b5cf6", monthlyBudget: 5000, type: "want", isArchived: false },
  { id: "mmf", name: "MMF Savings", icon: "PiggyBank", color: "#10b981", monthlyBudget: 35000, type: "savings", isArchived: false },
]
