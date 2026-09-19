from typing import Any
from uuid import UUID

from app.application.use_cases.triage import ProcessTriageUseCase
from app.domain.value_objects.perinatal import ProteinuriaLevel


class SyncOfflineVitalsUseCase:
    def __init__(self, triage_use_case: ProcessTriageUseCase):
        self.triage_use_case = triage_use_case

    async def execute(
        self,
        batch_records: list[Any],
        staff_id: UUID,
    ) -> list[dict[str, Any]]:
        results = []
        for raw_item in batch_records:
            # Pydantic model bo'lsa dict ga o'girish
            item = (
                raw_item.model_dump()
                if hasattr(raw_item, "model_dump")
                else (raw_item.dict() if hasattr(raw_item, "dict") else dict(raw_item))
            )

            local_id = item.get("client_local_id") or item.get("local_id")
            payload = item.get("payload") if isinstance(item.get("payload"), dict) else item

            try:
                # Proteinuria xavfsiz aniqlash
                raw_prot = payload.get("proteinuria")
                if not raw_prot or str(raw_prot).lower() in ("none", "null", ""):
                    prot_val = ProteinuriaLevel.NEGATIVE
                else:
                    prot_val = ProteinuriaLevel(str(raw_prot))

                # Triage use case chaqirish
                vitals, assessment, referral = await self.triage_use_case.execute(
                    patient_id=UUID(str(item.get("patient_id") or payload.get("patient_id"))),
                    recorded_by_id=staff_id,
                    systolic_bp=int(payload["systolic_bp"]),
                    diastolic_bp=int(payload["diastolic_bp"]),
                    heart_rate=int(payload["heart_rate"]),
                    body_temp=float(payload.get("temperature") or payload.get("body_temp", 36.6)),
                    proteinuria=prot_val,
                    respiratory_rate=int(payload.get("respiratory_rate", 18)),
                    blood_sugar=float(payload["blood_sugar"])
                    if payload.get("blood_sugar")
                    else None,
                    is_synced_offline=True,
                )
                results.append(
                    {
                        "client_local_id": local_id,
                        "vitals_id": str(vitals.id),
                        "risk_zone": assessment.risk_zone.value,
                        "status": "success",
                    }
                )
            except Exception as e:
                results.append(
                    {
                        "client_local_id": local_id,
                        "status": "failed",
                        "error": str(e),
                    }
                )
        return results
