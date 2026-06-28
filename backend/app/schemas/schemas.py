from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ClientBase(BaseModel):
    name: str
    inn: str
    ogrn: Optional[str] = None
    bank_account: Optional[str] = None
    contact_person: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientOut(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    client_id: int
    status: str = "active"


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    id: int
    name: str
    status: str
    client_id: int
    client_name: str
    total_amount: Decimal
    payments_count: int
    closed_acts: int
    open_acts: int
    overall_act_status: str


class ActOut(BaseModel):
    id: int
    payment_id: int
    is_sent: bool
    sent_at: Optional[datetime] = None
    is_signed: bool
    signed_at: Optional[datetime] = None
    status: str
    manager_comment: Optional[str] = None

    class Config:
        from_attributes = True


class ActUpdate(BaseModel):
    is_sent: Optional[bool] = None
    is_signed: Optional[bool] = None
    manager_comment: Optional[str] = None


class PaymentBase(BaseModel):
    project_id: int
    client_id: int
    payment_date: date
    amount: Decimal
    payment_purpose: Optional[str] = None
    service_stage: Optional[str] = None
    invoice_number: Optional[str] = None
    contract_number: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentOut(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    client_name: str
    project_name: str
    act: Optional[ActOut] = None

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_amount: Decimal
    total_projects: int
    total_payments: int
    closed_amount: Decimal
    not_closed_amount: Decimal
    payments_without_act: int
    payments_waiting_signature: int
