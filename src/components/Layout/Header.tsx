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
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="flex h-12 items-center justify-between gap-3 px-4 sm:px-6 lg:pl-60 lg:pr-8">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium tracking-tight">{pageTitles[activeTab]}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showProjectionActions ? (
            <>
              <Button type="button" variant="outline" className="h-9 w-9 px-0 sm:w-auto sm:px-3" onClick={onReset} aria-label="Reset assumptions">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              <Button type="button" variant="outline" className="h-9 w-9 px-0 sm:w-auto sm:px-3" onClick={onShare} aria-label="Share scenario">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button type="button" variant="secondary" className="h-9 w-9 px-0 sm:w-auto sm:px-3" onClick={onExport} aria-label="Export CSV">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          ) : null}
          <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={onToggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}