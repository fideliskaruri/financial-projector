import type { Milestone } from '../../engine/types';
import { monthYearToString } from '../../data/defaults';
import { Target, CheckCircle } from 'lucide-react';

interface Props {
  milestones: Milestone[];
}

export default function MilestoneMarkers({ milestones }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🎯 Milestones</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {milestones.map((m) => (
          <div
            key={m.name}
            className={`p-3 rounded-lg text-center ${
              m.reachedDate
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              {m.reachedDate ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <Target size={14} className="text-gray-400" />
              )}
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{m.name}</span>
            </div>
            {m.reachedDate ? (
              <p className="text-xs text-green-600 dark:text-green-400">
                {monthYearToString(m.reachedDate)}
              </p>
            ) : (
              <p className="text-xs text-gray-400">Not yet reached</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
