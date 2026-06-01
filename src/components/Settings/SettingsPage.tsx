import FixedParamsForm from "@/components/InputForm/FixedParamsForm"
import OnHireVestsForm from "@/components/InputForm/OnHireVestsForm"
import OneTimeEventsForm from "@/components/InputForm/OneTimeEventsForm"
import ProjectionRangeForm from "@/components/InputForm/ProjectionRangeForm"
import RecurringInflowsForm from "@/components/InputForm/RecurringInflowsForm"
import SpendingScheduleForm from "@/components/InputForm/SpendingScheduleForm"
import StockBonusForm from "@/components/InputForm/StockBonusForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePrivacy } from "@/contexts/PrivacyContext"
import type { AllInputs } from "@/engine/types"
import { formatKES } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import type { User } from "firebase/auth"
import { Award, Banknote, Calendar, ChevronDown, ListChecks, LogOut, RefreshCw, TrendingUp, Zap } from "lucide-react"
import { useMemo, useState } from "react"

const APP_VERSION = "0.0.0"

type SettingsSectionId = "income" | "period" | "inflows" | "vests" | "bonuses" | "events" | "spending"

interface SettingsPageProps {
  actualSpendingHint?: string
  dataMode: "actual" | "simulation"
  effectiveMonthlySpending: number
  inputs: AllInputs
  monthSummaryTotalSpent: number
  onLogout: () => Promise<void>
  setDataMode: (value: "actual" | "simulation") => void
  setInputs: (value: AllInputs | ((current: AllInputs) => AllInputs)) => void
  user: User | null
}

function getUserLabel(user: User) {
  return user.displayName ?? user.email ?? "Signed in user"
}

function getUserInitial(user: User) {
  return getUserLabel(user).trim().charAt(0).toUpperCase() || "F"
}

export default function SettingsPage({ actualSpendingHint, dataMode, effectiveMonthlySpending, inputs, monthSummaryTotalSpent, onLogout, setDataMode, setInputs, user }: SettingsPageProps) {
  const { balanceHidden } = usePrivacy()
  const [openSection, setOpenSection] = useState<SettingsSectionId | null>("income")

  const sections = useMemo(
    () => [
      {
        id: "income" as const,
        title: "Income & Salary",
        icon: Banknote,
        content: (
          <FixedParamsForm
            params={inputs.params}
            spendingDisabled={dataMode === "actual"}
            spendingDisplayValue={effectiveMonthlySpending}
            spendingHint={actualSpendingHint}
            onChange={(params) => setInputs((current) => ({ ...current, params }))}
          />
        ),
      },
      {
        id: "period" as const,
        title: "Projection Period",
        icon: Calendar,
        content: (
          <ProjectionRangeForm
            startDate={inputs.params.startDate}
            endDate={inputs.params.endDate}
            onChange={({ startDate, endDate }) => setInputs((current) => ({ ...current, params: { ...current.params, startDate, endDate } }))}
          />
        ),
      },
      {
        id: "inflows" as const,
        title: "Recurring Inflows",
        icon: RefreshCw,
        content: <RecurringInflowsForm inflows={inputs.recurringInflows} onChange={(recurringInflows) => setInputs((current) => ({ ...current, recurringInflows }))} />,
      },
      {
        id: "vests" as const,
        title: "Stock Vests",
        icon: TrendingUp,
        content: <OnHireVestsForm vests={inputs.onHireVests} onChange={(onHireVests) => setInputs((current) => ({ ...current, onHireVests }))} />,
      },
      {
        id: "bonuses" as const,
        title: "Stock Bonuses",
        icon: Award,
        content: <StockBonusForm stockGrants={inputs.stockGrants} onChange={(stockGrants) => setInputs((current) => ({ ...current, stockGrants }))} />,
      },
      {
        id: "events" as const,
        title: "One-time Events",
        icon: Zap,
        content: <OneTimeEventsForm events={inputs.oneTimeEvents} onChange={(oneTimeEvents) => setInputs((current) => ({ ...current, oneTimeEvents }))} />,
      },
      {
        id: "spending" as const,
        title: "Spending Schedule",
        icon: ListChecks,
        content: <SpendingScheduleForm overrides={inputs.spendingOverrides} onChange={(spendingOverrides) => setInputs((current) => ({ ...current, spendingOverrides }))} />,
      },
    ],
    [actualSpendingHint, dataMode, effectiveMonthlySpending, inputs, setInputs],
  )

  return (
    <div className="space-y-4">
      <Card className="border bg-card">
        <CardHeader className="gap-4">
          <div className="space-y-1">
            <CardTitle>Data source</CardTitle>
            <CardDescription>Choose whether projections use your saved simulation assumptions or live spending data.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={dataMode} onValueChange={(value) => setDataMode(value as "actual" | "simulation")}>
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-full p-1 sm:inline-grid sm:w-auto">
                <TabsTrigger value="simulation" className="rounded-full px-4 py-2">
                  Simulation mode
                </TabsTrigger>
                <TabsTrigger value="actual" className="rounded-full px-4 py-2">
                  Actual data
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant={monthSummaryTotalSpent > effectiveMonthlySpending ? "warning" : "success"}>
              Actual this month: {maskAmount(formatKES(monthSummaryTotalSpent), balanceHidden)} / {maskAmount(formatKES(effectiveMonthlySpending), balanceHidden)}
            </Badge>
          </div>
          {actualSpendingHint ? <CardDescription>{actualSpendingHint}</CardDescription> : null}
        </CardHeader>
      </Card>

      <Card className="border bg-card">
        <CardContent className="p-3">
          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isOpen = section.id === openSection

              return (
                <div key={section.id} className="rounded-xl border border-border/60 bg-background/30">
                  <button
                    type="button"
                    className="flex h-14 w-full items-center gap-3 rounded-lg px-4 text-left hover:bg-secondary/50"
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{section.title}</span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen ? <div className="px-4 pb-4">{section.content}</div> : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {user ? (
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in with Firebase GitHub authentication.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={getUserLabel(user)} className="h-12 w-12 rounded-full border border-border/70 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold text-foreground">
                  {getUserInitial(user)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{getUserLabel(user)}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email ?? "GitHub account"}</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => void onLogout()}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <p className="pb-2 text-center text-xs text-muted-foreground">v{APP_VERSION} · Made by Fidelis</p>
    </div>
  )
}
