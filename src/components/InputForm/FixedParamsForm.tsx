import type { FinancialParams } from '../../engine/types';

interface Props {
  params: FinancialParams;
  onChange: (params: FinancialParams) => void;
}

export default function FixedParamsForm({ params, onChange }: Props) {
  const update = (field: keyof FinancialParams, value: number) => {
    onChange({ ...params, [field]: value });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Monthly Parameters
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Net Salary (KES)
          </label>
          <input
            type="number"
            value={params.netSalary}
            onChange={(e) => update('netSalary', Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Monthly Spending (KES)
          </label>
          <input
            type="number"
            value={params.monthlySpending}
            onChange={(e) => update('monthlySpending', Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            MMF Monthly Interest (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={params.mmfMonthlyInterestRate}
            onChange={(e) => update('mmfMonthlyInterestRate', Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Starting Balance (KES)
          </label>
          <input
            type="number"
            value={params.startingBalance}
            onChange={(e) => update('startingBalance', Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
