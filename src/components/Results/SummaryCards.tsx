import type { YearlySummary } from '../../engine/types';
import { formatKES } from '../../utils/formatters';
import { Wallet, Percent } from 'lucide-react';

interface Props {
  summaries: YearlySummary[];
}

export default function SummaryCards({ summaries }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Yearly Summary</h3>
      <div className="space-y-3">
        {summaries.map((s) => (
          <div key={s.year} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">{s.year}</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatKES(s.endBalance)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Wallet size={12} />
                <span>Saved: {formatKES(s.totalSaved)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Percent size={12} />
                <span>Interest: {formatKES(s.totalInterest)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
