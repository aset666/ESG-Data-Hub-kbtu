from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import Metric, Source, Responsible, StorageQuality, AuditLog, User, ESGBlock, MetricStatus
from app.schemas import MetricCreate, MetricUpdate, MetricOut, MetricListOut

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


def _log(db: Session, user: User, action: str, entity_id: str, entity_name: str, details: str = None):
    db.add(AuditLog(
        user_email=user.email,
        action=action,
        entity_type="metric",
        entity_id=entity_id,
        entity_name=entity_name,
        details=details,
    ))


def _metric_query(db: Session):
    return db.query(Metric).options(
        joinedload(Metric.source),
        joinedload(Metric.responsible),
        joinedload(Metric.storage_quality),
    )


@router.get("", response_model=MetricListOut)
def list_metrics(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
    block: Optional[ESGBlock] = None,
    status_filter: Optional[MetricStatus] = Query(None, alias="status"),
    department: Optional[str] = None,
    standard: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    q = _metric_query(db)

    if block:
        q = q.filter(Metric.block == block)
    if status_filter:
        q = q.filter(Metric.status == status_filter)
    if department:
        q = q.join(Responsible).filter(Responsible.department.ilike(f"%{department}%"))
    if standard:
        # JSON list contains value (works for Postgres JSON via python-side filter fallback)
        pass
    if search:
        like = f"%{search}%"
        q = q.filter(or_(Metric.name.ilike(like), Metric.definition.ilike(like), Metric.category.ilike(like)))

    total = q.count()
    items = q.order_by(Metric.block, Metric.category, Metric.name).offset((page - 1) * page_size).limit(page_size).all()

    if standard:
        items = [m for m in items if standard in (m.standards or [])]
        total = len(items)

    return MetricListOut(total=total, items=items)


@router.get("/{metric_id}", response_model=MetricOut)
def get_metric(metric_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    metric = _metric_query(db).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Метрика не найдена")
    return metric


@router.post("", response_model=MetricOut)
def create_metric(payload: MetricCreate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    metric = Metric(
        block=payload.block,
        category=payload.category,
        name=payload.name,
        definition=payload.definition,
        unit=payload.unit,
        standards=payload.standards,
        scope=payload.scope,
        status=payload.status,
    )
    db.add(metric)
    db.flush()

    db.add(Source(metric_id=metric.id, **payload.source.model_dump()))
    db.add(Responsible(metric_id=metric.id, **payload.responsible.model_dump()))
    db.add(StorageQuality(metric_id=metric.id, **payload.storage_quality.model_dump()))

    _log(db, user, "create", metric.id, metric.name)
    db.commit()

    return _metric_query(db).filter(Metric.id == metric.id).first()


@router.put("/{metric_id}", response_model=MetricOut)
def update_metric(metric_id: str, payload: MetricUpdate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Метрика не найдена")

    for field, value in payload.model_dump(exclude={"source", "responsible", "storage_quality"}).items():
        setattr(metric, field, value)
    metric.updated_at = datetime.utcnow()

    if metric.source:
        for field, value in payload.source.model_dump().items():
            setattr(metric.source, field, value)
    if metric.responsible:
        for field, value in payload.responsible.model_dump().items():
            setattr(metric.responsible, field, value)
    if metric.storage_quality:
        for field, value in payload.storage_quality.model_dump().items():
            setattr(metric.storage_quality, field, value)

    _log(db, user, "update", metric.id, metric.name)
    db.commit()

    return _metric_query(db).filter(Metric.id == metric.id).first()


@router.delete("/{metric_id}")
def delete_metric(metric_id: str, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Метрика не найдена")
    name = metric.name
    _log(db, user, "delete", metric.id, name)
    db.delete(metric)
    db.commit()
    return {"ok": True}
