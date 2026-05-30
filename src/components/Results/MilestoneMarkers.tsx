import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Milestone } from "@/engine/types"
import { monthYearToString } from "@/data/defaults"
import { motion } from "motion/react"
import { Flag, Target } from "lucide-react"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface MilestoneMarkersProps {
  milestones: Milestone[]
}

export default function MilestoneMarkers({ milestones }: MilestoneMarkersProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.08 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Balance targets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone.name} className="flex flex-col gap-3 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  {milestone.reachedDate ? <Flag className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">{milestone.name}</p>
                  <p className="text-sm text-muted-foreground">Target balance: {currency.format(milestone.targetAmount)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={milestone.reachedDate ? "success" : "secondary"}>{milestone.reachedDate ? "Projected" : "Pending"}</Badge>
                <span className="text-sm text-muted-foreground">
                  {milestone.reachedDate ? monthYearToString(milestone.reachedDate) : "Outside selected range"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
