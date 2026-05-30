import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonthlyRow, Milestone } from '../../engine/types';
import { formatCompact, formatKES } from '../../utils/formatters';

interface Props {
  rows: MonthlyRow[];
  milestones: Milestone[];
  comparisonRows?: MonthlyRow[];
  comparisonLabel?: string;
}

export default function BalanceChart({ rows, milestones, comparisonRows }: Props) {
  const data = rows.map((row, i) => ({
    name: row.dateStr,
    balance: Math.round(row.endBalance),
    ...(comparisonRows ? { comparison: Math.round(comparisonRows[i]?.endBalance ?? 0) } : {}),
  }));

  const reachedMilestones = milestones.filter((m) => m.reachedDate !== null);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Balance Over Time</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={2}
            stroke="#6b7280"
          />
          <YAxis
            tickFormatter={(v: number) => formatCompact(v)}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <Tooltip
            formatter={(value) => [
              formatKES(Number(value ?? 0)),
            ]}
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {comparisonRows && (
            <Line
              type="monotone"
              dataKey="comparison"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {reachedMilestones.map((m) => (
            <ReferenceLine
              key={m.name}
              y={m.targetAmount}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{
                value: m.name,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
