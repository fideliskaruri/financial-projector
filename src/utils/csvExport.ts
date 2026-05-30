import type { MonthlyRow } from '../engine/types';

export function exportToCSV(rows: MonthlyRow[]): void {
  const headers = ['Month', 'Start Balance', 'Total Inflows', 'Inflow Details', 'Spending', 'Interest', 'End Balance'];
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => [
      row.dateStr,
      Math.round(row.startBalance),
      Math.round(row.totalInflows),
      `"${row.inflows.map((i) => `${i.name}: ${Math.round(i.amount)}`).join('; ')}"`,
      Math.round(row.spending),
      Math.round(row.interest),
      Math.round(row.endBalance),
    ].join(',')),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'financial_projection.csv';
  link.click();
  URL.revokeObjectURL(url);
}
