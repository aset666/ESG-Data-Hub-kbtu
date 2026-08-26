"use client";

import { useState } from "react";
import { Metric, Source, Responsible, StorageQuality } from "@/lib/types";
import {
  standardOptions,
  sourceTypeLabels,
  sourceFormatLabels,
  updateFrequencyLabels,
  accessLevelLabels,
  storageLocationLabels,
  issueLabels,
  statusLabels,
} from "@/lib/labels";

export interface MetricFormValue {
  block: string;
  category: string;
  name: string;
  definition: string;
  unit: string;
  standards: string[];
  scope: string;
  status: string;
  source: Source;
  responsible: Responsible;
  storage_quality: StorageQuality;
}

const defaultValue: MetricFormValue = {
  block: "E",
  category: "",
  name: "",
  definition: "",
  unit: "",
  standards: [],
  scope: "",
  status: "planned",
  source: { source_type: "manual_input", system_name: "", update_frequency: "yearly", data_format: "excel" },
  responsible: { department: "", data_owner: "", data_steward: "", contact_email: "", contact_phone: "", contact_messenger: "", access_level: "internal" },
  storage_quality: { location: "local_server", last_updated: "", quality_completeness: 3, quality_accuracy: 3, quality_timeliness: 3, issues: [] },
};

export function metricToFormValue(m: Metric): MetricFormValue {
  return {
    block: m.block,
    category: m.category,
    name: m.name,
    definition: m.definition || "",
    unit: m.unit || "",
    standards: m.standards || [],
    scope: m.scope || "",
    status: m.status,
    source: m.source || defaultValue.source,
    responsible: m.responsible || defaultValue.responsible,
    storage_quality: {
      ...(m.storage_quality || defaultValue.storage_quality),
      last_updated: m.storage_quality?.last_updated ? m.storage_quality.last_updated.slice(0, 10) : "",
    },
  };
}

