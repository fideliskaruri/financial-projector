export interface FinancialParams {
  netSalary: number;
  monthlySpending: number;
  mmfMonthlyInterestRate: number;
  startingBalance: number;
  startDate: MonthYear;
  projectionYears?: number;
  endDate: MonthYear;
}

export interface MonthYear {
  month: number; // 1-12
  year: number;
}

export interface RecurringInflow {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'custom';
  months: number[]; // 1-12, which months this inflow occurs
}

export interface OnHireVest {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface StockGrant {
  id: string;
  amountUSD: number;
  exchangeRate: number;
  grantMonth: number; // 1-12
  grantStartYear: number;
  vestStartDelayMonths: number; // typically 12
  vestFrequencyMonths: number; // typically 3 (quarterly)
  vestDurationMonths: number; // typically 48 (4 years)
  taxRate: number; // 0-100, assume 0 for capital gains with zero gain
}

export interface OneTimeEvent {
  id: string;
  name: string;
  amount: number;
  month: number; // 1-12
  year: number;
  isOutflow: boolean;
}

export interface InflowItem {
  name: string;
  amount: number;
}

export interface MonthlyRow {
  date: MonthYear;
  dateStr: string; // "Jun 2026"
  startBalance: number;
  inflows: InflowItem[];
  totalInflows: number;
  spending: number;
  interest: number;
  endBalance: number;
}

export interface Milestone {
  name: string;
  targetAmount: number;
  reachedDate: MonthYear | null;
  reachedBalance: number | null;
}

export interface YearlySummary {
  year: number;
  endBalance: number;
  totalSaved: number;
  totalInterest: number;
}

export interface ProjectionResult {
  rows: MonthlyRow[];
  milestones: Milestone[];
  yearlySummaries: YearlySummary[];
}

export interface SpendingOverride {
  id: string;
  fromDate: MonthYear;
  amount: number;
}

export interface AllInputs {
  params: FinancialParams;
  recurringInflows: RecurringInflow[];
  onHireVests: OnHireVest[];
  stockGrants: StockGrant[];
  oneTimeEvents: OneTimeEvent[];
  milestoneTargets: number[];
  spendingOverrides: SpendingOverride[];
}
