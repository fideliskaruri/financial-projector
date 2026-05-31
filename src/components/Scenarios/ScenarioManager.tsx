import BalanceChart, { type BalanceChartSeries } from "@/components/Results/BalanceChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { usePrivacy } from "@/contexts/PrivacyContext"
import { LEAN_SPENDING } from "@/data/defaults"
import { runProjection } from "@/engine/projectionEngine"
import type { AllInputs } from "@/engine/types"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { maskAmount } from "@/lib/mask"
import { cn } from "@/lib/utils"
import { GitCompareArrows, Save, Sparkles, Trash2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "financial-projector-scenarios"
const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface SavedScenario {
  id: string
  name: string
  savedAt: string
  endBalance: number
  inputs: AllInputs
}

interface ScenarioManagerProps {
  inputs: AllInputs
  onLoadScenario: (inputs: AllInputs) => void
  onOpenSettings: () => void
}

function cloneInputs(value: AllInputs): AllInputs {
  return JSON.parse(JSON.stringify(value)) as AllInputs
}

export default function ScenarioManager({ inputs, onLoadScenario, onOpenSettings }: ScenarioManagerProps) {
  const { balanceHidden } = usePrivacy()
  const [scenarioName, setScenarioName] = useState("")
  const [leanComparisonEnabled, setLeanComparisonEnabled] = useState(false)
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([])
  const [savedScenarios, setSavedScenarios] = useLocalStorage<SavedScenario[]>(STORAGE_KEY, [])

  const currentProjection = useMemo(() => runProjection(inputs), [inputs])
  const leanInputs = useMemo<AllInputs>(() => ({ ...inputs, params: { ...inputs.params, monthlySpending: LEAN_SPENDING } }), [inputs])
  const leanProjection = useMemo(() => runProjection(leanInputs), [leanInputs])

  const selectedScenarios = useMemo(
    () => savedScenarios.filter((scenario) => selectedScenarioIds.includes(scenario.id)),
    [savedScenarios, selectedScenarioIds],
  )

  const comparisonSeries = useMemo<BalanceChartSeries[]>(() => {
    const savedScenarioSeries = selectedScenarios.map((scenario) => ({
      name: scenario.name,
      rows: runProjection(scenario.inputs).rows,
    }))

    return leanComparisonEnabled ? [{ name: "Lean spending", rows: leanProjection.rows }, ...savedScenarioSeries] : savedScenarioSeries
  }, [leanComparisonEnabled, leanProjection.rows, selectedScenarios])

  const handleSaveCurrent = () => {
    const trimmedName = scenarioName.trim()
    const name = trimmedName || `Scenario ${savedScenarios.length + 1}`
    const nextScenario: SavedScenario = {
      id: `scenario-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      endBalance: currentProjection.rows.at(-1)?.endBalance ?? 0,
      inputs: cloneInputs(inputs),
    }

    setSavedScenarios((current) => [nextScenario, ...current])
    setScenarioName("")
    toast.success(`Saved ${name}`)
  }

  const handleDelete = (id: string) => {
    setSavedScenarios((current) => current.filter((scenario) => scenario.id !== id))
    setSelectedScenarioIds((current) => current.filter((scenarioId) => scenarioId !== id))
    toast.success("Scenario removed")
  }

  const handleLoad = (scenario: SavedScenario) => {
    onLoadScenario(cloneInputs(scenario.inputs))
    toast.success(`Loaded ${scenario.name}`)
  }

  const toggleCompare = (id: string) => {
    setSelectedScenarioIds((current) => {
      if (current.includes(id)) {
        return current.filter((scenarioId) => scenarioId !== id)
      }

      if (current.length >= 3) {
        toast.info("Select up to 3 saved scenarios at once")
        return current
      }

      return [...current, id]
    })
  }

  const currentEndBalance = currentProjection.rows.at(-1)?.endBalance ?? 0
  const leanEndBalance = leanProjection.rows.at(-1)?.endBalance ?? 0
  const leanDelta = leanEndBalance - currentEndBalance

  return (
    <div className="space-y-4">
      <div>
        <Card className="border bg-card">
          <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Scenario manager</CardTitle>
              <CardDescription>Save, compare, and reload scenarios.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <Input
                value={scenarioName}
                onChange={(event) => setScenarioName(event.target.value)}
                placeholder="Name this scenario"
                className="sm:w-56"
              />
              <Button type="button" onClick={handleSaveCurrent}>
                <Save className="h-4 w-4" />
                Save Current
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Current</Badge>
                <Badge variant="outline">End balance {maskAmount(currency.format(currentEndBalance), balanceHidden)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Current baseline. Compare saved scenarios or enable lean overlay below.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={leanComparisonEnabled ? "default" : "outline"}
                  onClick={() => {
                    const nextValue = !leanComparisonEnabled
                    setLeanComparisonEnabled(nextValue)
                    toast.info(nextValue ? "Lean scenario overlay enabled" : "Lean scenario overlay hidden")
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  {leanComparisonEnabled ? "Hide lean overlay" : "Compare lean spending"}
                </Button>
                <Button type="button" variant="outline" onClick={onOpenSettings}>Adjust settings</Button>
              </div>
            </div>
            <div className={cn("rounded-2xl border p-4", leanDelta >= 0 ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Lean mode end balance</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">{maskAmount(currency.format(leanEndBalance), balanceHidden)}</p>
                </div>
                <Badge variant={leanDelta >= 0 ? "success" : "warning"} className="gap-1">
                  <GitCompareArrows className="h-3.5 w-3.5" />
                  {leanDelta >= 0 ? "Ahead" : "Behind"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Spending set to {maskAmount(currency.format(LEAN_SPENDING), balanceHidden)}/mo.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BalanceChart rows={currentProjection.rows} milestones={currentProjection.milestones} comparisonSeries={comparisonSeries} />

      <div>
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle>Saved scenarios</CardTitle>
            <CardDescription>Select to compare or load.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedScenarios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No saved scenarios yet.
              </div>
            ) : (
              savedScenarios.map((scenario) => {
                const isSelected = selectedScenarioIds.includes(scenario.id)

                return (
                  <div
                    key={scenario.id}
                    className={cn("rounded-2xl border p-4", isSelected ? "border-primary/40 bg-primary/5" : "border-border/70")}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">{scenario.name}</h3>
                          <Badge variant={isSelected ? "default" : "outline"}>{isSelected ? "Comparing" : "Saved"}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>Saved {new Date(scenario.savedAt).toLocaleString()}</span>
                          <Separator orientation="vertical" className="hidden h-4 lg:block" />
                          <span>End balance {maskAmount(currency.format(scenario.endBalance), balanceHidden)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant={isSelected ? "default" : "outline"} onClick={() => toggleCompare(scenario.id)}>
                          <GitCompareArrows className="h-4 w-4" />
                          {isSelected ? "Remove compare" : "Compare"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleLoad(scenario)}>
                          <Upload className="h-4 w-4" />
                          Load
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => handleDelete(scenario.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
