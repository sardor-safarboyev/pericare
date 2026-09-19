from abc import ABC, abstractmethod

from pydantic import BaseModel, Field

from app.domain.value_objects.perinatal import ProteinuriaLevel


class ExtractedVitals(BaseModel):
    systolic: int = Field(..., description="Sistolik qon bosimi (mmHg)")
    diastolic: int = Field(..., description="Diastolik qon bosimi (mmHg)")
    heart_rate: int = Field(..., description="Yurak urish tezligi (bpm)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="OCR tanish aniqligi darajasi")
    body_temp: float | None = Field(default=None, description="Tana harorati (°C)")
    blood_sugar: float | None = Field(default=None, description="Qondagi qand miqdori (mmol/L)")
    proteinuria: ProteinuriaLevel | None = Field(
        default=None, description="Siydikdagi oqsil darajasi"
    )


class OCRPort(ABC):
    @abstractmethod
    async def extract_vitals_from_image(self, image_bytes: bytes) -> ExtractedVitals:
        """Tonometr displeyi yoki ekspress-tahlil qog'ozi tasviridan ko'rsatkichlarni ajratib oladi."""
        pass
