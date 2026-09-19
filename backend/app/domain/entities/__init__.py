from app.domain.entities.facility import Facility
from app.domain.entities.patient import Patient
from app.domain.entities.referral import Referral
from app.domain.entities.risk_assesment import RiskAssessment
from app.domain.entities.staff import StaffMember
from app.domain.entities.vitals import VitalsReading

# Alias
EmergencyReferral = Referral

__all__ = [
    "Facility",
    "Patient",
    "StaffMember",
    "VitalsReading",
    "RiskAssessment",
    "Referral",
    "EmergencyReferral",
]
