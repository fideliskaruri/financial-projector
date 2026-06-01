import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import {
  ArrowRightLeft,
  CreditCard,
  Ellipsis,
  LayoutDashboard,
  PiggyBank,
  Settings2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"

type BottomNavItem = {
  id: AppTab | "more"
  icon: LucideIcon
  label: string
}

const navItems: BottomNavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "budget", icon: PiggyBank, label: "Budget" },
  { id: "transactions", icon: ArrowRightLeft, label: "Transactions" },
  { id: "bills", icon: CreditCard, label: "Bills" },
  { id: "more", icon: Ellipsis, label: "More" },
]

const moreItems: { id: AppTab; icon: LucideIcon; label: string }[] = [
  { id: "projections", icon: TrendingUp, label: "Projections" },
  { id: "settings", icon: Settings2, label: "Settings" },
]

interface BottomNavProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = activeTab === "projections" || activeTab === "settings"

  return (
    <>
      {moreOpen ? <button type="button" aria-label="Close more menu" className="fixed inset-0 z-30 bg-transparent lg:hidden" onClick={() => setMoreOpen(false)} /> : null}

      {moreOpen ? (
        <div className="fixed inset-x-4 bottom-[calc(64px+0.75rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-border/70 bg-background/95 p-1.5 shadow-2xl shadow-black/10 backdrop-blur-sm lg:hidden">
          {moreItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  onSelectTab(item.id)
                }}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5]")} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 shadow-[0_-6px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:hidden dark:shadow-[0_-8px_20px_rgba(0,0,0,0.35)]">
        <div className="flex items-center px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === "more" ? moreActive : activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  if (item.id === "more") {
                    setMoreOpen((open) => !open)
                    return
                  }

                  setMoreOpen(false)
                  onSelectTab(item.id)
                }}
                className={cn(
                  "flex h-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors",
                  isActive && "font-semibold text-foreground",
                )}
              >
                <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
