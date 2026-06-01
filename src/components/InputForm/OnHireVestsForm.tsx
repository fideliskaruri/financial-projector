import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { OnHireVest } from "@/engine/types"
import { formatKES } from "@/lib/finance"
import { Plus, Sparkles, Trash2 } from "lucide-react"
import { useState } from "react"

interface OnHireVestsFormProps {
  vests: OnHireVest[]
  onChange: (vests: OnHireVest[]) => void
}

interface ScheduleForm {
  totalAmount: string
  firstVestDate: string
  frequencyMonths: string
  numberOfVests: string
}

const initialSchedule: ScheduleForm = {
  totalAmount: "",
  firstVestDate: new Date().toISOString().slice(0, 10),
  frequencyMonths: "3",
  numberOfVests: "12",
}

function generateVestsFromSchedule(schedule: ScheduleForm): OnHireVest[] {
  const total = Number(schedule.totalAmount)
  const count = Math.max(1, Math.floor(Number(schedule.numberOfVests)))
  const freqMonths = Math.max(1, Math.floor(Number(schedule.frequencyMonths)))

  if (!Number.isFinite(total) || total <= 0 || !schedule.firstVestDate) return []

  const perVest = Math.round(total / count)
  const startDate = new Date(schedule.firstVestDate + "T00:00:00")
  const results: OnHireVest[] = []

  for (let i = 0; i < count; i++) {
    const vestDate = new Date(startDate)
    vestDate.setMonth(vestDate.getMonth() + i * freqMonths)
    results.push({
      id: `vest-gen-${Date.now()}-${i}`,
      date: vestDate.toISOString().slice(0, 10),
      amount: perVest,
    })
  }

  return results
}

function groupByYear(vests: OnHireVest[]): Map<number, OnHireVest[]> {
  const groups = new Map<number, OnHireVest[]>()
  const sorted = [...vests].sort((a, b) => a.date.localeCompare(b.date))
  for (const vest of sorted) {
    const year = new Date(vest.date).getFullYear()
    const group = groups.get(year) ?? []
    group.push(vest)
    groups.set(year, group)
  }
  return groups
}

export default function OnHireVestsForm({ vests, onChange }: OnHireVestsFormProps) {
  const [showGenerator, setShowGenerator] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleForm>(initialSchedule)

  const handleGenerate = () => {
    const generated = generateVestsFromSchedule(schedule)
    if (generated.length === 0) return
    onChange([...vests, ...generated])
    setShowGenerator(false)
    setSchedule(initialSchedule)
  }

  const updateVest = (id: string, updates: Partial<OnHireVest>) => {
    onChange(vests.map((vest) => (vest.id === id ? { ...vest, ...updates } : vest)))
  }

  const grouped = groupByYear(vests)
  const totalValue = vests.reduce((sum, v) => sum + v.amount, 0)

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>On-hire vests</CardTitle>
            <CardDescription>
              {vests.length > 0
                ? `${vests.length} vests · ${formatKES(totalValue)} total`
                : "Fixed stock vesting events."}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setShowGenerator(!showGenerator)}>
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onChange([...vests, { id: `vest-${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: 0 }])}
            >
              <Plus className="h-4 w-4" />
              Add one
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showGenerator ? (
            <div className="space-y-3 rounded-xl border border-dashed border-border/80 bg-secondary/30 p-4">
              <p className="text-sm font-medium">Generate vesting schedule</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">Total grant (KES)</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 1,200,000"
                    value={schedule.totalAmount}
                    onChange={(e) => setSchedule((s) => ({ ...s, totalAmount: e.target.value }))}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">First vest date</span>
                  <Input
                    type="date"
                    value={schedule.firstVestDate}
                    onChange={(e) => setSchedule((s) => ({ ...s, firstVestDate: e.target.value }))}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">Frequency</span>
                  <Select value={schedule.frequencyMonths} onChange={(e) => setSchedule((s) => ({ ...s, frequencyMonths: e.target.value }))}>
                    <option value="1">Monthly</option>
                    <option value="3">Quarterly</option>
                    <option value="6">Semi-annually</option>
                    <option value="12">Annually</option>
                  </Select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">Number of vests</span>
                  <Input
                    type="number"
                    min="1"
                    max="48"
                    value={schedule.numberOfVests}
                    onChange={(e) => setSchedule((s) => ({ ...s, numberOfVests: e.target.value }))}
                  />
                </label>
              </div>
              {Number(schedule.totalAmount) > 0 && Number(schedule.numberOfVests) > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Each vest: {formatKES(Math.round(Number(schedule.totalAmount) / Number(schedule.numberOfVests)))}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleGenerate}>Generate {schedule.numberOfVests} vests</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowGenerator(false)}>Cancel</Button>
              </div>
            </div>
          ) : null}

          {vests.length > 0 ? (
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([year, yearVests]) => (
                <div key={year}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{year}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{formatKES(yearVests.reduce((s, v) => s + v.amount, 0))}</span>
                  </div>
                  <div className="space-y-2">
                    {yearVests.map((vest) => (
                      <div key={vest.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                        <Input
                          type="date"
                          value={vest.date}
                          onChange={(e) => updateVest(vest.id, { date: e.target.value })}
                          className="h-9 w-auto flex-1 text-sm"
                        />
                        <Input
                          type="number"
                          value={vest.amount}
                          onChange={(e) => updateVest(vest.id, { amount: Number(e.target.value) })}
                          className="h-9 w-28 text-sm"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(vests.filter((v) => v.id !== vest.id))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {vests.length > 3 ? (
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onChange([])}>
                  Clear all vests
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No on-hire vest events. Use "Generate" to create a schedule.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
