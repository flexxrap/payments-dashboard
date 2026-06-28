from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Payment
from app.schemas.schemas import ActOut, ActUpdate, PaymentCreate, PaymentOut
from app.services import act_service, payment_service

router = APIRouter(prefix="/api/payments", tags=["payments"])


def serialize_payment(payment: Payment) -> PaymentOut:
    return PaymentOut(
        id=payment.id,
        project_id=payment.project_id,
        client_id=payment.client_id,
        payment_date=payment.payment_date,
        amount=payment.amount,
        payment_purpose=payment.payment_purpose,
        service_stage=payment.service_stage,
        invoice_number=payment.invoice_number,
        contract_number=payment.contract_number,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
        client_name=payment.client.name,
        project_name=payment.project.name,
        act=ActOut.model_validate(payment.act) if payment.act else None,
    )


@router.get("", response_model=list[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    project_id: Optional[int] = Query(None),
    client_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    act_status: Optional[str] = Query(None),
    service_stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    filters = {
        "project_id": project_id,
        "client_id": client_id,
        "date_from": date_from,
        "date_to": date_to,
        "act_status": act_status,
        "service_stage": service_stage,
        "search": search,
    }
    payments = payment_service.list_payments(db, filters)
    return [serialize_payment(p) for p in payments]


@router.post("", response_model=PaymentOut, status_code=201)
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    payment = payment_service.create_payment(db, data)
    return serialize_payment(payment)


@router.patch("/{payment_id}/act", response_model=PaymentOut)
def update_act(payment_id: int, data: ActUpdate, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or not payment.act:
        raise HTTPException(status_code=404, detail="Payment or act not found")

    act_service.apply_act_update(
        payment.act, payment, data.is_sent, data.is_signed, data.manager_comment
    )
    db.commit()
    db.refresh(payment)
    return serialize_payment(payment)
