import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "motion/react"
import { Download, Moon, RotateCcw, Sun } from "lucide-react"

type AppTab = "overview" | "table" | "scenarios" | "settings"

const tabItems: { id: AppTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "table", label: "Table" },
  { id: "scenarios", label: "Scenarios" },
  { id: "settings", label: "Settings" },
]

interface HeaderProps {
  activeTab: AppTab
  darkMode: boolean
  onExport: () => void
  onReset: () => void
  onToggleDarkMode: () => void
  onTabChange: (tab: AppTab) => void
}

export default function Header({ activeTab, darkMode, onExport, onReset, onToggleDarkMode, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="px-4 pb-4 pt-4 sm:px-6 lg:px-8 lg:pl-80">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2 pl-14 lg:pl-0">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Spark design system</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Financial Projector</h1>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-sm text-muted-foreground"
                  >
                    {tabItems.find((item) => item.id === activeTab)?.label}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">Track salary, equity, bonuses, and major events in a cleaner dashboard workflow.</p>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={onToggleDarkMode} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as AppTab)} className="mt-4 pl-14 lg:pl-0">
          <TabsList className="h-auto flex-wrap gap-1 rounded-xl border border-border/70 bg-card/80 p-1">
            {tabItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="rounded-lg px-4 py-2">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </header>
  )
}
