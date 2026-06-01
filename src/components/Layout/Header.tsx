import { Button } from "@/components/ui/button"
import type { AppTab } from "@/types/navigation"
import type { User } from "firebase/auth"
import { Download, Eye, EyeOff, LogOut, Moon, Plus, RotateCcw, Share2, Sun } from "lucide-react"

const pageTitles: Record<AppTab, string> = {
  dashboard: "Dashboard",
  budget: "Budget",
  transactions: "Transactions",
  bills: "Bills",
  projections: "Projections",
  settings: "Settings",
}

interface HeaderProps {
  activeTab: AppTab
  balanceHidden: boolean
  darkMode: boolean
  onAdd: () => void
  onExport: () => void
  onLogout: () => Promise<void>
  onReset: () => void
  onShare: () => void
  onToggleBalanceHidden: () => void
  onToggleDarkMode: () => void
  user: User | null
}

function getUserLabel(user: User) {
  return user.displayName ?? user.email ?? "Signed in user"
}

function getUserInitial(user: User) {
  return getUserLabel(user).trim().charAt(0).toUpperCase() || "F"
}

export default function Header({ activeTab, balanceHidden, darkMode, onAdd, onExport, onLogout, onReset, onShare, onToggleBalanceHidden, onToggleDarkMode, user }: HeaderProps) {
  const showProjectionActions = activeTab === "projections" || activeTab === "settings"
  const showAddButton = activeTab === "dashboard" || activeTab === "budget" || activeTab === "transactions"
  const userLabel = user ? getUserLabel(user) : "Guest"

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between gap-3 px-4 sm:px-6 lg:pl-60 lg:pr-8">
        <h1 className="truncate text-sm font-medium text-foreground">{pageTitles[activeTab]}</h1>
        <div className="flex items-center gap-1">
          {showAddButton ? (
            <Button type="button" size="sm" onClick={onAdd} className="mr-1 gap-1.5 rounded-full px-3" aria-label="Add transaction" title="Add transaction">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          ) : null}
          {showProjectionActions ? (
            <>
              <Button type="button" variant="ghost" size="icon" onClick={onReset} aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={onShare} aria-label="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={onExport} aria-label="Export">
                <Download className="h-4 w-4" />
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleBalanceHidden}
            aria-label={balanceHidden ? "Show balances" : "Hide balances"}
            title={balanceHidden ? "Show balances" : "Hide balances"}
          >
            {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onToggleDarkMode} aria-label="Toggle theme">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={userLabel}
                  title={userLabel}
                  className="ml-1 h-7 w-7 rounded-full border border-border/70 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  title={userLabel}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-secondary text-[11px] font-semibold text-foreground"
                >
                  {getUserInitial(user)}
                </div>
              )}
              <Button type="button" variant="ghost" size="icon" onClick={() => void onLogout()} aria-label="Logout" title={userLabel}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
