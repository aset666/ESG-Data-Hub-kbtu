"use client";

import { statusLabels, standardOptions } from "@/lib/labels";

export interface Filters {
  block: string;
  status: string;
  department: string;
  standard: string;
  search: string;
}

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label className="label">Поиск</label>
        <input
          className="input"
          placeholder="Название, определение..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Блок ESG</label>
        <select className="input" value={filters.block} onChange={(e) => update("block", e.target.value)}>
          <option value="">Все блоки</option>
          <option value="E">E — Экология</option>
          <option value="S">S — Социальная сфера</option>
          <option value="G">G — Управление</option>
        </select>
      </div>
      <div>
        <label className="label">Статус сбора</label>
        <select className="input" value={filters.status} onChange={(e) => update("status", e.target.value)}>
          <option value="">Любой статус</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Подразделение</label>
        <input
          className="input"
          placeholder="Напр. HR-отдел"
          value={filters.department}
          onChange={(e) => update("department", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Стандарт</label>
        <select className="input" value={filters.standard} onChange={(e) => update("standard", e.target.value)}>
          <option value="">Любой стандарт</option>
          {standardOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
