from typing import Any, Dict, Sequence

from app.application.ports.unit_of_work import UnitOfWorkPort


class GetDistrictActiveRiskUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, district: str) -> Sequence[Dict[str, Any]]:
        async with self.uow:
            return await self.uow.patients.list_active_risk_by_district(district)


class GetRegionalOverviewUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, region: str) -> Sequence[Dict[str, Any]]:
        async with self.uow:
            return await self.uow.patients.list_regional_overview(region)
