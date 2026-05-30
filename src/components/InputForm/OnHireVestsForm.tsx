import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { OnHireVest } from "@/engine/types"
import { motion } from "motion/react"
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
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.09 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
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
            <motion.div
              key={vest.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="grid gap-4 rounded-2xl border border-border/70 p-4 md:grid-cols-[auto,1fr,1fr,auto] md:items-end"
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
            </motion.div>
          ))}
          {vests.length === 0 ? <p className="text-sm text-muted-foreground">No on-hire vest events configured.</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}
