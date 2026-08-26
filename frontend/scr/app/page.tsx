"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import FilterBar, { Filters } from "@/components/FilterBar";
import MetricTable from "@/components/MetricTable";
import MetricCards from "@/components/MetricCards";
import { api } from "@/lib/api";
import { MetricListResponse } from "@/lib/types";

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function CatalogContent() {
  const [filters, setFilters] = useState<Filters>({ block: "", status: "", department: "", standard: "", search: "" });
  const debouncedSearch = useDebounced(filters.search);
  const debouncedDept = useDebounced(filters.department);
  const [data, setData] = useState<MetricListResponse | null>(null);
  const [view, setView] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.block) params.set("block", filters.block);
    if (filters.status) params.set("status", filters.status);
    if (debouncedDept) params.set("department", debouncedDept);
    if (filters.standard) params.set("standard", filters.standard);
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page_size", "200");
    return params.toString();
  }, [filters.block, filters.status, filters.standard, debouncedDept, debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<MetricListResponse>(`/api/metrics?${query}`)
      .then(setData)
      .catch(() => setError("Не удалось загрузить данные. Проверьте соединение с сервером."))
      .finally(() => setLoading(false));
  }, [query]);

  function exportExcel() {
    const token = typeof window !== "undefined" ? localStorage.getItem("esg_token") : null;
    fetch(`${api.apiUrl}/api/export/excel`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ESG_Data_Landscape_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Каталог ESG-данных</h1>
          <p className="text-sm text-slate-500">
            {data ? `Найдено записей: ${data.total}` : "Загрузка..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 text-sm ${view === "table" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
            >
              Таблица
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1.5 text-sm ${view === "cards" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
            >
              Карточки
            </button>
          </div>
          <button onClick={exportExcel} className="btn-secondary">
            Экспорт в Excel
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}
      {loading && !data && <div className="card p-10 text-center text-slate-400">Загрузка данных...</div>}

      {data && (view === "table" ? <MetricTable metrics={data.items} /> : <MetricCards metrics={data.items} />)}
    </div>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <CatalogContent />
    </RequireAuth>
  );
}
