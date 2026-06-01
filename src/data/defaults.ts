import type { AllInputs, MonthYear } from '../engine/types';

export const DEFAULT_MILESTONES = [1_000_000, 5_000_000, 10_000_000, 20_000_000, 30_000_000, 49_500_000];

export const DEFAULT_INPUTS: AllInputs = {
  params: {
    netSalary: 315_000,
    monthlySpending: 165_000,
    mmfMonthlyInterestRate: 1,
    startingBalance: 404_000,
    startDate: { month: 6, year: 2026 },
    projectionYears: 5,
    endDate: { month: 12, year: 2030 },
  },
  recurringInflows: [
    {
      id: 'espp',
      name: 'ESPP Quarterly Sale',
      amount: 212_903,
      frequency: 'quarterly',
      months: [3, 6, 9, 12],
    },
    {
      id: 'cash-bonus',
      name: 'Cash Bonus',
      amount: 481_390,
      frequency: 'annual',
      months: [8],
    },
  ],
  onHireVests: [
    { id: 'v1', date: '2026-08-15', amount: 319_404 },
    { id: 'v2', date: '2026-11-15', amount: 53_277 },
    { id: 'v3', date: '2027-02-15', amount: 106_425 },
    { id: 'v4', date: '2027-05-15', amount: 53_277 },
    { id: 'v5', date: '2027-08-15', amount: 106_425 },
    { id: 'v6', date: '2027-11-15', amount: 53_277 },
    { id: 'v7', date: '2028-02-15', amount: 106_425 },
    { id: 'v8', date: '2028-05-15', amount: 53_277 },
    { id: 'v9', date: '2028-08-15', amount: 106_425 },
    { id: 'v10', date: '2028-11-15', amount: 53_277 },
    { id: 'v11', date: '2029-02-15', amount: 106_425 },
    { id: 'v12', date: '2029-05-15', amount: 53_277 },
    { id: 'v13', date: '2029-08-15', amount: 106_425 },
  ],
  stockGrants: [
    {
      id: 'annual-stock',
      amountUSD: 15_000,
      exchangeRate: 129,
      grantMonth: 8, // August
      grantStartYear: 2025,
      vestStartDelayMonths: 12,
      vestFrequencyMonths: 3, // quarterly
      vestDurationMonths: 48, // 4 years
      taxRate: 0,
    },
  ],
  oneTimeEvents: [],
  milestoneTargets: DEFAULT_MILESTONES,
  spendingOverrides: [],
};

export const LEAN_SPENDING = 132_000;

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function monthYearToString(my: MonthYear): string {
  return `${MONTH_NAMES[my.month - 1]} ${my.year}`;
}

export function monthYearToKey(my: MonthYear): string {
  return `${my.year}-${String(my.month).padStart(2, '0')}`;
}
