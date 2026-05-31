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

const navItems: { id: AppTab; icon: LucideIcon }[] = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "budget", icon: PiggyBank },
  { id: "transactions", icon: ArrowRightLeft },
  { id: "bills", icon: CreditCard },
  { id: "projections", icon: TrendingUp },
  { id: "settings", icon: Settings2 },
]

interface BottomNavProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-background/80 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              {isActive ? <span className="h-1 w-1 rounded-full bg-foreground" /> : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
