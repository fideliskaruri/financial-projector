import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { SpendingOverride } from "@/engine/types"
import { Plus, Trash2 } from "lucide-react"

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
]

interface SpendingScheduleFormProps {
  overrides: SpendingOverride[]
  onChange: (overrides: SpendingOverride[]) => void
}

export default function SpendingScheduleForm({ overrides, onChange }: SpendingScheduleFormProps) {
  const updateOverride = (id: string, updates: Partial<SpendingOverride>) => {
    onChange(overrides.map((override) => (override.id === id ? { ...override, ...updates } : override)))
  }

  const handleAdd = () => {
    const today = new Date()

    onChange([
      ...overrides,
      {
        id: `spending-${Date.now()}`,
        fromDate: {
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        },
        amount: 0,
      },
    ])
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Spending schedule</CardTitle>
            <CardDescription>Override spending from a specific month onward.</CardDescription>
          </div>
          <Button type="button" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add override
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {overrides.map((override, index) => (
            <div
              key={override.id}
              className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[auto,1fr,1fr,1fr,auto] md:items-end"
            >
              <Badge variant="secondary" className="w-fit">Step {index + 1}</Badge>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">From month</span>
                <Select
                  value={override.fromDate.month}
                  onChange={(event) => updateOverride(override.id, { fromDate: { ...override.fromDate, month: Number(event.target.value) } })}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Year</span>
                <Input
                  type="number"
                  value={override.fromDate.year}
                  onChange={(event) => updateOverride(override.id, { fromDate: { ...override.fromDate, year: Number(event.target.value) } })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Monthly spending</span>
                <Input type="number" value={override.amount} onChange={(event) => updateOverride(override.id, { amount: Number(event.target.value) })} />
              </label>
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(overrides.filter((item) => item.id !== override.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {overrides.length === 0 ? <p className="text-sm text-muted-foreground">No spending overrides configured.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
