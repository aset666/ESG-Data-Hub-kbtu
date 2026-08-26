"use client";

import Link from "next/link";
import { Metric } from "@/lib/types";
import { BlockBadge, StatusBadge } from "./Badges";
import { storageLocationLabels, updateFrequencyLabels } from "@/lib/labels";

export default function MetricTable({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-4 py-3">Блок</th>
            <th className="px-4 py-3">Категория</th>
            <th className="px-4 py-3">Метрика</th>
            <th className="px-4 py-3">Подразделение</th>
            <th className="px-4 py-3">Источник</th>
            <th className="px-4 py-3">Хранение</th>
            <th className="px-4 py-3">Качество</th>
            <th className="px-4 py-3">Статус</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3">
                <BlockBadge block={m.block} />
              </td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.category}</td>
              <td className="px-4 py-3">
                <Link href={`/metrics/${m.id}`} className="font-medium text-slate-900 hover:underline">
                  {m.name}
                </Link>
                {m.unit && <div className="text-xs text-slate-400">{m.unit}</div>}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.responsible?.department || "—"}</td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                {m.source ? updateFrequencyLabels[m.source.update_frequency] : "—"}
              </td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                {m.storage_quality ? storageLocationLabels[m.storage_quality.location] : "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {m.storage_quality?.quality_avg != null ? `${m.storage_quality.quality_avg} / 5` : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={m.status} />
              </td>
            </tr>
          ))}
          {metrics.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                Ничего не найдено. Попробуйте изменить фильтры.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
