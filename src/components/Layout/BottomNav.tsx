import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import {
  ArrowRightLeft,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Settings2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

const navItems: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: PiggyBank },
  { id: "transactions", label: "Activity", icon: ArrowRightLeft },
  { id: "bills", label: "Bills", icon: CreditCard },
  { id: "projections", label: "Forecast", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings2 },
]

interface BottomNavProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
