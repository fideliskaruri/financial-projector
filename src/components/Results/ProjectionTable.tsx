import { useState } from 'react';
import type { MonthlyRow } from '../../engine/types';
import { formatKES } from '../../utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  rows: MonthlyRow[];
}

export default function ProjectionTable({ rows }: Props) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-left">
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400">Month</th>
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 text-right">Start</th>
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 text-right">Inflows</th>
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 text-right">Spending</th>
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 text-right">Interest</th>
            <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 text-right">End Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row.dateStr;
            const isExpanded = expandedMonth === key;
            return (
              <>
                <tr
                  key={key}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setExpandedMonth(isExpanded ? null : key)}
                >
                  <td className="px-3 py-2 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      {row.dateStr}
                      {row.inflows.length > 1 && (
                        isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{formatKES(row.startBalance)}</td>
                  <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">{formatKES(row.totalInflows)}</td>
                  <td className="px-3 py-2 text-right text-red-500 dark:text-red-400">{formatKES(row.spending)}</td>
                  <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400">{formatKES(row.interest)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">{formatKES(row.endBalance)}</td>
                </tr>
                {isExpanded && (
                  <tr key={`${key}-details`} className="bg-gray-50/50 dark:bg-gray-800/30">
                    <td colSpan={6} className="px-6 py-2">
                      <div className="text-xs space-y-0.5">
                        {row.inflows.map((inflow, i) => (
                          <div key={i} className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{inflow.name}</span>
                            <span className={inflow.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                              {formatKES(inflow.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
