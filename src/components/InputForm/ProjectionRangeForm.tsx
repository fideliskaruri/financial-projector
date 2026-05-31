import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { MonthYear } from "@/engine/types"

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
  onChange: (range: { startDate: MonthYear; endDate: MonthYear }) => void
}

export default function ProjectionRangeForm({ startDate, endDate, onChange }: ProjectionRangeFormProps) {
  return (
    <div>
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Projection range</CardTitle>
          <CardDescription>Forecast period.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Start date</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={startDate.month} onChange={(event) => onChange({ startDate: { ...startDate, month: Number(event.target.value) }, endDate })}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Select>
              <Input type="number" value={startDate.year} onChange={(event) => onChange({ startDate: { ...startDate, year: Number(event.target.value) }, endDate })} />
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">End date</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={endDate.month} onChange={(event) => onChange({ startDate, endDate: { ...endDate, month: Number(event.target.value) } })}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Select>
              <Input type="number" value={endDate.year} onChange={(event) => onChange({ startDate, endDate: { ...endDate, year: Number(event.target.value) } })} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
