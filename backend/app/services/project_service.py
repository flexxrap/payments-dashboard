from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models import Project
from app.services import act_service


def _overall_status(statuses: list[str]) -> str:
    if not statuses:
        return "not_sent"
    if "attention_required" in statuses:
        return "attention_required"
    if "waiting_signature" in statuses:
        return "waiting_signature"
    if all(s == "closed" for s in statuses):
        return "closed"
    return "not_sent"


def list_projects(db: Session) -> list[dict]:
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.client),
            joinedload(Project.payments),
        )
        .order_by(Project.created_at.desc())
        .all()
    )

    result = []
    for project in projects:
        total = Decimal("0")
        statuses = []
        closed = 0
        for payment in project.payments:
            total += payment.amount
            if payment.act:
                act_service.refresh_status(payment.act, payment)
                statuses.append(payment.act.status)
                if payment.act.status == "closed":
                    closed += 1

        result.append(
            {
                "id": project.id,
                "name": project.name,
                "status": project.status,
                "client_id": project.client_id,
                "client_name": project.client.name,
                "total_amount": total,
                "payments_count": len(project.payments),
                "closed_acts": closed,
                "open_acts": len(project.payments) - closed,
                "overall_act_status": _overall_status(statuses),
            }
        )

    return result
