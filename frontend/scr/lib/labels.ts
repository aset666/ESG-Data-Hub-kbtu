export const blockLabels: Record<string, string> = {
  E: "Environment (Экология)",
  S: "Social (Социальная сфера)",
  G: "Governance (Управление)",
};

export const blockColors: Record<string, string> = {
  E: "bg-blue-100 text-blue-700 border-blue-200",
  S: "bg-amber-100 text-amber-700 border-amber-200",
  G: "bg-violet-100 text-violet-700 border-violet-200",
};

export const statusLabels: Record<string, string> = {
  collected: "Собирается",
  partial: "Частично",
  not_collected: "Не собирается",
  planned: "Планируется",
};

export const statusColors: Record<string, string> = {
  collected: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  not_collected: "bg-red-100 text-red-700",
  planned: "bg-slate-200 text-slate-600",
};

export const sourceTypeLabels: Record<string, string> = {
  internal_report: "Внутренний отчёт",
  external_provider: "Внешний поставщик",
  meter: "Счётчик",
  survey: "Опрос",
  erp: "ERP-система",
  manual_input: "Ручной ввод",
};

export const sourceFormatLabels: Record<string, string> = {
  csv: "CSV",
  excel: "Excel",
  api: "API",
  pdf: "PDF",
  database: "База данных",
  paper: "Бумага",
};

export const updateFrequencyLabels: Record<string, string> = {
  monthly: "Ежемесячно",
  quarterly: "Ежеквартально",
  yearly: "Ежегодно",
  once: "Разово",
  irregular: "Нерегулярно",
};

export const accessLevelLabels: Record<string, string> = {
  public: "Публичный",
  internal: "Внутренний",
  sensitive: "Чувствительный",
};

export const storageLocationLabels: Record<string, string> = {
  sharepoint: "SharePoint",
  google_drive: "Google Drive",
  local_server: "Локальный сервер",
  cloud: "Облако",
  paper: "Бумага",
  database: "База данных",
};

export const issueLabels: Record<string, string> = {
  missing: "Отсутствует",
  duplicates: "Дубликаты",
  manual: "Ручной ввод",
  no_automation: "Нет автоматизации",
};

export const standardOptions = ["GRI", "SASB", "TCFD", "SDGs", "STARS"];
