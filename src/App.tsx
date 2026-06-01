import LoginScreen from "@/components/Auth/LoginScreen"
import BillsOverview from "@/components/Bills/BillsOverview"
import BudgetOverview from "@/components/Budget/BudgetOverview"
import ErrorBoundary from "@/components/ErrorBoundary"
import BottomNav from "@/components/Layout/BottomNav"
import Header from "@/components/Layout/Header"
import Sidebar from "@/components/Layout/Sidebar"
import MilestoneMarkers from "@/components/Results/MilestoneMarkers"
import SummaryCards from "@/components/Results/SummaryCards"
import TransactionList from "@/components/Transactions/TransactionList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PrivacyContext } from "@/contexts/PrivacyContext"
import { DEFAULT_INPUTS } from "@/data/defaults"
import type { AllInputs } from "@/engine/types"
import { useActualSpendingDetails } from "@/hooks/useActualSpending"
import { useAuth } from "@/hooks/useAuth"
import { useMonthSummary } from "@/hooks/useBudget"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useProjection } from "@/hooks/useProjection"
import { formatKES, getMonthId } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import type { AppTab } from "@/types/navigation"
import { decodeInputsFromUrl, encodeInputsToUrl } from "@/utils/urlEncoding"
import { BarChart3, Download, Eye, EyeOff, LoaderCircle, Plus } from "lucide-react"
import { lazy, Suspense, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"

const BalanceChart = lazy(() => import("@/components/Results/BalanceChart"))
const ProjectionTable = lazy(() => import("@/components/Results/ProjectionTable"))
const InflowBreakdownChart = lazy(() => import("@/components/Results/InflowBreakdownChart"))
const ScenarioManager = lazy(() => import("@/components/Scenarios/ScenarioManager"))
const SettingsPage = lazy(() => import("@/components/Settings/SettingsPage"))

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })
const actualSpendingWindowMonths = 3
const validTabs: AppTab[] = ["dashboard", "budget", "transactions", "bills", "projections", "settings"]

function cloneInputs(value: AllInputs): AllInputs {
  return JSON.parse(JSON.stringify(value)) as AllInputs
}

function isValidTab(value: unknown): value is AppTab {
  return typeof value === "string" && validTabs.includes(value as AppTab)
}

function normalizeTab(value: unknown): AppTab {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""

  if (isValidTab(normalized)) {
    return normalized
  }

  if (normalized === "overview") {
    return "dashboard"
  }

  if (normalized === "table" || normalized === "scenarios") {
    return "projections"
  }

  return "dashboard"
}

function TabContentSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-12rem)] space-y-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-secondary" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-2xl border bg-card" />
          <div className="h-28 rounded-2xl border bg-card" />
          <div className="h-28 rounded-2xl border bg-card" />
        </div>
        <div className="h-[45dvh] rounded-2xl border bg-card" />
      </div>
    </div>
  )
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-5 py-4 shadow-xl shadow-black/10">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading your workspace…</span>
      </div>
    </div>
  )
}

const suspenseFallback = <TabContentSkeleton />
const balanceChartFallback = (
  <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:rounded-xl sm:border sm:bg-card sm:p-4">
    <div className="h-[180px] animate-pulse rounded-xl bg-secondary sm:h-[300px] lg:h-[360px]" />
  </div>
)

