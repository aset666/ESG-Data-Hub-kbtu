from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import Metric, MetricStatus, User
from app.schemas import HeatmapCell

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/heatmap", response_model=list[HeatmapCell])
def heatmap(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    metrics = db.query(Metric).options(joinedload(Metric.responsible)).all()

    grouped = defaultdict(lambda: {"total": 0, "collected": 0, "partial": 0, "not_collected": 0, "planned": 0})

    for m in metrics:
        dept = m.responsible.department if m.responsible else "Не указано"
        key = (dept, m.block.value)
        grouped[key]["total"] += 1
        grouped[key][m.status.value] += 1

    result = []
    for (dept, block), counts in grouped.items():
        collected_weight = counts["collected"] + 0.5 * counts["partial"]
        coverage = round((collected_weight / counts["total"]) * 100, 1) if counts["total"] else 0.0
        result.append(HeatmapCell(
            department=dept,
            block=block,
            total=counts["total"],
            collected=counts["collected"],
            partial=counts["partial"],
            not_collected=counts["not_collected"],
            planned=counts["planned"],
            coverage_pct=coverage,
        ))

    result.sort(key=lambda c: (c.department, c.block))
    return result


@router.get("/summary")
def summary(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    metrics = db.query(Metric).all()
    total = len(metrics)
    by_block = defaultdict(int)
    by_status = defaultdict(int)
    for m in metrics:
        by_block[m.block.value] += 1
        by_status[m.status.value] += 1
    return {
        "total": total,
        "by_block": dict(by_block),
        "by_status": dict(by_status),
    }
