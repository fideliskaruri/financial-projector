import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { monthYearToString } from "@/data/defaults"
import type { MonthYear } from "@/engine/types"
import { PROJECTION_YEAR_OPTIONS } from "@/lib/projectionRange"

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

interface ProjectionRangeFormProps {
  startDate: MonthYear
  endDate: MonthYear
  projectionYears: number
  onChange: (range: { startDate: MonthYear; projectionYears: number }) => void
}

export default function ProjectionRangeForm({ startDate, endDate, projectionYears, onChange }: ProjectionRangeFormProps) {
  const updateStartDate = (updates: Partial<MonthYear>) => {
    onChange({ startDate: { ...startDate, ...updates }, projectionYears })
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Projection range</CardTitle>
          <CardDescription>Pick a start month and how many calendar years to project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Start date</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={startDate.month} onChange={(event) => updateStartDate({ month: Number(event.target.value) })}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Select>
              <Input type="number" value={startDate.year} onChange={(event) => updateStartDate({ year: Number(event.target.value) })} />
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project ahead</p>
                <p className="mt-1 text-xs text-muted-foreground">Choose a quick duration and the end date updates automatically.</p>
              </div>
              <Badge variant="secondary">Ends {monthYearToString(endDate)}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PROJECTION_YEAR_OPTIONS.map((option) => {
                const isActive = option === projectionYears

                return (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="rounded-full px-4"
                    aria-pressed={isActive}
                    onClick={() => onChange({ startDate, projectionYears: option })}
                  >
                    {option}y
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
