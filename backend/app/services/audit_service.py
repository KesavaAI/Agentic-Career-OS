from app.models.audit import AuditLog
from sqlalchemy.orm import Session
from typing import Optional

class AuditService:
    @staticmethod
    def log(db: Session, user_email: str, action: str, object_type: str, object_id: Optional[int] = None, prev_val: Optional[str] = None, new_val: Optional[str] = None):
        try:
            entry = AuditLog(
                user_email=user_email,
                action=action,
                object_type=object_type,
                object_id=object_id,
                previous_value=prev_val,
                new_value=new_val
            )
            db.add(entry)
            db.commit()
        except Exception as e:
            db.rollback()

audit_service = AuditService()
