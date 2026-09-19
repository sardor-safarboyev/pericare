from app.application.ports.ocr import ExtractedVitals, OCRPort
from app.domain.exceptions.domain_exceptions import DomainError


class OCRProcessingError(DomainError):
    def __init__(self, message: str):
        super().__init__(f"OCR o'qishda xatolik: {message}")


class ExtractVitalsFromImageUseCase:
    def __init__(self, ocr_port: OCRPort):
        self.ocr_port = ocr_port

    async def execute(self, image_bytes: bytes) -> ExtractedVitals:
        if not image_bytes or len(image_bytes) == 0:
            raise OCRProcessingError("Tasvir fayli bo'sh")

        extracted = await self.ocr_port.extract_vitals_from_image(image_bytes)

        if extracted.confidence < 0.60:
            raise OCRProcessingError(
                f"Tasvirdagi ko'rsatkichlarni aniq o'qib bo'lmadi (Ishonchlilik: {round(extracted.confidence * 100)}%). Iltimos, qayta rasmga oling yoki qo'lda kiriting."
            )

        return extracted
