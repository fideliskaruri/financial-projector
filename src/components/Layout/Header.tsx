import { Button } from "@/components/ui/button"
import type { AppTab } from "@/types/navigation"
import { Download, Moon, RotateCcw, Share2, Sun } from "lucide-react"

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
  darkMode: boolean
  onExport: () => void
  onReset: () => void
  onShare: () => void
  onToggleDarkMode: () => void
}

export default function Header({ activeTab, darkMode, onExport, onReset, onShare, onToggleDarkMode }: HeaderProps) {
  const showProjectionActions = activeTab === "projections" || activeTab === "settings"

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6 lg:pl-60 lg:pr-8">
        <h1 className="text-sm font-medium text-foreground">{pageTitles[activeTab]}</h1>
        <div className="flex items-center gap-1">
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
          <Button type="button" variant="ghost" size="icon" onClick={onToggleDarkMode} aria-label="Toggle theme">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}