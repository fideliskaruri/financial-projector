import { Card, CardContent } from "@/components/ui/card"
import { usePrivacy } from "@/contexts/PrivacyContext"
import { monthYearToString } from "@/data/defaults"
import type { Milestone } from "@/engine/types"
import { currencyFormatter as currency } from "@/lib/finance"
import { maskAmount } from "@/lib/mask"

interface MilestoneMarkersProps {
  milestones: Milestone[]
}

export default function MilestoneMarkers({ milestones }: MilestoneMarkersProps) {
  const { balanceHidden } = usePrivacy()

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-medium">Milestones</h3>
        <div className="space-y-0">
          {milestones.map((milestone) => (
            <div key={milestone.name} className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium">{milestone.name}</p>
                <p className="text-xs text-muted-foreground">{maskAmount(currency.format(milestone.targetAmount), balanceHidden)}</p>
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
