import BudgetOverview from "@/components/Budget/BudgetOverview"
import BillsOverview from "@/components/Bills/BillsOverview"
import BudgetMiniCard from "@/components/Dashboard/BudgetMiniCard"
import UpcomingBillsCard from "@/components/Dashboard/UpcomingBillsCard"
import FixedParamsForm from "@/components/InputForm/FixedParamsForm"
import OnHireVestsForm from "@/components/InputForm/OnHireVestsForm"
import OneTimeEventsForm from "@/components/InputForm/OneTimeEventsForm"
import ProjectionRangeForm from "@/components/InputForm/ProjectionRangeForm"
import RecurringInflowsForm from "@/components/InputForm/RecurringInflowsForm"
import SpendingScheduleForm from "@/components/InputForm/SpendingScheduleForm"
import StockBonusForm from "@/components/InputForm/StockBonusForm"
import Header from "@/components/Layout/Header"
import MetricCard from "@/components/Layout/MetricCard"
import Sidebar from "@/components/Layout/Sidebar"
import BalanceChart from "@/components/Results/BalanceChart"
import InflowBreakdownChart from "@/components/Results/InflowBreakdownChart"
import MilestoneMarkers from "@/components/Results/MilestoneMarkers"
import ProjectionTable from "@/components/Results/ProjectionTable"
import SummaryCards from "@/components/Results/SummaryCards"
import ScenarioManager from "@/components/Scenarios/ScenarioManager"
import TransactionList from "@/components/Transactions/TransactionList"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_INPUTS, monthYearToString } from "@/data/defaults"
import type { AllInputs } from "@/engine/types"
import { useBills, useCategories, useMonthSummary } from "@/hooks/useBudget"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useProjection } from "@/hooks/useProjection"
import { formatKES, getMonthId } from "@/lib/finance"
import type { AppTab } from "@/types/navigation"
import { decodeInputsFromUrl, encodeInputsToUrl } from "@/utils/urlEncoding"
import { AnimatePresence, motion } from "motion/react"
import { CalendarClock, PiggyBank, TrendingUp, Wallet } from "lucide-react"
import { useEffect, useRef, useState, type ComponentProps } from "react"
import { toast } from "sonner"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })
const validTabs: AppTab[] = ["dashboard", "budget", "transactions", "bills", "projections", "settings"]

function cloneInputs(value: AllInputs): AllInputs {
  return JSON.parse(JSON.stringify(value)) as AllInputs
}

function normalizeTab(value: string): AppTab {
  if (validTabs.includes(value as AppTab)) {
    return value as AppTab
  }

  if (value === "overview") {
    return "dashboard"
  }

  if (value === "table" || value === "scenarios") {
    return "projections"
  }

  return "dashboard"
}

