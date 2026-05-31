import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import { ArrowRightLeft, CreditCard, LayoutDashboard, PiggyBank, Settings2, TrendingUp, type LucideIcon } from "lucide-react"

type NavItem = {
  id: AppTab
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: PiggyBank },
  { id: "transactions", label: "Transactions", icon: ArrowRightLeft },
  { id: "bills", label: "Bills", icon: CreditCard },
  { id: "projections", label: "Projections", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings2 },
]

interface SidebarProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

export default function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 border-r border-border/50 bg-background lg:flex lg:flex-col">
      <div className="px-4 py-5">
        <span className="text-sm font-semibold tracking-tight">FinManager</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
                isActive
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
