"use client";

import Link from "next/link";
import { Metric } from "@/lib/types";
import { BlockBadge, StatusBadge } from "./Badges";

export default function MetricCards({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) {
    return <div className="card px-4 py-10 text-center text-slate-400">Ничего не найдено. Попробуйте изменить фильтры.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Link
          key={m.id}
          href={`/metrics/${m.id}`}
          className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <BlockBadge block={m.block} />
            <StatusBadge status={m.status} />
          </div>
          <div className="font-semibold text-slate-900 leading-snug">{m.name}</div>
          <div className="text-xs text-slate-400">{m.category}{m.unit ? ` · ${m.unit}` : ""}</div>
          {m.definition && <p className="text-sm text-slate-500 line-clamp-2">{m.definition}</p>}
          <div className="mt-auto pt-2 border-t border-slate-100 text-xs text-slate-500">
            {m.responsible?.department || "Подразделение не указано"}
          </div>
        </Link>
      ))}
    </div>
  );
}
