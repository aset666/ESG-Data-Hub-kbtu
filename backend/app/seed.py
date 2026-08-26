"""
Скрипт заполнения базы тестовыми/демонстрационными данными.
Запуск: python -m app.seed
"""
import random
from datetime import datetime, timedelta

from app.auth import hash_password
from app.database import Base, engine, SessionLocal
from app.models import (
    User, UserRole, Metric, Source, Responsible, StorageQuality,
    ESGBlock, MetricStatus, SourceType, SourceFormat, UpdateFrequency,
    AccessLevel, StorageLocation,
)

random.seed(42)

DEPARTMENTS = [
    "Отдел энергетики и ЖКХ", "Отдел закупок", "HR-отдел", "Приёмная комиссия",
    "Волонтёрский центр", "Учебный отдел", "Отдел устойчивого развития",
    "Финансовый отдел", "Служба безопасности", "IT-отдел", "Библиотека",
    "Отдел международного сотрудничества",
]

STANDARD_SETS = [
    ["GRI"], ["GRI", "STARS"], ["SASB"], ["TCFD"], ["SDGs"], ["GRI", "SDGs"],
    ["STARS"], ["GRI", "TCFD"], ["SASB", "TCFD"], ["SDGs", "STARS"],
]

METRICS = [
    # E - Environment
    ("E", "Энергия", "Потребление электроэнергии", "кВт·ч/год", "Scope 2"),
    ("E", "Энергия", "Потребление тепловой энергии", "Гкал/год", "Scope 1"),
    ("E", "Энергия", "Доля возобновляемой энергии", "%", None),
    ("E", "Выбросы", "Прямые выбросы ПГ (Scope 1)", "т CO2-экв./год", "Scope 1"),
    ("E", "Выбросы", "Косвенные выбросы ПГ (Scope 2)", "т CO2-экв./год", "Scope 2"),
    ("E", "Выбросы", "Прочие косвенные выбросы (Scope 3)", "т CO2-экв./год", "Scope 3"),
    ("E", "Вода", "Общее потребление воды", "м³/год", None),
    ("E", "Вода", "Доля повторно используемой воды", "%", None),
    ("E", "Отходы", "Общий объём отходов", "тонн/год", None),
    ("E", "Отходы", "Доля переработанных отходов", "%", None),
    ("E", "Отходы", "Объём опасных отходов", "тонн/год", None),
    ("E", "Транспорт", "Выбросы от служебного транспорта", "т CO2-экв./год", "Scope 1"),
    ("E", "Транспорт", "Доля электротранспорта в парке", "%", None),
    ("E", "Земля и биоразнообразие", "Площадь зелёных насаждений кампуса", "га", None),
    ("E", "Закупки", "Доля «зелёных» закупок", "%", None),
    ("E", "Здания", "Доля зданий с сертификацией энергоэффективности", "%", None),
    # S - Social
    ("S", "Кадры", "Доля женщин в руководстве", "%", None),
    ("S", "Кадры", "Средняя зарплата по гендеру (разрыв)", "%", None),
    ("S", "Кадры", "Текучесть кадров", "%", None),
    ("S", "Кадры", "Часы обучения на сотрудника", "часов/год", None),
    ("S", "Студенты", "Доля студентов с инвалидностью", "%", None),
    ("S", "Студенты", "Доступность стипендий для малообеспеченных", "число студентов", None),
    ("S", "Студенты", "Удовлетворённость студентов (опрос)", "балл (1-5)", None),
    ("S", "Здоровье", "Число несчастных случаев на территории", "случаев/год", None),
    ("S", "Здоровье", "Охват медицинской страховкой сотрудников", "%", None),
    ("S", "Волонтёрство", "Часы волонтёрской деятельности студентов", "часов/год", None),
    ("S", "Сообщество", "Число социальных проектов с местным сообществом", "проектов/год", None),
    ("S", "Доступность", "Доля доступной для маломобильных групп инфраструктуры", "%", None),
    ("S", "Инклюзия", "Доля иностранных студентов", "%", None),
    ("S", "Безопасность", "Число зарегистрированных инцидентов дискриминации", "случаев/год", None),
    # G - Governance
    ("G", "Управление", "Доля независимых членов попечительского совета", "%", None),
    ("G", "Управление", "Наличие ESG-стратегии", "да/нет", None),
    ("G", "Этика", "Число обращений по горячей линии этики", "обращений/год", None),
    ("G", "Прозрачность", "Публикация нефинансовой отчётности", "да/нет", None),
    ("G", "Прозрачность", "Публикация бюджета вуза", "да/нет", None),
    ("G", "Риски", "Наличие реестра ESG-рисков", "да/нет", None),
    ("G", "Комплаенс", "Число случаев несоответствия нормативным требованиям", "случаев/год", None),
    ("G", "Закупки", "Доля закупок через открытые тендеры", "%", None),
    ("G", "Данные", "Наличие политики защиты персональных данных", "да/нет", None),
    ("G", "Антикоррупция", "Доля сотрудников, прошедших антикоррупционное обучение", "%", None),
    ("G", "Отчётность", "Своевременность подачи отчётности регуляторам", "%", None),
]

