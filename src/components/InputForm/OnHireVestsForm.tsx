import { Plus, Trash2 } from 'lucide-react';
import type { OnHireVest } from '../../engine/types';

interface Props {
  vests: OnHireVest[];
  onChange: (vests: OnHireVest[]) => void;
}

export default function OnHireVestsForm({ vests, onChange }: Props) {
  const addVest = () => {
    onChange([
      ...vests,
      { id: `vest-${Date.now()}`, date: '2026-01-15', amount: 0 },
    ]);
  };

  const removeVest = (id: string) => {
    onChange(vests.filter((v) => v.id !== id));
  };

  const updateVest = (id: string, field: string, value: unknown) => {
    onChange(vests.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          On-Hire Stock Vests
        </h3>
        <button
          onClick={addVest}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800"
        >
          <Plus size={14} /> Add Vest
        </button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {vests.map((vest) => (
          <div key={vest.id} className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded">
            <input
              type="date"
              value={vest.date}
              onChange={(e) => updateVest(vest.id, 'date', e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="KES Amount"
              value={vest.amount || ''}
              onChange={(e) => updateVest(vest.id, 'amount', Number(e.target.value))}
              className="w-32 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={() => removeVest(vest.id)}
              className="p-1 text-red-500 hover:text-red-700 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
