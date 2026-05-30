import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { FinancialParams } from "@/engine/types"
import { motion } from "motion/react"

interface FixedParamsFormProps {
  params: FinancialParams
  onChange: (params: FinancialParams) => void
}

export default function FixedParamsForm({ params, onChange }: FixedParamsFormProps) {
  const setValue = (key: keyof FinancialParams, value: number) => {
    onChange({ ...params, [key]: value })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border-border/70 bg-card/85 backdrop-blur">
        <CardHeader>
          <CardTitle>Core assumptions</CardTitle>
          <CardDescription>Adjust income, spending, interest, and the opening cash position.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-muted-foreground">Monthly net salary</span>
            <Input type="number" value={params.netSalary} onChange={(event) => setValue("netSalary", Number(event.target.value))} />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-muted-foreground">Monthly spending</span>
            <Input type="number" value={params.monthlySpending} onChange={(event) => setValue("monthlySpending", Number(event.target.value))} />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-muted-foreground">MMF monthly interest rate (%)</span>
            <Input
              type="number"
              step="0.01"
              value={params.mmfMonthlyInterestRate}
              onChange={(event) => setValue("mmfMonthlyInterestRate", Number(event.target.value))}
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-muted-foreground">Starting balance</span>
            <Input type="number" value={params.startingBalance} onChange={(event) => setValue("startingBalance", Number(event.target.value))} />
          </label>

          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" className="pointer-events-none opacity-100">
              Figures update instantly across all charts and tables
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