export default function App() {
  const [inputs, setInputs] = useLocalStorage<AllInputs>("financial-projector-inputs", cloneInputs(DEFAULT_INPUTS))
  const [storedActiveTab, setStoredActiveTab] = useLocalStorage<string>("financial-projector-active-tab", "dashboard")
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("financial-projector-dark-mode", true)
  const [dataMode, setDataMode] = useLocalStorage<"actual" | "simulation">("financial-projector-data-mode", "simulation")
  const [balanceHidden, setBalanceHidden] = useLocalStorage<boolean>("financial-projector-hide-balance", false)
  const { user, loading, authError, signInWithGitHub, logout } = useAuth()
  const sharedScenarioLoadedRef = useRef(false)

  const activeTab = normalizeTab(storedActiveTab)
  const monthSummary = useMonthSummary(getMonthId(new Date()))
  const actualSpending = useActualSpendingDetails(actualSpendingWindowMonths)
  const effectiveMonthlySpending = dataMode === "actual" ? actualSpending.value ?? inputs.params.monthlySpending : inputs.params.monthlySpending
  const projectionInputs = useMemo(
    () =>
      dataMode === "actual" && effectiveMonthlySpending !== inputs.params.monthlySpending
        ? { ...inputs, params: { ...inputs.params, monthlySpending: effectiveMonthlySpending } }
        : inputs,
    [dataMode, effectiveMonthlySpending, inputs],
  )
  const projection = useProjection(projectionInputs)

  useEffect(() => {
    const normalizedStoredTab = normalizeTab(storedActiveTab)
    if (!storedActiveTab || storedActiveTab !== normalizedStoredTab) {
      setStoredActiveTab(normalizedStoredTab)
    }
  }, [setStoredActiveTab, storedActiveTab])

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
  const growthPercent =
    projectionInputs.params.startingBalance > 0 && finalRow
      ? ((finalRow.endBalance - projectionInputs.params.startingBalance) / projectionInputs.params.startingBalance) * 100
      : 0
  const dashboardModeLabel =
    dataMode === "actual"
      ? actualSpending.source === "transactions"
        ? "Using actual spending"
        : actualSpending.source === "budget"
          ? "Using budget totals"
          : "Using simulation value"
      : "Simulation mode"
  const actualSpendingValueLabel = actualSpending.value !== undefined ? maskAmount(formatKES(actualSpending.value), balanceHidden) : undefined
  const actualSpendingHint =
    dataMode === "actual"
      ? actualSpending.source === "transactions" && actualSpendingValueLabel
        ? `Based on your last ${actualSpendingWindowMonths} months: ${actualSpendingValueLabel}`
        : actualSpending.source === "budget" && actualSpendingValueLabel
          ? `No spending data yet, using budget totals: ${actualSpendingValueLabel}`
          : "No spending data yet, using your simulation value."
      : undefined

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

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user && !authError) {
    return <LoginScreen onSignIn={signInWithGitHub} />
  }

  return (
    <PrivacyContext.Provider value={{ balanceHidden }}>
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="min-h-[100dvh] overflow-x-hidden">
          <Header
            activeTab={activeTab}
            balanceHidden={balanceHidden}
            darkMode={darkMode}
            onExport={handleExport}
            onLogout={logout}
            onReset={handleReset}
            onShare={handleShare}
            onToggleBalanceHidden={() => {
              setBalanceHidden((value) => {
                const next = !value
                toast.info(next ? "Balances hidden" : "Balances visible")
                return next
              })
            }}
            onToggleDarkMode={() => {
              setDarkMode((value) => {
                const next = !value
                toast.info(next ? "Dark mode enabled" : "Light mode enabled")
                return next
              })
            }}
            user={user}
          />
          <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

          <main className="overscroll-y-contain px-4 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pl-60 lg:pb-0">
            <ErrorBoundary key={activeTab} onRetry={() => window.location.reload()}>
              {activeTab === "dashboard" ? (
                <div className="space-y-3 lg:space-y-6">
                  <div className="space-y-3 lg:hidden">
                    <div className="space-y-2 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{finalRow?.dateStr ?? ""}</p>
                      <p className="text-4xl font-bold tabular-nums tracking-tight">{maskAmount(currency.format(finalRow?.endBalance ?? 0), balanceHidden)}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Button type="button" variant="ghost" className="flex h-14 min-w-0 flex-col gap-1 rounded-xl px-2" onClick={() => setActiveTab("transactions")}>
                        <Plus className="h-4 w-4" />
                        <span className="text-[11px]">Add</span>
                      </Button>
                      <Button type="button" variant="ghost" className="flex h-14 min-w-0 flex-col gap-1 rounded-xl px-2" onClick={() => setActiveTab("projections")}>
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-[11px]">Charts</span>
                      </Button>
                      <Button type="button" variant="ghost" className="flex h-14 min-w-0 flex-col gap-1 rounded-xl px-2" onClick={() => setBalanceHidden((v) => !v)}>
                        {balanceHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="text-[11px]">Privacy</span>
                      </Button>
                      <Button type="button" variant="ghost" className="flex h-14 min-w-0 flex-col gap-1 rounded-xl px-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        <span className="text-[11px]">Export</span>
                      </Button>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Projected Balance · {finalRow?.dateStr ?? ""}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-4xl font-bold tabular-nums tracking-tight lg:text-5xl">{maskAmount(currency.format(finalRow?.endBalance ?? 0), balanceHidden)}</p>
                      <Badge variant={dataMode === "actual" ? "success" : "secondary"} className="text-xs">
                        {dashboardModeLabel}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="text-muted-foreground">
                        Interest <span className="font-medium tabular-nums text-foreground">{maskAmount(currency.format(totalInterest), balanceHidden)}</span>
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

                  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 lg:hidden">
                    <div className="w-[280px] flex-shrink-0">
                      <MilestoneMarkers milestones={projection.milestones} />
                    </div>
                    <div className="w-[280px] flex-shrink-0">
                      <SummaryCards yearlySummaries={projection.yearlySummaries} />
                    </div>
                  </div>

                  <div className="hidden gap-4 xl:grid xl:grid-cols-2">
                    <MilestoneMarkers milestones={projection.milestones} />
                    <SummaryCards yearlySummaries={projection.yearlySummaries} />
                  </div>
                </div>
              ) : null}

              {activeTab === "budget" ? (
                <div>
                  <BudgetOverview />
                </div>
              ) : null}

              {activeTab === "transactions" ? (
                <div>
                  <TransactionList />
                </div>
              ) : null}

              {activeTab === "bills" ? (
                <div>
                  <BillsOverview />
                </div>
              ) : null}

              {activeTab === "projections" ? (
                <div className="space-y-4">
                  <Suspense fallback={suspenseFallback}>
                    <ScenarioManager inputs={inputs} onLoadScenario={(loadedInputs) => setInputs(loadedInputs)} onOpenSettings={() => setActiveTab("settings")} />
                    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-[1.1fr,0.9fr]">
                      <ProjectionTable rows={projection.rows} />
                      <InflowBreakdownChart rows={projection.rows} />
                    </div>
                  </Suspense>
                </div>
              ) : null}

              {activeTab === "settings" ? (
                <div className="space-y-4">
                  <Suspense fallback={suspenseFallback}>
                    <SettingsPage
                      actualSpendingHint={actualSpendingHint}
                      dataMode={dataMode}
                      effectiveMonthlySpending={effectiveMonthlySpending}
                      inputs={inputs}
                      monthSummaryTotalSpent={monthSummary?.totalSpent ?? 0}
                      onLogout={logout}
                      setDataMode={setDataMode}
                      setInputs={setInputs}
                      user={user}
                    />
                  </Suspense>
                </div>
              ) : null}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </PrivacyContext.Provider>
  )
}