export default function App() {
  const [inputs, setInputs] = useLocalStorage<AllInputs>("financial-projector-inputs", cloneInputs(DEFAULT_INPUTS))
  const [storedActiveTab, setStoredActiveTab] = useLocalStorage<string>("financial-projector-active-tab", "dashboard")
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("financial-projector-dark-mode", true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const sharedScenarioLoadedRef = useRef(false)

  const activeTab = normalizeTab(storedActiveTab)
  const currentMonth = getMonthId(new Date())
  const categories = useCategories()
  const bills = useBills()
  const monthSummary = useMonthSummary(currentMonth)
  const projection = useProjection(inputs)

  useEffect(() => {
    if (storedActiveTab !== activeTab) {
      setStoredActiveTab(activeTab)
    }
  }, [activeTab, setStoredActiveTab, storedActiveTab])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light"
  }, [darkMode])

  useEffect(() => {
    if (sharedScenarioLoadedRef.current) {
      return
    }

    sharedScenarioLoadedRef.current = true

    const decodedInputs = decodeInputsFromUrl(window.location.hash)

    if (decodedInputs) {
      setInputs(decodedInputs)
      toast.success("Loaded shared scenario")
    }
  }, [setInputs])

  const finalRow = projection.rows.at(-1)
  const totalInterest = projection.rows.reduce((sum, row) => sum + row.interest, 0)
  const savingsRate = inputs.params.netSalary > 0 ? ((inputs.params.netSalary - inputs.params.monthlySpending) / inputs.params.netSalary) * 100 : 0
  const nextMilestone = projection.milestones.find((milestone) => milestone.reachedDate)
  const growthPercent = inputs.params.startingBalance > 0 && finalRow ? ((finalRow.endBalance - inputs.params.startingBalance) / inputs.params.startingBalance) * 100 : 0

  const handleReset = () => {
    setInputs(cloneInputs(DEFAULT_INPUTS))
    toast.success("Inputs reset to default assumptions")
  }

  const handleExport = () => {
    const csv = [
      ["Month", "Opening Balance", "Inflows", "Spending", "Interest", "Closing Balance"].join(","),
      ...projection.rows.map((row) => [row.dateStr, row.startBalance, row.totalInflows, row.spending, row.interest, row.endBalance].join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "financial-projection.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Projection exported as CSV")
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${encodeInputsToUrl(inputs)}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard")
    } catch {
      const fallbackInput = document.createElement("input")
      fallbackInput.value = shareUrl
      document.body.appendChild(fallbackInput)
      fallbackInput.select()
      document.execCommand("copy")
      document.body.removeChild(fallbackInput)
      toast.success("Link copied to clipboard")
    }
  }

  const setActiveTab = (tab: AppTab) => setStoredActiveTab(tab)

  const metricCards: ComponentProps<typeof MetricCard>[] = [
    {
      label: "End Balance",
      value: currency.format(finalRow?.endBalance ?? 0),
      icon: Wallet,
      trend: { value: `${growthPercent.toFixed(0)}% growth`, direction: growthPercent >= 0 ? "up" : "down" },
    },
    {
      label: "Total Interest",
      value: currency.format(totalInterest),
      icon: TrendingUp,
      trend: { value: `${((totalInterest / Math.max(finalRow?.endBalance ?? 1, 1)) * 100).toFixed(1)}% of end`, direction: "up" },
    },
    {
      label: "Next Milestone",
      value: nextMilestone?.reachedDate ? monthYearToString(nextMilestone.reachedDate) : "—",
      icon: CalendarClock,
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(0)}%`,
      icon: PiggyBank,
      trend: { value: `${currency.format(inputs.params.netSalary - inputs.params.monthlySpending)}/mo`, direction: savingsRate >= 0 ? "up" : "down" },
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        activeTab={activeTab}
        mobileOpen={mobileSidebarOpen}
        onOpenMobile={() => setMobileSidebarOpen(true)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          setMobileSidebarOpen(false)
        }}
      />

      <div className="min-h-screen">
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          onExport={handleExport}
          onReset={handleReset}
          onShare={handleShare}
          onToggleDarkMode={() => {
            setDarkMode((value) => !value)
            toast.info(darkMode ? "Light mode enabled" : "Dark mode enabled")
          }}
          onTabChange={setActiveTab}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:pl-80">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" ? (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }} className="space-y-6">
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {metricCards.map((metric) => (
                    <motion.div key={metric.label} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
                      <MetricCard {...metric} />
                    </motion.div>
                  ))}
                  <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
                    <BudgetMiniCard summary={monthSummary} />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
                    <UpcomingBillsCard bills={bills} categories={categories} />
                  </motion.div>
                </motion.div>
                <BalanceChart rows={projection.rows} milestones={projection.milestones} />
                <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
                  <MilestoneMarkers milestones={projection.milestones} />
                  <SummaryCards yearlySummaries={projection.yearlySummaries} />
                </div>
              </motion.div>
            ) : null}

            {activeTab === "budget" ? (
              <motion.div key="budget" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
                <BudgetOverview />
              </motion.div>
            ) : null}

            {activeTab === "transactions" ? (
              <motion.div key="transactions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
                <TransactionList />
              </motion.div>
            ) : null}

            {activeTab === "bills" ? (
              <motion.div key="bills" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
                <BillsOverview />
              </motion.div>
            ) : null}

            {activeTab === "projections" ? (
              <motion.div key="projections" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }} className="space-y-6">
                <ScenarioManager inputs={inputs} onLoadScenario={(loadedInputs) => setInputs(loadedInputs)} onOpenSettings={() => setActiveTab("settings")} />
                <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                  <ProjectionTable rows={projection.rows} />
                  <InflowBreakdownChart rows={projection.rows} />
                </div>
              </motion.div>
            ) : null}

            {activeTab === "settings" ? (
              <motion.div key="settings" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }} className="space-y-6">
                <Card className="border-border/70 bg-card/85">
                  <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>Projection spending</CardTitle>
                    </div>
                    <Badge variant={(monthSummary?.totalSpent ?? 0) > inputs.params.monthlySpending ? "warning" : "success"}>
                      Actual spending this month: {formatKES(monthSummary?.totalSpent ?? 0)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monthly spending in projections: {formatKES(inputs.params.monthlySpending)} (configured manually)
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                  <FixedParamsForm params={inputs.params} onChange={(params) => setInputs((current) => ({ ...current, params }))} />
                  <ProjectionRangeForm
                    startDate={inputs.params.startDate}
                    endDate={inputs.params.endDate}
                    onChange={({ startDate, endDate }) => setInputs((current) => ({ ...current, params: { ...current.params, startDate, endDate } }))}
                  />
                </div>
                <RecurringInflowsForm inflows={inputs.recurringInflows} onChange={(recurringInflows) => setInputs((current) => ({ ...current, recurringInflows }))} />
                <div className="grid gap-6 xl:grid-cols-2">
                  <OnHireVestsForm vests={inputs.onHireVests} onChange={(onHireVests) => setInputs((current) => ({ ...current, onHireVests }))} />
                  <StockBonusForm stockGrants={inputs.stockGrants} onChange={(stockGrants) => setInputs((current) => ({ ...current, stockGrants }))} />
                </div>
                <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                  <OneTimeEventsForm events={inputs.oneTimeEvents} onChange={(oneTimeEvents) => setInputs((current) => ({ ...current, oneTimeEvents }))} />
                  <SpendingScheduleForm overrides={inputs.spendingOverrides} onChange={(spendingOverrides) => setInputs((current) => ({ ...current, spendingOverrides }))} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
