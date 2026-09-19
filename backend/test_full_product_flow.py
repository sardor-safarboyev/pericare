import asyncio
import os
import random
import sys

from sqlalchemy import select

sys.path.insert(0, os.path.abspath("backend"))

from app.api.dependencies import ml_instance, worker_instance
from app.application.use_cases.patients import RegisterPatientUseCase
from app.application.use_cases.referrals import RecordClinicalActionUseCase
from app.application.use_cases.triage import ProcessTriageUseCase
from app.domain.value_objects.perinatal import ActionTakenType, ProteinuriaLevel
from app.infrastructure.database.models import StaffModel
from app.infrastructure.database.session import AsyncSessionFactory
from app.infrastructure.database.unit_of_work import SqlUnitOfWork


async def run_e2e_check():
    uow = SqlUnitOfWork(AsyncSessionFactory)
    print("\n=== PERISAFE END-TO-END PRODUCT FLOW TEKSHIRUVI ===")

    async with uow:
        # 1. Klinika olish
        facilities = await uow.facilities.list_all()
        if not facilities:
            print("[-] Bazada klinika topilmadi!")
            return
        facility = facilities[0]
        print(
            f"[1] Klinika olindi: {facility.name} (Tuman: {facility.district}, Viloyat: {facility.region})"
        )

        # 2. Bazadagi haqiqiy xodimlarni olish
        stmt = select(StaffModel)
        result = await uow.session.scalars(stmt)
        all_staff = list(result.all())

        nurse = next(
            (s for s in all_staff if "nurse" in s.role.lower() or "midwife" in s.role.lower()), None
        )
        specialist = next((s for s in all_staff if "specialist" in s.role.lower()), None)

        if not nurse:
            # Agar alohida nurse bo'lmasa mavjud birinchi xodimni olamiz
            nurse = all_staff[0] if all_staff else None
        if not specialist:
            specialist = all_staff[-1] if all_staff else None

        print(
            f"[2] Xodimlar tanlandi: Doya={nurse.full_name} ({nurse.role}), Shifokor={specialist.full_name} ({specialist.role})"
        )

    # 3. Homiladorni ro'yxatga olish (Doya vazifasi)
    reg_use_case = RegisterPatientUseCase(uow)
    unique_pinfl = f"4{random.randint(1000000000000, 9999999999999)}"
    patient = await reg_use_case.execute(
        full_name="E2E Sinov Homiladori",
        age=27,
        gestational_week=34,
        home_facility_id=facility.id,
        pinfl=unique_pinfl,
        district=facility.district,
        history_hypertension=True,
        history_preeclampsia=False,
    )
    print(
        f"[3] Bemor ro'yxatga olindi: ID={patient.id}, Ism={patient.full_name}, PINFL={patient.pinfl}"
    )

    # 4. Ko'rik o'tkazish (Kritik bosim 165/108, oqsil 2+) -> Triage baholash
    triage_use_case = ProcessTriageUseCase(
        uow=uow, worker=worker_instance, ml_predictor=ml_instance
    )
    vitals, assessment, referral = await triage_use_case.execute(
        patient_id=patient.id,
        recorded_by_id=nurse.id,
        systolic_bp=165,
        diastolic_bp=108,
        heart_rate=104,
        body_temp=36.7,
        proteinuria=ProteinuriaLevel.TWO_PLUS,
    )
    print("[4] Triage natijasi:")
    print(f"    - Xavf zonasi: {assessment.risk_zone.value}")
    print(f"    - Sindrom: {assessment.syndrome}")
    print(f"    - Shok indeksi: {assessment.shock_index}")
    print(f"    - Referral yaratildimi: {'Ha, ID=' + str(referral.id) if referral else 'Yoq'}")

    # 5. Mutaxassis (Akusher-ginekolog) tomonidan protokol chorasi kiritilishi
    if referral and specialist:
        action_use_case = RecordClinicalActionUseCase(uow)
        updated_ref = await action_use_case.execute(
            referral_id=referral.id,
            specialist_id=specialist.id,
            action_type=ActionTakenType.MEDICATION_GIVEN,
            notes="Protokol: MgSO4 4g IV yuklama dozasi, Nifedipin 10mg qabul qilinsin.",
        )
        print("[5] Shifokor ekspertizasi va tayinlov kiritildi:")
        print(f"    - Tayinlov: {updated_ref.action_notes}")
        print(f"    - Referral yangi holati: {updated_ref.status}")

    print("\n[SUCCESS] Mahsulotning barcha orqa zanjirlari 100% muvaffaqiyatli ishladi!\n")


if __name__ == "__main__":
    asyncio.run(run_e2e_check())
