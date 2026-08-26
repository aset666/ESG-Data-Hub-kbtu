"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { HeatmapCell } from "@/lib/types";

function coverageColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-emerald-300";
  if (pct >= 40) return "bg-amber-300";
  if (pct >= 20) return "bg-orange-400";
  return "bg-red-400";
}

function HeatmapContent() {
  const [cells, setCells] = useState<HeatmapCell[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<HeatmapCell[]>("/api/stats/heatmap")
      .then(setCells)
      .catch(() => setError("Не удалось загрузить данные"));
  }, []);

  if (error) return <div className="card p-6 text-red-600">{error}</div>;
  if (!cells) return <div className="card p-10 text-center text-slate-400">Загрузка...</div>;

  const departments = Array.from(new Set(cells.map((c) => c.department))).sort();
  const blocks: Array<"E" | "S" | "G"> = ["E", "S", "G"];

  function find(dept: string, block: string) {
    return cells!.find((c) => c.department === dept && c.block === block);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Карта пробелов в данных (Heatmap)</h1>
        <p className="text-sm text-slate-500">Покрытие сбора ESG-данных по подразделениям и блокам E/S/G. Тёмно-зелёный — данные собираются полностью, красный — крупный пробел.</p>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="min-w-full text-sm border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-2 py-1">Подразделение</th>
              {blocks.map((b) => (
                <th key={b} className="text-xs font-semibold text-slate-500 uppercase px-2 py-1 text-center w-32">
                  Блок {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept}>
                <td className="px-2 py-1 text-slate-700 font-medium whitespace-nowrap">{dept}</td>
                {blocks.map((b) => {
                  const cell = find(dept, b);
                  if (!cell) {
                    return <td key={b} className="px-2 py-1 text-center text-slate-300 bg-slate-50 rounded-lg">—</td>;
                  }
                  return (
                    <td key={b} className="p-0">
                      <div className={`${coverageColor(cell.coverage_pct)} rounded-lg px-2 py-3 text-center text-white text-xs font-semibold`}>
                        {cell.coverage_pct}%
                        <div className="font-normal opacity-90">{cell.total} метрик</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 text-xs text-slate-500 items-center">
        <span className="font-semibold text-slate-700">Легенда покрытия:</span>
        {[["≥80%", "bg-emerald-500"], ["60–79%", "bg-emerald-300"], ["40–59%", "bg-amber-300"], ["20–39%", "bg-orange-400"], ["<20%", "bg-red-400"]].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${color}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HeatmapPage() {
  return (
    <RequireAuth>
      <HeatmapContent />
    </RequireAuth>
  );
}
