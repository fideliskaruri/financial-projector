import { Plus, Trash2 } from 'lucide-react';
import type { RecurringInflow } from '../../engine/types';

interface Props {
  inflows: RecurringInflow[];
  onChange: (inflows: RecurringInflow[]) => void;
}

const MONTH_OPTIONS = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
];

export default function RecurringInflowsForm({ inflows, onChange }: Props) {
  const addInflow = () => {
    onChange([
      ...inflows,
      {
        id: `inflow-${Date.now()}`,
        name: '',
        amount: 0,
        frequency: 'annual',
        months: [],
      },
    ]);
  };

  const removeInflow = (id: string) => {
    onChange(inflows.filter((i) => i.id !== id));
  };

  const updateInflow = (id: string, field: string, value: unknown) => {
    onChange(
      inflows.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const toggleMonth = (id: string, month: number) => {
    const inflow = inflows.find((i) => i.id === id)!;
    const months = inflow.months.includes(month)
      ? inflow.months.filter((m) => m !== month)
      : [...inflow.months, month].sort((a, b) => a - b);
    updateInflow(id, 'months', months);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Recurring Inflows
        </h3>
        <button
          onClick={addInflow}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Plus size={14} /> Add
        </button>
      </div>
      {inflows.map((inflow) => (
        <div key={inflow.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Name"
              value={inflow.name}
              onChange={(e) => updateInflow(inflow.id, 'name', e.target.value)}
              className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Amount"
              value={inflow.amount || ''}
              onChange={(e) => updateInflow(inflow.id, 'amount', Number(e.target.value))}
              className="w-32 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={() => removeInflow(inflow.id)}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {MONTH_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => toggleMonth(inflow.id, m.value)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                  inflow.months.includes(m.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
