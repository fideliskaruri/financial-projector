import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { StockGrant } from "@/engine/types"
import { Plus, Trash2 } from "lucide-react"

interface StockBonusFormProps {
  stockGrants: StockGrant[]
  onChange: (stockGrants: StockGrant[]) => void
}

export default function StockBonusForm({ stockGrants, onChange }: StockBonusFormProps) {
  const updateGrant = (id: string, updates: Partial<StockGrant>) => {
    onChange(stockGrants.map((grant) => (grant.id === id ? { ...grant, ...updates } : grant)))
  }

  return (
    <div>
      <Card className="border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Stock grants & bonus schedule</CardTitle>
            <CardDescription>Annual grants and vesting schedules.</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onChange([
                ...stockGrants,
                {
                  id: `grant-${Date.now()}`,
                  amountUSD: 0,
                  exchangeRate: 1,
                  grantMonth: 1,
                  grantStartYear: new Date().getFullYear(),
                  vestStartDelayMonths: 12,
                  vestFrequencyMonths: 3,
                  vestDurationMonths: 48,
                  taxRate: 0,
                },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add grant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stockGrants.map((grant, index) => {
            const projectedGross = grant.amountUSD * grant.exchangeRate
            const projectedNet = projectedGross * (1 - grant.taxRate / 100)
            const vestCount = Math.max(1, Math.floor(grant.vestDurationMonths / grant.vestFrequencyMonths))
            const perVest = projectedNet / vestCount

            return (
              <div
                key={grant.id}
                className="space-y-4 rounded-2xl border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">Grant {index + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">~{perVest.toFixed(0)} net per vest</Badge>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onChange(stockGrants.filter((item) => item.id !== grant.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Grant value (USD)</span>
                    <Input type="number" value={grant.amountUSD} onChange={(event) => updateGrant(grant.id, { amountUSD: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Exchange rate</span>
                    <Input type="number" value={grant.exchangeRate} onChange={(event) => updateGrant(grant.id, { exchangeRate: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Grant month</span>
                    <Select value={grant.grantMonth} onChange={(event) => updateGrant(grant.id, { grantMonth: Number(event.target.value) })}>
                      {Array.from({ length: 12 }, (_, index) => (
                        <option key={index + 1} value={index + 1}>{index + 1}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Start year</span>
                    <Input type="number" value={grant.grantStartYear} onChange={(event) => updateGrant(grant.id, { grantStartYear: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Vest start delay (months)</span>
                    <Input type="number" value={grant.vestStartDelayMonths} onChange={(event) => updateGrant(grant.id, { vestStartDelayMonths: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Vest frequency (months)</span>
                    <Input type="number" value={grant.vestFrequencyMonths} onChange={(event) => updateGrant(grant.id, { vestFrequencyMonths: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Vest duration (months)</span>
                    <Input type="number" value={grant.vestDurationMonths} onChange={(event) => updateGrant(grant.id, { vestDurationMonths: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Tax rate (%)</span>
                    <Input type="number" value={grant.taxRate} onChange={(event) => updateGrant(grant.id, { taxRate: Number(event.target.value) })} />
                  </label>
                </div>
              </div>
            )
          })}
          {stockGrants.length === 0 ? <p className="text-sm text-muted-foreground">No stock grant schedule configured.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
