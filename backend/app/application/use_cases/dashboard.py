from typing import Any
from uuid import UUID

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.domain.exceptions.domain_exceptions import DomainError
from app.domain.value_objects.perinatal import UserRole


class GetDashboardStatsUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, staff_id: UUID) -> dict[str, Any]:
        async with self.uow:
            current_staff = await self.uow.staff.get_by_id(staff_id)
            if not current_staff:
                raise DomainError(f"Xodim topilmadi: {staff_id}")

            facility = await self.uow.facilities.get_by_id(current_staff.facility_id)
            if not facility:
                raise DomainError("Muassasa topilmadi")

            # 1. Hamshira / QVP paneli
            if current_staff.role == UserRole.NURSE:
                patients = await self.uow.patients.list_by_facility(facility.id)
                active_referrals = await self.uow.referrals.list_active_by_facility(facility.id)
                return {
                    "role": current_staff.role.value,
                    "facility_name": facility.name,
                    "total_assigned_patients": len(patients),
                    "active_alerts_count": len(active_referrals),
                    "active_referrals": active_referrals,
                }

            # 2. Tuman Akusher-Ginekologi paneli
            elif current_staff.role == UserRole.DISTRICT_SPECIALIST:
                referrals = await self.uow.referrals.list_active_by_facility(facility.id)
                counts = await self.uow.referrals.get_counts_by_status(facility.id)
                return {
                    "role": current_staff.role.value,
                    "district": facility.district,
                    "active_referrals": referrals,
                    "statistics": counts,
                }

            # 3. Viloyat OvaBMU Dispetcherlik Markazi (Eng kritik monitoring)
            elif current_staff.role == UserRole.REGIONAL_SPECIALIST:
                regional_referrals = await self.uow.referrals.list_active_by_region(facility.region)
                counts = await self.uow.referrals.get_counts_by_status()
                return {
                    "role": current_staff.role.value,
                    "region": facility.region,
                    "total_active_critical": len(regional_referrals),
                    "critical_queue": regional_referrals,
                    "regional_statistics": counts,
                }

            # 4. Auditor / Sug'urta jamg'armasi
            else:
                counts = await self.uow.referrals.get_counts_by_status()
                return {
                    "role": current_staff.role.value,
                    "audit_summary": counts,
                }