export default function MetricForm({
  initial,
  onSubmit,
  submitLabel,
  loading,
}: {
  initial?: MetricFormValue;
  onSubmit: (value: MetricFormValue) => void;
  submitLabel: string;
  loading: boolean;
}) {
  const [value, setValue] = useState<MetricFormValue>(initial || defaultValue);

  function set<K extends keyof MetricFormValue>(key: K, v: MetricFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }
  function setSource<K extends keyof Source>(key: K, v: Source[K]) {
    setValue((prev) => ({ ...prev, source: { ...prev.source, [key]: v } }));
  }
  function setResponsible<K extends keyof Responsible>(key: K, v: Responsible[K]) {
    setValue((prev) => ({ ...prev, responsible: { ...prev.responsible, [key]: v } }));
  }
  function setStorage<K extends keyof StorageQuality>(key: K, v: StorageQuality[K]) {
    setValue((prev) => ({ ...prev, storage_quality: { ...prev.storage_quality, [key]: v } }));
  }
  function toggleStandard(s: string) {
    set("standards", value.standards.includes(s) ? value.standards.filter((x) => x !== s) : [...value.standards, s]);
  }
  function toggleIssue(i: string) {
    setStorage("issues", value.storage_quality.issues.includes(i) ? value.storage_quality.issues.filter((x) => x !== i) : [...value.storage_quality.issues, i]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Метрика */}
      <section className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">1. Метрика и показатель</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Блок ESG *</label>
            <select className="input" required value={value.block} onChange={(e) => set("block", e.target.value)}>
              <option value="E">E — Экология</option>
              <option value="S">S — Социальная сфера</option>
              <option value="G">G — Управление</option>
            </select>
          </div>
          <div>
            <label className="label">Категория / раздел *</label>
            <input className="input" required value={value.category} onChange={(e) => set("category", e.target.value)} placeholder="Напр. Энергия, Кадры, Этика" />
          </div>
          <div>
            <label className="label">Scope (для E, опционально)</label>
            <select className="input" value={value.scope} onChange={(e) => set("scope", e.target.value)}>
              <option value="">—</option>
              <option value="Scope 1">Scope 1</option>
              <option value="Scope 2">Scope 2</option>
              <option value="Scope 3">Scope 3</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Название метрики *</label>
          <input className="input" required value={value.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Определение</label>
          <textarea className="input" rows={2} value={value.definition} onChange={(e) => set("definition", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Единица измерения</label>
            <input className="input" value={value.unit} onChange={(e) => set("unit", e.target.value)} placeholder="кВт·ч, %, т CO2-экв." />
          </div>
          <div>
            <label className="label">Статус сбора *</label>
            <select className="input" required value={value.status} onChange={(e) => set("status", e.target.value)}>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Соответствие стандартам</label>
          <div className="flex flex-wrap gap-2">
            {standardOptions.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleStandard(s)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  value.standards.includes(s) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Источник */}
      <section className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">2. Источник данных</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Тип источника *</label>
            <select className="input" required value={value.source.source_type} onChange={(e) => setSource("source_type", e.target.value as Source["source_type"])}>
              {Object.entries(sourceTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Система / файл</label>
            <input className="input" value={value.source.system_name || ""} onChange={(e) => setSource("system_name", e.target.value)} placeholder="1С, Excel, Google Forms..." />
          </div>
          <div>
            <label className="label">Формат *</label>
            <select className="input" required value={value.source.data_format} onChange={(e) => setSource("data_format", e.target.value as Source["data_format"])}>
              {Object.entries(sourceFormatLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Частота обновления *</label>
            <select className="input" required value={value.source.update_frequency} onChange={(e) => setSource("update_frequency", e.target.value as Source["update_frequency"])}>
              {Object.entries(updateFrequencyLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Ответственные */}
      <section className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">3. Ответственные подразделения и роли</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Подразделение (владелец данных) *</label>
            <input className="input" required value={value.responsible.department} onChange={(e) => setResponsible("department", e.target.value)} />
          </div>
          <div>
            <label className="label">Уровень доступа *</label>
            <select className="input" required value={value.responsible.access_level} onChange={(e) => setResponsible("access_level", e.target.value as Responsible["access_level"])}>
              {Object.entries(accessLevelLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Владелец данных (ФИО / должность)</label>
            <input className="input" value={value.responsible.data_owner || ""} onChange={(e) => setResponsible("data_owner", e.target.value)} />
          </div>
          <div>
            <label className="label">Ответственный за сбор (steward)</label>
            <input className="input" value={value.responsible.data_steward || ""} onChange={(e) => setResponsible("data_steward", e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={value.responsible.contact_email || ""} onChange={(e) => setResponsible("contact_email", e.target.value)} />
          </div>
          <div>
            <label className="label">Телефон</label>
            <input className="input" value={value.responsible.contact_phone || ""} onChange={(e) => setResponsible("contact_phone", e.target.value)} />
          </div>
          <div>
            <label className="label">Мессенджер (Teams / Telegram)</label>
            <input className="input" value={value.responsible.contact_messenger || ""} onChange={(e) => setResponsible("contact_messenger", e.target.value)} />
          </div>
        </div>
      </section>

      {/* 4. Хранение и качество */}
      <section className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">4. Структура хранения и качество</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Где хранится *</label>
            <select className="input" required value={value.storage_quality.location} onChange={(e) => setStorage("location", e.target.value as StorageQuality["location"])}>
              {Object.entries(storageLocationLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Дата последнего обновления</label>
            <input type="date" className="input" value={value.storage_quality.last_updated || ""} onChange={(e) => setStorage("last_updated", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Полнота (1–5): {value.storage_quality.quality_completeness}</label>
            <input type="range" min={1} max={5} className="w-full" value={value.storage_quality.quality_completeness} onChange={(e) => setStorage("quality_completeness", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Точность (1–5): {value.storage_quality.quality_accuracy}</label>
            <input type="range" min={1} max={5} className="w-full" value={value.storage_quality.quality_accuracy} onChange={(e) => setStorage("quality_accuracy", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Своевременность (1–5): {value.storage_quality.quality_timeliness}</label>
            <input type="range" min={1} max={5} className="w-full" value={value.storage_quality.quality_timeliness} onChange={(e) => setStorage("quality_timeliness", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label">Проблемы / gaps</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(issueLabels).map(([k, v]) => (
              <button
                type="button"
                key={k}
                onClick={() => toggleIssue(k)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  value.storage_quality.issues.includes(k) ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Сохранение..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
