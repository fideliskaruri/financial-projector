import { Plus, Trash2 } from 'lucide-react';
import type { StockGrant } from '../../engine/types';

interface Props {
  grants: StockGrant[];
  onChange: (grants: StockGrant[]) => void;
}

export default function StockBonusForm({ grants, onChange }: Props) {
  const addGrant = () => {
    onChange([
      ...grants,
      {
        id: `grant-${Date.now()}`,
        amountUSD: 15000,
        exchangeRate: 129,
        grantMonth: 8,
        grantStartYear: 2025,
        vestStartDelayMonths: 12,
        vestFrequencyMonths: 3,
        vestDurationMonths: 48,
        taxRate: 0,
      },
    ]);
  };

  const removeGrant = (id: string) => {
    onChange(grants.filter((g) => g.id !== id));
  };

  const updateGrant = (id: string, field: string, value: number) => {
    onChange(grants.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Annual Stock Grants
        </h3>
        <button
          onClick={addGrant}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800"
        >
          <Plus size={14} /> Add Grant
        </button>
      </div>
      {grants.map((grant) => (
        <div key={grant.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stock Grant</span>
            <button
              onClick={() => removeGrant(grant.id)}
              className="p-1 text-red-500 hover:text-red-700 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Amount (USD)</label>
              <input
                type="number"
                value={grant.amountUSD}
                onChange={(e) => updateGrant(grant.id, 'amountUSD', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Exchange Rate</label>
              <input
                type="number"
                value={grant.exchangeRate}
                onChange={(e) => updateGrant(grant.id, 'exchangeRate', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Grant Month</label>
              <input
                type="number"
                min={1}
                max={12}
                value={grant.grantMonth}
                onChange={(e) => updateGrant(grant.id, 'grantMonth', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Start Year</label>
              <input
                type="number"
                value={grant.grantStartYear}
                onChange={(e) => updateGrant(grant.id, 'grantStartYear', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vest Delay (mo)</label>
              <input
                type="number"
                value={grant.vestStartDelayMonths}
                onChange={(e) => updateGrant(grant.id, 'vestStartDelayMonths', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vest Freq (mo)</label>
              <input
                type="number"
                value={grant.vestFrequencyMonths}
                onChange={(e) => updateGrant(grant.id, 'vestFrequencyMonths', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vest Duration (mo)</label>
              <input
                type="number"
                value={grant.vestDurationMonths}
                onChange={(e) => updateGrant(grant.id, 'vestDurationMonths', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={grant.taxRate}
                onChange={(e) => updateGrant(grant.id, 'taxRate', Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Vest amount: KES {((grant.amountUSD * grant.exchangeRate * (1 - grant.taxRate / 100)) / (grant.vestDurationMonths / grant.vestFrequencyMonths)).toLocaleString('en-KE', { maximumFractionDigits: 0 })} per vest
          </p>
        </div>
      ))}
    </div>
  );
}
