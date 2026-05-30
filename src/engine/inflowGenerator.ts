import type { RecurringInflow, OneTimeEvent, OnHireVest, InflowItem, MonthYear } from './types';
import { monthYearToKey } from '../data/defaults';

export function generateMonthlyInflows(
  startDate: MonthYear,
  endDate: MonthYear,
  recurringInflows: RecurringInflow[],
  oneTimeEvents: OneTimeEvent[],
  onHireVests: OnHireVest[],
): Map<string, InflowItem[]> {
  const map = new Map<string, InflowItem[]>();

  const addItem = (key: string, item: InflowItem) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  };

  // Iterate through each month in range
  let year = startDate.year;
  let month = startDate.month;

  while (year < endDate.year || (year === endDate.year && month <= endDate.month)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;

    // Check recurring inflows
    for (const inflow of recurringInflows) {
      if (inflow.months.includes(month)) {
        addItem(key, { name: inflow.name, amount: inflow.amount });
      }
    }

    // Check one-time events
    for (const event of oneTimeEvents) {
      if (event.month === month && event.year === year) {
        addItem(key, {
          name: event.name,
          amount: event.isOutflow ? -event.amount : event.amount,
        });
      }
    }

    // Next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  // On-hire vests
  for (const vest of onHireVests) {
    const [y, m] = vest.date.split('-').map(Number);
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const startKey = monthYearToKey(startDate);
    const endKey = monthYearToKey(endDate);
    if (key >= startKey && key <= endKey) {
      addItem(key, { name: 'On-Hire Vest', amount: vest.amount });
    }
  }

  return map;
}
