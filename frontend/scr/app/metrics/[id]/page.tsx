"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import MetricForm, { metricToFormValue, MetricFormValue } from "@/components/MetricForm";
import { BlockBadgeFull, StatusBadge } from "@/components/Badges";
import { api, ApiError } from "@/lib/api";
import { Metric } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  sourceTypeLabels, sourceFormatLabels, updateFrequencyLabels,
  accessLevelLabels, storageLocationLabels, issueLabels,
} from "@/lib/labels";

function DetailView({ metric }: { metric: Metric }) {
  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BlockBadgeFull block={metric.block} />
          <StatusBadge status={metric.status} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{metric.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{metric.category}{metric.unit ? ` · ${metric.unit}` : ""}{metric.scope ? ` · ${metric.scope}` : ""}</p>
        {metric.definition && <p className="text-slate-700 mt-3">{metric.definition}</p>}
        {metric.standards.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {metric.standards.map((s) => (
              <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Источник данных</h2>
          {metric.source ? (
            <dl className="space-y-2 text-sm">
              <Row label="Тип" value={sourceTypeLabels[metric.source.source_type]} />
              <Row label="Система" value={metric.source.system_name || "—"} />
              <Row label="Частота" value={updateFrequencyLabels[metric.source.update_frequency]} />
              <Row label="Формат" value={sourceFormatLabels[metric.source.data_format]} />
            </dl>
          ) : <p className="text-sm text-slate-400">Нет данных</p>}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Ответственные</h2>
          {metric.responsible ? (
            <dl className="space-y-2 text-sm">
              <Row label="Подразделение" value={metric.responsible.department} />
              <Row label="Владелец" value={metric.responsible.data_owner || "—"} />
              <Row label="Steward" value={metric.responsible.data_steward || "—"} />
              <Row label="Email" value={metric.responsible.contact_email || "—"} />
              <Row label="Телефон" value={metric.responsible.contact_phone || "—"} />
              <Row label="Доступ" value={accessLevelLabels[metric.responsible.access_level]} />
            </dl>
          ) : <p className="text-sm text-slate-400">Нет данных</p>}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Хранение и качество</h2>
          {metric.storage_quality ? (
            <dl className="space-y-2 text-sm">
              <Row label="Локация" value={storageLocationLabels[metric.storage_quality.location]} />
              <Row label="Обновлено" value={metric.storage_quality.last_updated ? metric.storage_quality.last_updated.slice(0, 10) : "—"} />
              <Row label="Качество (ср.)" value={metric.storage_quality.quality_avg != null ? `${metric.storage_quality.quality_avg} / 5` : "—"} />
              <Row label="Проблемы" value={metric.storage_quality.issues.length ? metric.storage_quality.issues.map((i) => issueLabels[i] || i).join(", ") : "Нет"} />
            </dl>
          ) : <p className="text-sm text-slate-400">Нет данных</p>}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-800 text-right">{value}</dd>
    </div>
  );
}

function MetricDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const id = params.id as string;

  const [metric, setMetric] = useState<Metric | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Metric>(`/api/metrics/${id}`)
      .then(setMetric)
      .catch(() => setError("Запись не найдена"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(value: MetricFormValue) {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...value,
        scope: value.scope || null,
        storage_quality: { ...value.storage_quality, last_updated: value.storage_quality.last_updated || null },
      };
      const updated = await api.put<Metric>(`/api/metrics/${id}`, payload);
      setMetric(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить эту запись без возможности восстановления?")) return;
    try {
      await api.del(`/api/metrics/${id}`);
      router.push("/");
    } catch {
      setError("Не удалось удалить запись");
    }
  }

  if (loading) return <div className="card p-10 text-center text-slate-400">Загрузка...</div>;
  if (error && !metric) return <div className="card p-10 text-center text-red-600">{error}</div>;
  if (!metric) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← К каталогу
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            {!editing && (
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                Редактировать
              </button>
            )}
            {editing && (
              <button className="btn-secondary" onClick={() => setEditing(false)}>
                Отмена
              </button>
            )}
            <button className="btn-danger" onClick={handleDelete}>
              Удалить
            </button>
          </div>
        )}
      </div>

      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}

      {editing ? (
        <MetricForm initial={metricToFormValue(metric)} onSubmit={handleUpdate} submitLabel="Сохранить изменения" loading={saving} />
      ) : (
        <DetailView metric={metric} />
      )}
    </div>
  );
}

export default function MetricDetailPage() {
  return (
    <RequireAuth>
      <MetricDetailContent />
    </RequireAuth>
  );
}
