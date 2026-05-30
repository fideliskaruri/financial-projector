import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { RecurringInflow } from "@/engine/types"
import { motion } from "motion/react"
import { Plus, Trash2 } from "lucide-react"

const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const presetMonths: Record<RecurringInflow["frequency"], number[]> = {
  monthly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  quarterly: [3, 6, 9, 12],
  annual: [8],
  custom: [],
}

interface RecurringInflowsFormProps {
  inflows: RecurringInflow[]
  onChange: (inflows: RecurringInflow[]) => void
}

export default function RecurringInflowsForm({ inflows, onChange }: RecurringInflowsFormProps) {
  const updateInflow = (id: string, updates: Partial<RecurringInflow>) => {
    onChange(inflows.map((inflow) => (inflow.id === id ? { ...inflow, ...updates } : inflow)))
  }

  const addInflow = () => {
    onChange([
      ...inflows,
      {
        id: `inflow-${Date.now()}`,
        name: "New inflow",
        amount: 0,
        frequency: "custom",
        months: [],
      },
    ])
  }

  const removeInflow = (id: string) => {
    onChange(inflows.filter((inflow) => inflow.id !== id))
  }

  const toggleMonth = (id: string, month: number) => {
    onChange(
      inflows.map((inflow) => {
        if (inflow.id !== id) return inflow
        const months = inflow.months.includes(month) ? inflow.months.filter((value) => value !== month) : [...inflow.months, month].sort((a, b) => a - b)
        return { ...inflow, months }
      })
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.06 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recurring inflows</CardTitle>
            <CardDescription>Add salary-adjacent inflows such as ESPP, cash bonuses, or stipends.</CardDescription>
          </div>
          <Button type="button" size="sm" onClick={addInflow}>
            <Plus className="h-4 w-4" />
            Add inflow
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inflows.length === 0 ? <p className="text-sm text-muted-foreground">No recurring inflows configured.</p> : null}
          {inflows.map((inflow, index) => (
            <motion.div
              key={inflow.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="space-y-4 rounded-2xl border border-border/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">Inflow {index + 1}</Badge>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeInflow(inflow.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">Name</span>
                  <Input value={inflow.name} onChange={(event) => updateInflow(inflow.id, { name: event.target.value })} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">Amount</span>
                  <Input type="number" value={inflow.amount} onChange={(event) => updateInflow(inflow.id, { amount: Number(event.target.value) })} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">Frequency</span>
                  <Select
                    value={inflow.frequency}
                    onChange={(event) => {
                      const frequency = event.target.value as RecurringInflow["frequency"]
                      updateInflow(inflow.id, { frequency, months: presetMonths[frequency] })
                    }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Custom</option>
                  </Select>
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active months</p>
                <div className="flex flex-wrap gap-2">
                  {monthOptions.map((month, index) => {
                    const isActive = inflow.months.includes(index + 1)
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => toggleMonth(inflow.id, index + 1)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {month}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
