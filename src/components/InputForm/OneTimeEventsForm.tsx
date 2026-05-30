import { Plus, Trash2 } from 'lucide-react';
import type { OneTimeEvent } from '../../engine/types';

interface Props {
  events: OneTimeEvent[];
  onChange: (events: OneTimeEvent[]) => void;
}

export default function OneTimeEventsForm({ events, onChange }: Props) {
  const addEvent = () => {
    onChange([
      ...events,
      {
        id: `event-${Date.now()}`,
        name: '',
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        isOutflow: true,
      },
    ]);
  };

  const removeEvent = (id: string) => {
    onChange(events.filter((e) => e.id !== id));
  };

  const updateEvent = (id: string, field: string, value: unknown) => {
    onChange(events.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          One-Time Events
        </h3>
        <button
          onClick={addEvent}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800"
        >
          <Plus size={14} /> Add Event
        </button>
      </div>
      {events.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No one-time events. Add purchases, windfalls, etc.</p>
      )}
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <input
            type="text"
            placeholder="Name (e.g., iPhone)"
            value={event.name}
            onChange={(e) => updateEvent(event.id, 'name', e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Amount"
            value={event.amount || ''}
            onChange={(e) => updateEvent(event.id, 'amount', Number(e.target.value))}
            className="w-24 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          />
          <select
            value={event.month}
            onChange={(e) => updateEvent(event.id, 'month', Number(e.target.value))}
            className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={event.year}
            onChange={(e) => updateEvent(event.id, 'year', Number(e.target.value))}
            className="w-20 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          />
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <input
              type="checkbox"
              checked={event.isOutflow}
              onChange={(e) => updateEvent(event.id, 'isOutflow', e.target.checked)}
              className="rounded"
            />
            Outflow
          </label>
          <button
            onClick={() => removeEvent(event.id)}
            className="p-1 text-red-500 hover:text-red-700 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
