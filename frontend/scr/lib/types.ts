export type ESGBlock = "E" | "S" | "G";
export type MetricStatus = "collected" | "not_collected" | "partial" | "planned";
export type UserRole = "admin" | "viewer";

export type SourceType = "internal_report" | "external_provider" | "meter" | "survey" | "erp" | "manual_input";
export type SourceFormat = "csv" | "excel" | "api" | "pdf" | "database" | "paper";
export type UpdateFrequency = "monthly" | "quarterly" | "yearly" | "once" | "irregular";
export type AccessLevel = "public" | "internal" | "sensitive";
export type StorageLocation = "sharepoint" | "google_drive" | "local_server" | "cloud" | "paper" | "database";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Source {
  id?: string;
  source_type: SourceType;
  system_name?: string;
  update_frequency: UpdateFrequency;
  data_format: SourceFormat;
}

export interface Responsible {
  id?: string;
  department: string;
  data_owner?: string;
  data_steward?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_messenger?: string;
  access_level: AccessLevel;
}

export interface StorageQuality {
  id?: string;
  location: StorageLocation;
  last_updated?: string | null;
  quality_completeness: number;
  quality_accuracy: number;
  quality_timeliness: number;
  issues: string[];
  quality_avg?: number;
}

export interface Metric {
  id: string;
  block: ESGBlock;
  category: string;
  name: string;
  definition?: string;
  unit?: string;
  standards: string[];
  scope?: string | null;
  status: MetricStatus;
  created_at: string;
  updated_at: string;
  source?: Source;
  responsible?: Responsible;
  storage_quality?: StorageQuality;
}

export interface MetricListResponse {
  total: number;
  items: Metric[];
}

export interface HeatmapCell {
  department: string;
  block: ESGBlock;
  total: number;
  collected: number;
  partial: number;
  not_collected: number;
  planned: number;
  coverage_pct: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  details?: string;
}
