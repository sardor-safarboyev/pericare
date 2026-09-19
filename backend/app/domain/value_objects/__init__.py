from app.domain.value_objects.perinatal import (
    ActionTakenType,
    BloodPressure,
    FacilityType,
    ObstetricSyndrome,
    ProteinuriaLevel,
    ReferralStatus,
    RiskZone,
    UserRole,
)

# Aliaslar (boshqa joylarda ClinicalSyndrome yoki StaffRole deb import qilingan bo'lsa xato bermasligi uchun)
ClinicalSyndrome = ObstetricSyndrome
StaffRole = UserRole

__all__ = [
    "RiskZone",
    "ObstetricSyndrome",
    "ClinicalSyndrome",
    "ProteinuriaLevel",
    "ReferralStatus",
    "ActionTakenType",
    "UserRole",
    "StaffRole",
    "FacilityType",
    "BloodPressure",
]
