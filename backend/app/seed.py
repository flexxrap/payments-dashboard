from datetime import date, datetime, timedelta
from decimal import Decimal

from app.db.database import SessionLocal
from app.models import Act, Client, Payment, Project
from app.services import act_service


def reset(db):
    db.query(Act).delete()
    db.query(Payment).delete()
    db.query(Project).delete()
    db.query(Client).delete()
    db.commit()


def run():
    db = SessionLocal()
    reset(db)

    clients = [
        Client(name="ООО Ромашка", inn="7701234567", ogrn="1027700001111",
               bank_account="40702810500000001234", contact_person="Иван Петров"),
        Client(name="АО Технополис", inn="7812345678", ogrn="1037800002222",
               bank_account="40702810500000005678", contact_person="Мария Сидорова"),
        Client(name="ИП Кузнецов", inn="540812345678", ogrn="304540800003333",
               bank_account="40802810500000009012", contact_person="Алексей Кузнецов"),
        Client(name="ООО Северный Ветер", inn="6623456789", ogrn="1056600004444",
               bank_account="40702810500000003456", contact_person="Ольга Морозова"),
    ]
    db.add_all(clients)
    db.flush()

    projects = [
        Project(name="Редизайн сайта", client_id=clients[0].id, status="active"),
        Project(name="SMM продвижение", client_id=clients[0].id, status="active"),
        Project(name="Мобильное приложение", client_id=clients[1].id, status="active"),
        Project(name="Контекстная реклама", client_id=clients[2].id, status="paused"),
        Project(name="Брендбук", client_id=clients[3].id, status="completed"),
        Project(name="Лендинг к запуску", client_id=clients[3].id, status="active"),
    ]
    db.add_all(projects)
    db.flush()

    today = date.today()
    stages = ["Аналитика", "Дизайн", "Разработка", "Тестирование", "Поддержка"]

    rows = [
        (0, 0, 5, "120000.00", "Оплата по договору №1 за редизайн", "Аналитика", True, True),
        (0, 0, 40, "180000.00", "Второй транш за редизайн сайта", "Дизайн", True, False),
        (1, 0, 12, "75000.00", "Оплата SMM за месяц", "Поддержка", True, False),
        (1, 0, 60, "75000.00", "Оплата SMM за прошлый месяц", "Поддержка", True, False),
        (2, 1, 3, "300000.00", "Аванс по разработке приложения", "Разработка", False, False),
        (2, 1, 25, "300000.00", "Второй этап разработки приложения", "Разработка", True, True),
        (2, 1, 70, "150000.00", "Доработка приложения", "Тестирование", True, False),
        (3, 2, 8, "45000.00", "Настройка контекстной рекламы", "Аналитика", True, False),
        (3, 2, 50, "45000.00", "Ведение рекламной кампании", "Поддержка", True, False),
        (4, 3, 2, "90000.00", "Разработка брендбука", "Дизайн", False, False),
        (4, 3, 35, "90000.00", "Финальная версия брендбука", "Дизайн", True, True),
        (5, 3, 6, "60000.00", "Лендинг к запуску продукта", "Разработка", True, True),
        (5, 3, 15, "20000.00", "Правки по лендингу", "Разработка", True, False),
        (0, 0, 90, "50000.00", "Старая оплата за консультацию", "Аналитика", True, False),
        (2, 1, 1, "100000.00", "Свежий аванс на доработки", "Разработка", False, False),
    ]

    for project_idx, client_idx, days_ago, amount, purpose, stage, sent, signed in rows:
        payment = Payment(
            project_id=projects[project_idx].id,
            client_id=clients[client_idx].id,
            payment_date=today - timedelta(days=days_ago),
            amount=Decimal(amount),
            payment_purpose=purpose,
            service_stage=stage,
            invoice_number=f"INV-{1000 + days_ago}",
            contract_number=f"CT-{2024}-{project_idx + 1}",
        )
        db.add(payment)
        db.flush()

        act = Act(
            payment_id=payment.id,
            is_sent=sent,
            sent_at=datetime.utcnow() if sent else None,
            is_signed=signed,
            signed_at=datetime.utcnow() if signed else None,
            manager_comment="Ждем подписи клиента" if sent and not signed else None,
        )
        act_service.refresh_status(act, payment)
        db.add(act)

    db.commit()
    db.close()
    print("Seed completed.")


if __name__ == "__main__":
    run()
