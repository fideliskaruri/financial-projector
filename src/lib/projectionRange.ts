import type { AllInputs, FinancialParams, MonthYear } from "@/engine/types"

export const PROJECTION_YEAR_OPTIONS = [1, 2, 3, 5, 10] as const
const MIN_PROJECTION_YEARS = 1

export function deriveProjectionYears(startDate: MonthYear, endDate: MonthYear): number {
  return Math.max(MIN_PROJECTION_YEARS, endDate.year - startDate.year + 1)
}

export function getProjectionEndDate(startDate: MonthYear, projectionYears: number): MonthYear {
  const normalizedYears = Number.isFinite(projectionYears) ? Math.max(MIN_PROJECTION_YEARS, Math.round(projectionYears)) : MIN_PROJECTION_YEARS

  return {
    month: 12,
    year: startDate.year + normalizedYears - 1,
  }
}

export function syncFinancialParams(params: FinancialParams): FinancialParams {
  const projectionYears = params.projectionYears ?? deriveProjectionYears(params.startDate, params.endDate)

  return {
    ...params,
    projectionYears,
    endDate: getProjectionEndDate(params.startDate, projectionYears),
  }
}

export function syncAllInputs(inputs: AllInputs): AllInputs {
  return {
    ...inputs,
    params: syncFinancialParams(inputs.params),
  }
}
