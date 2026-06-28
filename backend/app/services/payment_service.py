from sqlalchemy.orm import Session, joinedload

from app.models import Act, Client, Payment
from app.schemas.schemas import PaymentCreate
from app.services import act_service


def create_payment(db: Session, data: PaymentCreate) -> Payment:
    payment = Payment(**data.model_dump())
    db.add(payment)
    db.flush()

    act = Act(payment_id=payment.id, status="not_sent")
    db.add(act)
    db.commit()
    db.refresh(payment)
    return payment


def list_payments(db: Session, filters) -> list[Payment]:
    query = (
        db.query(Payment)
        .options(
            joinedload(Payment.client),
            joinedload(Payment.project),
            joinedload(Payment.act),
        )
    )

    if filters.get("project_id"):
        query = query.filter(Payment.project_id == filters["project_id"])
    if filters.get("client_id"):
        query = query.filter(Payment.client_id == filters["client_id"])
    if filters.get("date_from"):
        query = query.filter(Payment.payment_date >= filters["date_from"])
    if filters.get("date_to"):
        query = query.filter(Payment.payment_date <= filters["date_to"])
    if filters.get("service_stage"):
        query = query.filter(Payment.service_stage == filters["service_stage"])
    if filters.get("search"):
        term = f"%{filters['search']}%"
        query = query.join(Client, Payment.client_id == Client.id).filter(
            (Payment.payment_purpose.ilike(term)) | (Client.name.ilike(term))
        )

    payments = query.order_by(Payment.payment_date.desc()).all()

    for payment in payments:
        if payment.act:
            act_service.refresh_status(payment.act, payment)

    if filters.get("act_status"):
        payments = [
            p for p in payments if p.act and p.act.status == filters["act_status"]
        ]

    return payments
