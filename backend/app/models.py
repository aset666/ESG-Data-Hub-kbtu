import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey,
    Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    admin = "admin"
    viewer = "viewer"


class ESGBlock(str, enum.Enum):
    E = "E"
    S = "S"
    G = "G"


class MetricStatus(str, enum.Enum):
    collected = "collected"          # собирается
    not_collected = "not_collected"  # не собирается
    partial = "partial"              # частично
    planned = "planned"              # планируется


class SourceType(str, enum.Enum):
    internal_report = "internal_report"
    external_provider = "external_provider"
    meter = "meter"
    survey = "survey"
    erp = "erp"
    manual_input = "manual_input"


class SourceFormat(str, enum.Enum):
    csv = "csv"
    excel = "excel"
    api = "api"
    pdf = "pdf"
    database = "database"
    paper = "paper"


class UpdateFrequency(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"
    once = "once"
    irregular = "irregular"


class AccessLevel(str, enum.Enum):
    public = "public"
    internal = "internal"
    sensitive = "sensitive"


class StorageLocation(str, enum.Enum):
    sharepoint = "sharepoint"
    google_drive = "google_drive"
    local_server = "local_server"
    cloud = "cloud"
    paper = "paper"
    database = "database"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.viewer)
    created_at = Column(DateTime, default=datetime.utcnow)


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    block = Column(SAEnum(ESGBlock), nullable=False, index=True)
    category = Column(String, nullable=False)          # подкатегория / раздел
    name = Column(String, nullable=False)
    definition = Column(Text, nullable=True)
    unit = Column(String, nullable=True)
    standards = Column(JSON, default=list)              # ["GRI","SASB","TCFD","SDGs","STARS"]
    scope = Column(String, nullable=True)                # Scope 1/2/3 для E, либо null
    status = Column(SAEnum(MetricStatus), nullable=False, default=MetricStatus.planned)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source = relationship("Source", uselist=False, back_populates="metric", cascade="all, delete-orphan")
    responsible = relationship("Responsible", uselist=False, back_populates="metric", cascade="all, delete-orphan")
    storage_quality = relationship("StorageQuality", uselist=False, back_populates="metric", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    metric_id = Column(UUID(as_uuid=False), ForeignKey("metrics.id"), unique=True, nullable=False)

    source_type = Column(SAEnum(SourceType), nullable=False)
    system_name = Column(String, nullable=True)          # напр. "1С", "Excel энергетиков"
    update_frequency = Column(SAEnum(UpdateFrequency), nullable=False, default=UpdateFrequency.yearly)
    data_format = Column(SAEnum(SourceFormat), nullable=False, default=SourceFormat.excel)

    metric = relationship("Metric", back_populates="source")


class Responsible(Base):
    __tablename__ = "responsibles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    metric_id = Column(UUID(as_uuid=False), ForeignKey("metrics.id"), unique=True, nullable=False)

    department = Column(String, nullable=False)          # факультет / отдел
    data_owner = Column(String, nullable=True)            # должность / ФИО
    data_steward = Column(String, nullable=True)          # ответственный за сбор
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    contact_messenger = Column(String, nullable=True)
    access_level = Column(SAEnum(AccessLevel), nullable=False, default=AccessLevel.internal)

    metric = relationship("Metric", back_populates="responsible")


class StorageQuality(Base):
    __tablename__ = "storage_quality"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    metric_id = Column(UUID(as_uuid=False), ForeignKey("metrics.id"), unique=True, nullable=False)

    location = Column(SAEnum(StorageLocation), nullable=False, default=StorageLocation.local_server)
    last_updated = Column(DateTime, nullable=True)
    quality_completeness = Column(Integer, default=3)   # 1-5
    quality_accuracy = Column(Integer, default=3)        # 1-5
    quality_timeliness = Column(Integer, default=3)      # 1-5
    issues = Column(JSON, default=list)                  # ["missing","duplicates","manual","no_automation"]

    metric = relationship("Metric", back_populates="storage_quality")

    @property
    def quality_avg(self):
        vals = [v for v in [self.quality_completeness, self.quality_accuracy, self.quality_timeliness] if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else None


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)        # create / update / delete
    entity_type = Column(String, nullable=False)   # metric
    entity_id = Column(String, nullable=False)
    entity_name = Column(String, nullable=True)
    details = Column(Text, nullable=True)
