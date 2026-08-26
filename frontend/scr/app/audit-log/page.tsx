"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { AuditLogEntry } from "@/lib/types";

const actionLabels: Record<string, string> = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
};

const actionColors: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-amber-100 text-amber-700",
  delete: "bg-red-100 text-red-700",
};

function AuditLogContent() {
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AuditLogEntry[]>("/api/audit-log?limit=200")
      .then(setEntries)
      .catch(() => setError("Не удалось загрузить журнал изменений"));
  }, []);

  if (error) return <div className="card p-6 text-red-600">{error}</div>;
  if (!entries) return <div className="card p-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Журнал изменений</h1>
        <p className="text-sm text-slate-500">Кто и когда добавлял, изменял или удалял записи в каталоге.</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Дата и время</th>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Действие</th>
              <th className="px-4 py-3">Запись</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(e.timestamp).toLocaleString("ru-RU")}</td>
                <td className="px-4 py-3 text-slate-700">{e.user_email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${actionColors[e.action] || "bg-slate-100 text-slate-600"}`}>
                    {actionLabels[e.action] || e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-800">{e.entity_name || e.entity_id}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Записей в журнале пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <RequireAuth>
      <AuditLogContent />
    </RequireAuth>
  );
}
