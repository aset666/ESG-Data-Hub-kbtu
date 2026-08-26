"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import MetricForm, { MetricFormValue } from "@/components/MetricForm";
import { api, ApiError } from "@/lib/api";
import { Metric } from "@/lib/types";

function NewMetricContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(value: MetricFormValue) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...value,
        standards: value.standards,
        scope: value.scope || null,
        storage_quality: {
          ...value.storage_quality,
          last_updated: value.storage_quality.last_updated || null,
        },
      };
      const created = await api.post<Metric>("/api/metrics", payload);
      router.push(`/metrics/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось создать запись");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Новая ESG-запись</h1>
      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}
      <MetricForm onSubmit={handleSubmit} submitLabel="Создать запись" loading={loading} />
    </div>
  );
}

export default function NewMetricPage() {
  return (
    <RequireAuth adminOnly>
      <NewMetricContent />
    </RequireAuth>
  );
}
