import BillsOverview from "@/components/Bills/BillsOverview"
import BudgetOverview from "@/components/Budget/BudgetOverview"
import BottomNav from "@/components/Layout/BottomNav"
import Header from "@/components/Layout/Header"
import Sidebar from "@/components/Layout/Sidebar"
import MilestoneMarkers from "@/components/Results/MilestoneMarkers"
import SummaryCards from "@/components/Results/SummaryCards"
import TransactionList from "@/components/Transactions/TransactionList"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_INPUTS } from "@/data/defaults"
import type { AllInputs } from "@/engine/types"
import { useMonthSummary } from "@/hooks/useBudget"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useProjection } from "@/hooks/useProjection"
import { formatKES, getMonthId } from "@/lib/finance"
import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import { decodeInputsFromUrl, encodeInputsToUrl } from "@/utils/urlEncoding"
import { motion } from "motion/react"
import { lazy, Suspense, useEffect, useRef } from "react"
import { toast } from "sonner"

const BalanceChart = lazy(() => import("@/components/Results/BalanceChart"))
const ProjectionTable = lazy(() => import("@/components/Results/ProjectionTable"))
const InflowBreakdownChart = lazy(() => import("@/components/Results/InflowBreakdownChart"))
const ScenarioManager = lazy(() => import("@/components/Scenarios/ScenarioManager"))
const FixedParamsForm = lazy(() => import("@/components/InputForm/FixedParamsForm"))
const OnHireVestsForm = lazy(() => import("@/components/InputForm/OnHireVestsForm"))
const OneTimeEventsForm = lazy(() => import("@/components/InputForm/OneTimeEventsForm"))
const ProjectionRangeForm = lazy(() => import("@/components/InputForm/ProjectionRangeForm"))
const RecurringInflowsForm = lazy(() => import("@/components/InputForm/RecurringInflowsForm"))
const SpendingScheduleForm = lazy(() => import("@/components/InputForm/SpendingScheduleForm"))
const StockBonusForm = lazy(() => import("@/components/InputForm/StockBonusForm"))

const suspenseFallback = <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
const balanceChartFallback = <div className="h-[300px] animate-pulse rounded-lg bg-secondary lg:h-[360px]" />
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
  const sharedScenarioLoadedRef = useRef(false)

  const activeTab = normalizeTab(storedActiveTab)
  const monthSummary = useMonthSummary(getMonthId(new Date()))
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

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <div className="min-h-[100dvh] overflow-x-hidden">
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          onExport={handleExport}
          onReset={handleReset}
          onShare={handleShare}
          onToggleDarkMode={() => {
            setDarkMode((value) => {
              const next = !value
              toast.info(next ? "Dark mode enabled" : "Light mode enabled")
              return next
            })
          }}
        />
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="overscroll-y-contain px-4 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pl-60 lg:pb-0">
          <>
            {activeTab === "dashboard" ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }} className="space-y-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Projected Balance · {finalRow?.dateStr ?? ""}</p>
                  <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight lg:text-5xl">{currency.format(finalRow?.endBalance ?? 0)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">
                      Interest <span className="font-medium tabular-nums text-foreground">{currency.format(projection.rows.reduce((sum, row) => sum + row.interest, 0))}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Growth <span className="font-medium tabular-nums text-success">{growthPercent.toFixed(0)}%</span>
                    </span>
                    {(monthSummary?.totalBudgeted ?? 0) > 0 ? (
                      <span className="text-muted-foreground">
                        Budget used{" "}
                        <span
                          className={cn(
                            "font-medium tabular-nums",
                            (monthSummary?.totalSpent ?? 0) > (monthSummary?.totalBudgeted ?? 0) ? "text-destructive" : "text-foreground",
                          )}
                        >
                          {Math.round(((monthSummary?.totalSpent ?? 0) / (monthSummary?.totalBudgeted ?? 1)) * 100)}%
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>
                <Suspense fallback={balanceChartFallback}>
                  <BalanceChart rows={projection.rows} milestones={projection.milestones} />
                </Suspense>
                <div className="grid gap-4 xl:grid-cols-2">
                  <MilestoneMarkers milestones={projection.milestones} />
                  <SummaryCards yearlySummaries={projection.yearlySummaries} />
                </div>
              </motion.div>
            ) : null}

            {activeTab === "budget" ? (
              <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                <BudgetOverview />
              </motion.div>
            ) : null}

            {activeTab === "transactions" ? (
              <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                <TransactionList />
              </motion.div>
            ) : null}

            {activeTab === "bills" ? (
              <motion.div key="bills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                <BillsOverview />
              </motion.div>
            ) : null}

            {activeTab === "projections" ? (
              <motion.div key="projections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }} className="space-y-4">
                <Suspense fallback={suspenseFallback}>
                  <ScenarioManager inputs={inputs} onLoadScenario={(loadedInputs) => setInputs(loadedInputs)} onOpenSettings={() => setActiveTab("settings")} />
                  <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-[1.1fr,0.9fr]">
                    <ProjectionTable rows={projection.rows} />
                    <InflowBreakdownChart rows={projection.rows} />
                  </div>
                </Suspense>
              </motion.div>
            ) : null}

            {activeTab === "settings" ? (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }} className="space-y-4">
                <Suspense fallback={suspenseFallback}>
                  <Card className="border bg-card">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <CardTitle>Projection spending</CardTitle>
                      <Badge variant={(monthSummary?.totalSpent ?? 0) > inputs.params.monthlySpending ? "warning" : "success"}>
                        Actual this month: {formatKES(monthSummary?.totalSpent ?? 0)} / {formatKES(inputs.params.monthlySpending)}
                      </Badge>
                    </CardHeader>
                  </Card>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <FixedParamsForm params={inputs.params} onChange={(params) => setInputs((current) => ({ ...current, params }))} />
                    <ProjectionRangeForm
                      startDate={inputs.params.startDate}
                      endDate={inputs.params.endDate}
                      onChange={({ startDate, endDate }) => setInputs((current) => ({ ...current, params: { ...current.params, startDate, endDate } }))}
                    />
                  </div>
                  <RecurringInflowsForm inflows={inputs.recurringInflows} onChange={(recurringInflows) => setInputs((current) => ({ ...current, recurringInflows }))} />
                  <div className="grid gap-4 xl:grid-cols-2">
                    <OnHireVestsForm vests={inputs.onHireVests} onChange={(onHireVests) => setInputs((current) => ({ ...current, onHireVests }))} />
                    <StockBonusForm stockGrants={inputs.stockGrants} onChange={(stockGrants) => setInputs((current) => ({ ...current, stockGrants }))} />
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-[1.1fr,0.9fr]">
                    <OneTimeEventsForm events={inputs.oneTimeEvents} onChange={(oneTimeEvents) => setInputs((current) => ({ ...current, oneTimeEvents }))} />
                    <SpendingScheduleForm overrides={inputs.spendingOverrides} onChange={(spendingOverrides) => setInputs((current) => ({ ...current, spendingOverrides }))} />
                  </div>
                </Suspense>
              </motion.div>
            ) : null}
          </>
        </main>
      </div>
    </div>
  )
}