STATUSES = list(MetricStatus)
SOURCE_TYPES = list(SourceType)
FORMATS = list(SourceFormat)
FREQS = list(UpdateFrequency)
LOCATIONS = list(StorageLocation)
ACCESS = list(AccessLevel)
ISSUE_OPTIONS = ["missing", "duplicates", "manual", "no_automation"]

SYSTEM_NAMES = ["1С", "Excel (отдел энергетиков)", "Google Forms", "SAP ERP", "Внешний подрядчик по отходам",
                "HR-система (BambooHR)", "CRM приёмной комиссии", "Ручной журнал", "Портал Minio/S3", "Bitrix24"]

CONTACT_NAMES = ["И.А. Смагулова", "Б.Т. Ахметов", "К.С. Иванова", "Д.Р. Нурланов", "А.В. Петрова",
                  "М.К. Сериков", "Е.О. Ким", "Т.Ж. Байжанов"]


def rand_date(days_back_max=400):
    return datetime.utcnow() - timedelta(days=random.randint(0, days_back_max))


def build_metric(block, category, name, unit, scope, dept):
    status = random.choice(STATUSES)
    m = Metric(
        block=ESGBlock(block),
        category=category,
        name=name,
        definition=f"Показатель «{name}» отражает деятельность университета в категории «{category}» ({block}).",
        unit=unit,
        standards=random.choice(STANDARD_SETS),
        scope=scope,
        status=status,
    )
    return m, status


def build_source():
    return Source(
        source_type=random.choice(SOURCE_TYPES),
        system_name=random.choice(SYSTEM_NAMES),
        update_frequency=random.choice(FREQS),
        data_format=random.choice(FORMATS),
    )


def build_responsible(dept):
    return Responsible(
        department=dept,
        data_owner=random.choice(CONTACT_NAMES),
        data_steward=random.choice(CONTACT_NAMES),
        contact_email=f"steward{random.randint(1,999)}@university.edu",
        contact_phone=f"+7 (7xx) {random.randint(100,999)}-{random.randint(1000,9999)}",
        contact_messenger=random.choice(["Telegram: @esg_steward", "MS Teams", "—"]),
        access_level=random.choice(ACCESS),
    )


def build_storage(status):
    issues = random.sample(ISSUE_OPTIONS, k=random.randint(0, 2)) if status != MetricStatus.collected else []
    return StorageQuality(
        location=random.choice(LOCATIONS),
        last_updated=rand_date() if status in (MetricStatus.collected, MetricStatus.partial) else None,
        quality_completeness=random.randint(1, 5),
        quality_accuracy=random.randint(1, 5),
        quality_timeliness=random.randint(1, 5),
        issues=issues,
    )


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add(User(
                email="admin@university.edu",
                full_name="Администратор ESG Data Hub",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin,
            ))
            db.add(User(
                email="viewer@university.edu",
                full_name="Наблюдатель",
                hashed_password=hash_password("viewer123"),
                role=UserRole.viewer,
            ))
            db.commit()
            print("Пользователи созданы: admin@university.edu / admin123, viewer@university.edu / viewer123")

        if db.query(Metric).count() > 0:
            print("Метрики уже есть в базе — пропускаю сидирование.")
            return

        for block, category, name, unit, scope in METRICS:
            dept = random.choice(DEPARTMENTS)
            metric, status = build_metric(block, category, name, unit, scope, dept)
            db.add(metric)
            db.flush()

            source = build_source()
            source.metric_id = metric.id
            db.add(source)

            responsible = build_responsible(dept)
            responsible.metric_id = metric.id
            db.add(responsible)

            storage = build_storage(status)
            storage.metric_id = metric.id
            db.add(storage)

        db.commit()
        print(f"Создано {len(METRICS)} ESG-записей (метрики + источники + ответственные + хранение).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
