import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class FacilityModel(Base):
    __tablename__ = "facilities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    facility_type: Mapped[str] = mapped_column(String(50), nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    region: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)


class StaffModel(Base):
    __tablename__ = "staff"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    facility_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False
    )
    telegram_user_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    facility = relationship("FacilityModel")


class PatientModel(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    pinfl: Mapped[str | None] = mapped_column(String(14), unique=True, nullable=True, index=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gestational_week: Mapped[int] = mapped_column(Integer, nullable=False)
    home_facility_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    history_hypertension: Mapped[bool] = mapped_column(Boolean, default=False)
    history_preeclampsia: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    vitals = relationship(
        "VitalsReadingModel", back_populates="patient", cascade="all, delete-orphan"
    )


class VitalsReadingModel(Base):
    __tablename__ = "vitals_readings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id"), nullable=True
    )
    systolic_bp: Mapped[int] = mapped_column(Integer, nullable=False)
    diastolic_bp: Mapped[int] = mapped_column(Integer, nullable=False)
    heart_rate: Mapped[int] = mapped_column(Integer, nullable=False)
    body_temp: Mapped[float] = mapped_column(Float, nullable=False, default=36.6)
    blood_sugar: Mapped[float | None] = mapped_column(Float, nullable=True)
    proteinuria: Mapped[str] = mapped_column(String(20), nullable=False)
    respiratory_rate: Mapped[int] = mapped_column(Integer, default=18)
    raw_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_synced_offline: Mapped[bool] = mapped_column(Boolean, default=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, index=True
    )

    patient = relationship("PatientModel", back_populates="vitals")


class RiskAssessmentModel(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    vitals_reading_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vitals_readings.id", ondelete="CASCADE"), nullable=False
    )
    risk_zone: Mapped[str] = mapped_column(String(20), nullable=False)
    syndrome: Mapped[str] = mapped_column(String(50), nullable=False)
    shock_index: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    velocity_score: Mapped[float] = mapped_column(Numeric(4, 2), default=0.0)
    top_factors: Mapped[dict] = mapped_column(JSON, default=dict)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)


class ReferralModel(Base):
    __tablename__ = "referrals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False
    )
    risk_assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("risk_assessments.id"), nullable=False
    )
    from_facility_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False
    )
    to_facility_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False, index=True
    )
    assigned_specialist_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="open", index=True)
    sla_expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    action_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action_notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
