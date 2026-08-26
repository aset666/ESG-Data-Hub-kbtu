from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import (
    UserRole, ESGBlock, MetricStatus, SourceType, SourceFormat,
    UpdateFrequency, AccessLevel, StorageLocation
)


# ---------- Auth / Users ----------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.viewer


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    role: UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Source ----------

class SourceBase(BaseModel):
    source_type: SourceType
    system_name: Optional[str] = None
    update_frequency: UpdateFrequency = UpdateFrequency.yearly
    data_format: SourceFormat = SourceFormat.excel


class SourceOut(SourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


# ---------- Responsible ----------

class ResponsibleBase(BaseModel):
    department: str
    data_owner: Optional[str] = None
    data_steward: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_messenger: Optional[str] = None
    access_level: AccessLevel = AccessLevel.internal


class ResponsibleOut(ResponsibleBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


# ---------- Storage / Quality ----------

class StorageQualityBase(BaseModel):
    location: StorageLocation = StorageLocation.local_server
    last_updated: Optional[datetime] = None
    quality_completeness: int = 3
    quality_accuracy: int = 3
    quality_timeliness: int = 3
    issues: List[str] = []


class StorageQualityOut(StorageQualityBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    quality_avg: Optional[float] = None


# ---------- Metric ----------

class MetricBase(BaseModel):
    block: ESGBlock
    category: str
    name: str
    definition: Optional[str] = None
    unit: Optional[str] = None
    standards: List[str] = []
    scope: Optional[str] = None
    status: MetricStatus = MetricStatus.planned


class MetricCreate(MetricBase):
    source: SourceBase
    responsible: ResponsibleBase
    storage_quality: StorageQualityBase


class MetricUpdate(MetricBase):
    source: SourceBase
    responsible: ResponsibleBase
    storage_quality: StorageQualityBase


class MetricOut(MetricBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    source: Optional[SourceOut] = None
    responsible: Optional[ResponsibleOut] = None
    storage_quality: Optional[StorageQualityOut] = None


class MetricListOut(BaseModel):
    total: int
    items: List[MetricOut]


# ---------- Audit ----------

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    timestamp: datetime
    user_email: str
    action: str
    entity_type: str
    entity_id: str
    entity_name: Optional[str] = None
    details: Optional[str] = None


# ---------- Heatmap / stats ----------

class HeatmapCell(BaseModel):
    department: str
    block: ESGBlock
    total: int
    collected: int
    partial: int
    not_collected: int
    planned: int
    coverage_pct: float
