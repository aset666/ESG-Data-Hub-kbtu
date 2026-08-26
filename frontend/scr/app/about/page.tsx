"use client";

import RequireAuth from "@/components/RequireAuth";

const glossary = [
  ["ESG", "Environmental, Social, Governance — экологические, социальные и управленческие факторы деятельности организации."],
  ["Scope 1", "Прямые выбросы парниковых газов от источников, принадлежащих организации (напр. собственный транспорт, котельные)."],
  ["Scope 2", "Косвенные выбросы от закупаемой энергии (электричество, тепло)."],
  ["Scope 3", "Прочие косвенные выбросы в цепочке создания ценности (поставщики, командировки, отходы и т.д.)."],
  ["GRI", "Global Reporting Initiative — международный стандарт нефинансовой отчётности."],
  ["SASB", "Sustainability Accounting Standards Board — отраслевые стандарты раскрытия ESG-информации."],
  ["TCFD", "Task Force on Climate-related Financial Disclosures — рекомендации по раскрытию климатических рисков."],
  ["SDGs", "Sustainable Development Goals — Цели устойчивого развития ООН."],
  ["STARS", "AASHE STARS — рейтинговая система устойчивости для вузов."],
  ["Data owner", "Владелец данных — подразделение или должность, ответственные за метрику по существу."],
  ["Data steward", "Ответственный за фактический сбор и внесение данных."],
  ["Gap", "Пробел — отсутствие данных, дублирование, ручной ввод без автоматизации и т.п."],
];

const statusMethodology = [
  ["Собирается", "Данные регулярно собираются, актуальны и доступны."],
  ["Частично", "Данные собираются, но неполно, нерегулярно или только по части подразделений."],
  ["Не собирается", "Данные по метрике в университете сейчас не собираются."],
  ["Планируется", "Сбор данных запланирован, но ещё не начат."],
];

function AboutContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">О системе</h1>
        <p className="text-slate-600 leading-relaxed">
          ESG Data Inventory System — централизованная система-инвентарь (каталог) всех ESG-данных университета:
          единая карта источников, метрик, владельцев и мест хранения. Система — основа data governance для ESG:
          помогает понять, какие данные уже есть, где их взять, кто отвечает, насколько они актуальны и качественны.
          Результат работы с системой — фундамент для будущей автоматизированной ESG-отчётности, дашбордов и аудита
          (STARS, QS Impact, THE, GRI, CSRD и др.).
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Методология заполнения</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
          <li>Определите блок ESG (E / S / G) и категорию, к которой относится показатель.</li>
          <li>Дайте чёткое определение метрики и единицу измерения, укажите соответствие стандартам (GRI, SASB, TCFD, SDGs, STARS).</li>
          <li>Укажите фактический источник данных: конкретную систему/файл, формат и частоту обновления.</li>
          <li>Назначьте владельца данных (подразделение) и ответственного за сбор (steward) с контактами.</li>
          <li>Оцените место хранения и качество данных по трём шкалам (1–5): полнота, точность, своевременность.</li>
          <li>Отметьте статус сбора и все выявленные проблемы (дубликаты, ручной ввод, отсутствие автоматизации).</li>
        </ol>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Статусы сбора данных</h2>
        <dl className="space-y-2 text-sm">
          {statusMethodology.map(([k, v]) => (
            <div key={k}>
              <dt className="font-semibold text-slate-700 inline">{k}: </dt>
              <dd className="text-slate-600 inline">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Глоссарий</h2>
        <dl className="divide-y divide-slate-100">
          {glossary.map(([term, def]) => (
            <div key={term} className="py-2">
              <dt className="font-semibold text-slate-700">{term}</dt>
              <dd className="text-slate-600 text-sm">{def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default function AboutPage() {
  return (
    <RequireAuth>
      <AboutContent />
    </RequireAuth>
  );
}
