from typing import Sequence

from app.application.ports.unit_of_work import UnitOfWorkPort
from app.domain.entities.facility import Facility


class ListFacilitiesUseCase:
    def __init__(self, uow: UnitOfWorkPort):
        self.uow = uow

    async def execute(self, region: str | None = None) -> Sequence[Facility]:
        async with self.uow:
            if region:
                return await self.uow.facilities.list_by_region(region)
            return await self.uow.facilities.list_all()
