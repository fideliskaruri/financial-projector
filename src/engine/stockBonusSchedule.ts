import type { StockGrant, InflowItem, MonthYear } from './types';
import { monthYearToKey } from '../data/defaults';

export function generateStockVestSchedule(
  grants: StockGrant[],
  startDate: MonthYear,
  endDate: MonthYear,
): Map<string, InflowItem[]> {
  const map = new Map<string, InflowItem[]>();

  const addItem = (key: string, item: InflowItem) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  };

  const startKey = monthYearToKey(startDate);
  const endKey = monthYearToKey(endDate);

  for (const grant of grants) {
    const totalKES = grant.amountUSD * grant.exchangeRate;
    const numVests = grant.vestDurationMonths / grant.vestFrequencyMonths;
    const vestAmount = (totalKES * (1 - grant.taxRate / 100)) / numVests;

    // Generate grants for each year that could produce vests in our range
    // A grant in year Y vests starting Y + vestStartDelayMonths/12
    // We need to go back far enough to catch grants whose vests fall in range
    const earliestGrantYear = grant.grantStartYear;
    const latestGrantYear = endDate.year + 1;

    for (let grantYear = earliestGrantYear; grantYear <= latestGrantYear; grantYear++) {
      // Grant date
      let vestMonth = grant.grantMonth;
      let vestYear = grantYear;

      // Advance by vestStartDelayMonths
      let totalMonths = (vestYear * 12 + vestMonth) + grant.vestStartDelayMonths;
      vestMonth = ((totalMonths - 1) % 12) + 1;
      vestYear = Math.floor((totalMonths - 1) / 12);

      // Generate each vest
      for (let v = 0; v < numVests; v++) {
        const key = `${vestYear}-${String(vestMonth).padStart(2, '0')}`;

        if (key >= startKey && key <= endKey) {
          addItem(key, {
            name: `Stock Vest (${grantYear} Grant)`,
            amount: Math.round(vestAmount * 100) / 100,
          });
        }

        // Advance by vest frequency
        totalMonths = (vestYear * 12 + vestMonth) + grant.vestFrequencyMonths;
        vestMonth = ((totalMonths - 1) % 12) + 1;
        vestYear = Math.floor((totalMonths - 1) / 12);
      }
    }
  }

  return map;
}
