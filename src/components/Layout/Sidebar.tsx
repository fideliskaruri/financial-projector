import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRightLeft,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Menu,
  PiggyBank,
  Settings2,
  Sparkles,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  id: AppTab
  label: string
  description: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Overview", icon: LayoutDashboard },
  { id: "budget", label: "Budget", description: "Monthly plan", icon: PiggyBank },
  { id: "transactions", label: "Transactions", description: "Spending log", icon: ArrowRightLeft },
  { id: "bills", label: "Bills", description: "Recurring dues", icon: CreditCard },
  { id: "projections", label: "Projections", description: "Future cashflow", icon: TrendingUp },
  { id: "settings", label: "Settings", description: "Projection inputs", icon: Settings2 },
]

interface SidebarContentProps {
  activeTab: AppTab
  onSelectTab: (tab: AppTab) => void
  onClose?: () => void
}

function SidebarContent({ activeTab, onSelectTab, onClose }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Finance Hub</p>
            <p className="text-xs text-muted-foreground">Financial Projector</p>
          </div>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <Card className="border-border/70 bg-background/70 backdrop-blur">
        <CardContent className="space-y-2 p-3">
          <Badge variant="secondary" className="w-fit">
            Personal finance
          </Badge>
          <p className="text-sm font-medium">Budget, transactions, bills, and projections in one place.</p>
        </CardContent>
      </Card>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id)
                onClose?.()
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                isActive ? "border-primary/30 bg-primary/10 text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <div className={cn("mt-0.5 rounded-lg p-2", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto hidden lg:block space-y-2">
        <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => onSelectTab("projections")}>
          <CalendarRange className="h-4 w-4" />
          Open projections
        </Button>
        <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => onSelectTab("settings")}>
          <Menu className="h-4 w-4" />
          Adjust assumptions
        </Button>
      </div>
    </div>
  )
}

interface SidebarProps {
  activeTab: AppTab
  mobileOpen: boolean
  onOpenMobile: () => void
  onCloseMobile: () => void
  onSelectTab: (tab: AppTab) => void
}

export default function Sidebar({ activeTab, mobileOpen, onOpenMobile, onCloseMobile, onSelectTab }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border/70 bg-card/95 backdrop-blur lg:block">
        <SidebarContent activeTab={activeTab} onSelectTab={onSelectTab} />
      </aside>

      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <Button type="button" variant="outline" size="icon" className="shadow-sm" onClick={onOpenMobile}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-72 border-r border-border/70 bg-card shadow-xl lg:hidden"
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SidebarContent activeTab={activeTab} onSelectTab={onSelectTab} onClose={onCloseMobile} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
