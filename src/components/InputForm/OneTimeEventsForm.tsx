import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { OneTimeEvent } from "@/engine/types"
import { Plus, Trash2 } from "lucide-react"

interface OneTimeEventsFormProps {
  events: OneTimeEvent[]
  onChange: (events: OneTimeEvent[]) => void
}

export default function OneTimeEventsForm({ events, onChange }: OneTimeEventsFormProps) {
  const updateEvent = (id: string, updates: Partial<OneTimeEvent>) => {
    onChange(events.map((event) => (event.id === id ? { ...event, ...updates } : event)))
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>One-time events</CardTitle>
            <CardDescription>One-time inflows or expenses.</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onChange([
                ...events,
                {
                  id: `event-${Date.now()}`,
                  name: "New event",
                  amount: 0,
                  month: 1,
                  year: new Date().getFullYear(),
                  isOutflow: false,
                },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add event
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[1.4fr,1fr,0.8fr,0.9fr,0.9fr,auto] md:items-end"
            >
              <div className="space-y-2">
                <Badge variant={event.isOutflow ? "warning" : "success"} className="w-fit">{event.isOutflow ? "Expense" : "Inflow"}</Badge>
                <Input value={event.name} onChange={(e) => updateEvent(event.id, { name: e.target.value })} />
              </div>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Amount</span>
                <Input type="number" value={event.amount} onChange={(e) => updateEvent(event.id, { amount: Number(e.target.value) })} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Month</span>
                <Select value={event.month} onChange={(e) => updateEvent(event.id, { month: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Year</span>
                <Input type="number" value={event.year} onChange={(e) => updateEvent(event.id, { year: Number(e.target.value) })} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Direction</span>
                <Select value={event.isOutflow ? "outflow" : "inflow"} onChange={(e) => updateEvent(event.id, { isOutflow: e.target.value === "outflow" })}>
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </Select>
              </label>
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(events.filter((item) => item.id !== event.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-muted-foreground">No one-time events configured.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
