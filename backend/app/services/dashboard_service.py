from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models import Payment, Project
from app.services import act_service


def build_summary(db: Session) -> dict:
    payments = (
        db.query(Payment).options(joinedload(Payment.act)).all()
    )

    total_amount = Decimal("0")
    closed_amount = Decimal("0")
    not_closed_amount = Decimal("0")
    payments_without_act = 0
    payments_waiting_signature = 0

    for payment in payments:
        total_amount += payment.amount
        if not payment.act:
            payments_without_act += 1
            not_closed_amount += payment.amount
            continue

        act_service.refresh_status(payment.act, payment)
        if payment.act.status == "closed":
            closed_amount += payment.amount
        else:
            not_closed_amount += payment.amount
        if not payment.act.is_sent:
            payments_without_act += 1
        if payment.act.status == "waiting_signature":
            payments_waiting_signature += 1

    return {
        "total_amount": total_amount,
        "total_projects": db.query(Project).count(),
        "total_payments": len(payments),
        "closed_amount": closed_amount,
        "not_closed_amount": not_closed_amount,
        "payments_without_act": payments_without_act,
        "payments_waiting_signature": payments_waiting_signature,
    }
