import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, MoveRight, type LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  icon?: LucideIcon
  trend?: {
    value: string
    direction?: "up" | "down" | "neutral"
  }
  helper?: string
  className?: string
}

export default function MetricCard({ label, value, icon: Icon, trend, helper, className }: MetricCardProps) {
  const direction = trend?.direction ?? "neutral"
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : MoveRight

  return (
    <Card className={cn("border bg-card", className)}>
      <CardContent className="space-y-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{value}</p>
          </div>
          {Icon ? (
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trend ? (
            <Badge
              variant={direction === "down" ? "destructive" : direction === "up" ? "success" : "secondary"}
              className="gap-1"
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.value}
            </Badge>
          ) : null}
          {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}