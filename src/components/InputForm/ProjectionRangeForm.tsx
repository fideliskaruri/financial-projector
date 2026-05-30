import type { MonthYear } from '../../engine/types';

interface Props {
  startDate: MonthYear;
  endDate: MonthYear;
  onChangeStart: (date: MonthYear) => void;
  onChangeEnd: (date: MonthYear) => void;
}

export default function ProjectionRangeForm({ startDate, endDate, onChangeStart, onChangeEnd }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Projection Range
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start</label>
          <div className="flex gap-2">
            <select
              value={startDate.month}
              onChange={(e) => onChangeStart({ ...startDate, month: Number(e.target.value) })}
              className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={startDate.year}
              onChange={(e) => onChangeStart({ ...startDate, year: Number(e.target.value) })}
              className="w-20 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End</label>
          <div className="flex gap-2">
            <select
              value={endDate.month}
              onChange={(e) => onChangeEnd({ ...endDate, month: Number(e.target.value) })}
              className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={endDate.year}
              onChange={(e) => onChangeEnd({ ...endDate, year: Number(e.target.value) })}
              className="w-20 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
