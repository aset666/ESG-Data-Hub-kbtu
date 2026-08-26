from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogOut

router = APIRouter(prefix="/api/audit-log", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_log(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
    limit: int = Query(100, ge=1, le=500),
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
