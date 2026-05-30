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

interface SidebarContentProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

function SidebarContent({ activeTab, onSelectTab }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center justify-between px-2 py-3">
        <span className="text-base font-bold tracking-tight">FinManager</span>
      </div>

      <nav className="mt-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id)
              }}
              className={cn(
                "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                isActive ? "bg-primary/8 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {isActive ? <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" /> : null}
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

interface SidebarProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
}

export default function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 border-r bg-card lg:block">
      <SidebarContent activeTab={activeTab} onSelectTab={onSelectTab} />
    </aside>
  )
}
