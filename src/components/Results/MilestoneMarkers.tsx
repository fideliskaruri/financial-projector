import { Card, CardContent } from "@/components/ui/card"
import { monthYearToString } from "@/data/defaults"
import type { Milestone } from "@/engine/types"

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 })

interface MilestoneMarkersProps {
  milestones: Milestone[]
}

export default function MilestoneMarkers({ milestones }: MilestoneMarkersProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-medium">Milestones</h3>
        <div className="space-y-0">
          {milestones.map((milestone) => (
            <div key={milestone.name} className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium">{milestone.name}</p>
                <p className="text-xs text-muted-foreground">{currency.format(milestone.targetAmount)}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {milestone.reachedDate ? monthYearToString(milestone.reachedDate) : "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
