from datetime import date, datetime, timedelta

from app.models import Act, Payment

ATTENTION_THRESHOLD_DAYS = 30


def compute_status(act: Act, payment: Payment, today: date | None = None) -> str:
    today = today or date.today()

    if act.is_sent and act.is_signed:
        return "closed"
    if not act.is_sent:
        return "not_sent"

    overdue = payment.payment_date < today - timedelta(days=ATTENTION_THRESHOLD_DAYS)
    return "attention_required" if overdue else "waiting_signature"


def apply_act_update(act: Act, payment: Payment, is_sent, is_signed, manager_comment) -> Act:
    now = datetime.utcnow()

    if is_sent is not None:
        act.is_sent = is_sent
        act.sent_at = now if is_sent else None
    if is_signed is not None:
        act.is_signed = is_signed
        act.signed_at = now if is_signed else None
    if manager_comment is not None:
        act.manager_comment = manager_comment

    if act.is_signed and not act.is_sent:
        act.is_sent = True
        act.sent_at = act.sent_at or now

    act.status = compute_status(act, payment)
    return act


def refresh_status(act: Act, payment: Payment) -> Act:
    act.status = compute_status(act, payment)
    return act
