"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ProgressSlice = {
  label: string;
  value: number;
  color: string;
};

export function TeamProgressChart({ data }: { data: ProgressSlice[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_7rem] items-center gap-2 sm:grid-cols-1 sm:gap-0">
      <div className="h-40 min-w-0 sm:h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer>
            <Pie
              data={data.filter((item) => item.value > 0)}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="78%"
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive
            >
              {data.filter((item) => item.value > 0).map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} karyawan`, "Jumlah"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-[10px] sm:px-1">
        {data.map((item) => {
          const percentage = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={item.label} className="flex min-w-0 items-start gap-1.5" title={`${item.label}: ${item.value} karyawan (${percentage}%)`}>
              <span aria-hidden="true" className="mt-0.5 h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 text-[#6b7280]">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-[#374151]">{item.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
