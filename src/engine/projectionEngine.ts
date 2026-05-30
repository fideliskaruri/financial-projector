import type {
  AllInputs,
  MonthlyRow,
  Milestone,
  YearlySummary,
  ProjectionResult,
  MonthYear,
  SpendingOverride,
} from './types';
import { generateMonthlyInflows } from './inflowGenerator';
import { generateStockVestSchedule } from './stockBonusSchedule';
import { monthYearToString } from '../data/defaults';

function getSpending(
  month: number,
  year: number,
  baseSpending: number,
  overrides: SpendingOverride[],
): number {
  // Find the latest override that applies (fromDate <= current month)
  let spending = baseSpending;
  for (const override of overrides) {
    const overrideStart = override.fromDate.year * 12 + override.fromDate.month;
    const current = year * 12 + month;
    if (current >= overrideStart) {
      spending = override.amount;
    }
  }
  return spending;
}

export function runProjection(inputs: AllInputs): ProjectionResult {
  const { params, recurringInflows, onHireVests, stockGrants, oneTimeEvents, milestoneTargets, spendingOverrides } = inputs;

  // Generate all inflow schedules
  const recurringMap = generateMonthlyInflows(
    params.startDate,
    params.endDate,
    recurringInflows,
    oneTimeEvents,
    onHireVests,
  );
  const stockMap = generateStockVestSchedule(stockGrants, params.startDate, params.endDate);

  const rows: MonthlyRow[] = [];
  let balance = params.startingBalance;

  // Milestone tracking
  const milestones: Milestone[] = milestoneTargets.map((t) => ({
    name: `KES ${(t / 1_000_000).toFixed(1)}M`,
    targetAmount: t,
    reachedDate: null,
    reachedBalance: null,
  }));

  // Yearly tracking
  const yearlyMap = new Map<number, { totalSaved: number; totalInterest: number; endBalance: number }>();

  let year = params.startDate.year;
  let month = params.startDate.month;

  while (year < params.endDate.year || (year === params.endDate.year && month <= params.endDate.month)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const date: MonthYear = { month, year };
    const startBalance = balance;

    // Collect all inflows for this month
    const inflows = [
      { name: 'Net Salary', amount: params.netSalary },
      ...(recurringMap.get(key) || []),
      ...(stockMap.get(key) || []),
    ];

    const totalInflows = inflows.reduce((sum, i) => sum + i.amount, 0);

    // Get spending (with overrides)
    const spending = getSpending(month, year, params.monthlySpending, spendingOverrides);

    // Balance after inflows and spending
    const balanceAfterSpending = startBalance + totalInflows - spending;

    // Interest on remaining balance (only if positive)
    const interest = balanceAfterSpending > 0
      ? Math.round(balanceAfterSpending * (params.mmfMonthlyInterestRate / 100) * 100) / 100
      : 0;

    const endBalance = Math.round((balanceAfterSpending + interest) * 100) / 100;
    balance = endBalance;

    rows.push({
      date,
      dateStr: monthYearToString(date),
      startBalance: Math.round(startBalance * 100) / 100,
      inflows,
      totalInflows,
      spending,
      interest,
      endBalance,
    });

    // Check milestones
    for (const milestone of milestones) {
      if (milestone.reachedDate === null && endBalance >= milestone.targetAmount) {
        milestone.reachedDate = { ...date };
        milestone.reachedBalance = endBalance;
      }
    }

    // Yearly tracking
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { totalSaved: 0, totalInterest: 0, endBalance: 0 });
    }
    const ys = yearlyMap.get(year)!;
    ys.totalSaved += totalInflows - spending;
    ys.totalInterest += interest;
    ys.endBalance = endBalance;

    // Next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  const yearlySummaries: YearlySummary[] = Array.from(yearlyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, data]) => ({
      year,
      endBalance: data.endBalance,
      totalSaved: Math.round(data.totalSaved * 100) / 100,
      totalInterest: Math.round(data.totalInterest * 100) / 100,
    }));

  return { rows, milestones, yearlySummaries };
}
