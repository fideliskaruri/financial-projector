import type { AllInputs, ProjectionResult } from '../engine/types';
import { LEAN_SPENDING } from '../data/defaults';
import { runProjection } from '../engine/projectionEngine';
import { formatKES } from '../utils/formatters';
import { useMemo } from 'react';

interface Props {
  inputs: AllInputs;
  baselineResult: ProjectionResult;
  showComparison: boolean;
  onToggle: () => void;
}

export default function ScenarioToggle({ inputs, baselineResult, showComparison, onToggle }: Props) {
  const leanResult = useMemo(() => {
    if (!showComparison) return null;
    const leanInputs: AllInputs = {
      ...inputs,
      params: { ...inputs.params, monthlySpending: LEAN_SPENDING },
    };
    return runProjection(leanInputs);
  }, [inputs, showComparison]);

  const baselineEnd = baselineResult.rows[baselineResult.rows.length - 1]?.endBalance ?? 0;
  const leanEnd = leanResult?.rows[leanResult.rows.length - 1]?.endBalance ?? 0;
  const diff = leanEnd - baselineEnd;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">🔀 What-If: Lean Spending</h3>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            showComparison
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {showComparison ? 'On' : 'Off'}
        </button>
      </div>
      {showComparison && leanResult && (
        <div className="text-xs space-y-1 text-gray-500 dark:text-gray-400">
          <p>
            Lean spending: <span className="font-medium text-gray-900 dark:text-white">{formatKES(LEAN_SPENDING)}/mo</span>
            {' vs '}
            <span className="font-medium">{formatKES(inputs.params.monthlySpending)}/mo</span>
          </p>
          <p>
            Extra saved by end: <span className="font-medium text-green-600 dark:text-green-400">+{formatKES(diff)}</span>
          </p>
          <p>
            Lean end balance: <span className="font-medium text-gray-900 dark:text-white">{formatKES(leanEnd)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export { ScenarioToggle };
