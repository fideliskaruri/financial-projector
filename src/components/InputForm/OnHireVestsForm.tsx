import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { OnHireVest } from "@/engine/types"
import { Plus, Trash2 } from "lucide-react"

interface OnHireVestsFormProps {
  vests: OnHireVest[]
  onChange: (vests: OnHireVest[]) => void
}

export default function OnHireVestsForm({ vests, onChange }: OnHireVestsFormProps) {
  const updateVest = (id: string, updates: Partial<OnHireVest>) => {
    onChange(vests.map((vest) => (vest.id === id ? { ...vest, ...updates } : vest)))
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>On-hire vests</CardTitle>
            <CardDescription>Fixed stock vesting events.</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onChange([...vests, { id: `vest-${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: 0 }])}
          >
            <Plus className="h-4 w-4" />
            Add vest
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vests.map((vest, index) => (
            <div
              key={vest.id}
              className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[auto,1fr,1fr,auto] md:items-end"
            >
              <Badge variant="secondary" className="w-fit">Vest {index + 1}</Badge>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Date</span>
                <Input type="date" value={vest.date} onChange={(event) => updateVest(vest.id, { date: event.target.value })} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-muted-foreground">Net amount</span>
                <Input type="number" value={vest.amount} onChange={(event) => updateVest(vest.id, { amount: Number(event.target.value) })} />
              </label>
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(vests.filter((item) => item.id !== vest.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {vests.length === 0 ? <p className="text-sm text-muted-foreground">No on-hire vest events configured.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
