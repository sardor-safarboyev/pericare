import re

import cv2
import numpy as np
import pytesseract

from app.application.ports.ocr import ExtractedVitals, OCRPort
from app.domain.exceptions.domain_exceptions import DomainError


class TesseractOCRAdapter(OCRPort):
    def _preprocess_image(self, image_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
        """Tasvirni ochadi, shovqinni tozalaydi va binarizatsiya qiladi."""
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise DomainError("Tasvir faylini o'qib bo'lmadi")

        # Rasm hajmini normallashtirish (maksimal 1200px)
        h, w = img.shape[:2]
        if max(h, w) > 1200:
            scale = 1200 / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # LCD kontrastini oshirish (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        contrast = clahe.apply(gray)

        # Shovqinni tozalash va chegaralarni saqlash
        denoised = cv2.bilateralFilter(contrast, 9, 75, 75)

        # Otsu binarizatsiya
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return contrast, thresh

    def _extract_from_ocr_data(self, ocr_data: dict) -> list[tuple[int, float]]:
        """Tanib olingan raqamlarni va ularning Tesseract ishonchliligini ajratadi."""
        extracted = []
        n_boxes = len(ocr_data["text"])
        for i in range(n_boxes):
            text = ocr_data["text"][i].strip()
            conf = float(ocr_data["conf"][i])
            if text.isdigit() and conf > 0:
                val = int(text)
                if 30 <= val <= 280:
                    extracted.append((val, conf / 100.0))
        return extracted

    async def extract_vitals_from_image(self, image_bytes: bytes) -> ExtractedVitals:
        try:
            contrast, thresh = self._preprocess_image(image_bytes)
            whitelist_cfg = "--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789/ "

            # 1. Binarizatsiyalangan tasvir bo'yicha batafsil data olish
            data_thresh = pytesseract.image_to_data(
                thresh, config=whitelist_cfg, output_type=pytesseract.Output.DICT
            )
            candidates = self._extract_from_ocr_data(data_thresh)

            # Agar binarizatsiyada raqamlar kam bo'lsa, kontrastli kulrang tasvirda sinash (--psm 11)
            if len(candidates) < 3:
                sparse_cfg = "--oem 3 --psm 11 -c tessedit_char_whitelist=0123456789/ "
                data_gray = pytesseract.image_to_data(
                    contrast, config=sparse_cfg, output_type=pytesseract.Output.DICT
                )
                candidates.extend(self._extract_from_ocr_data(data_gray))

            # Matndan to'g'ridan-to'g'ri "120/80" kabi shablonlarni tekshirish
            raw_text = pytesseract.image_to_string(thresh, config=whitelist_cfg)
            slash_match = re.search(r"(\d{2,3})\s*[/]\s*(\d{2,3})", raw_text)

            if slash_match:
                sys = int(slash_match.group(1))
                dia = int(slash_match.group(2))
                other_vals = [
                    val for val, _ in candidates if val not in (sys, dia) and 40 <= val <= 180
                ]
                pulse = other_vals[0] if other_vals else 75
                avg_conf = (
                    np.mean([c for v, c in candidates if v in (sys, dia)])
                    if any(v in (sys, dia) for v, _ in candidates)
                    else 0.80
                )
                return ExtractedVitals(
                    systolic=sys,
                    diastolic=dia,
                    heart_rate=pulse,
                    confidence=round(float(avg_conf), 2),
                )

            # Ketma-ketlik bo'yicha tekshirish: SYS, DIA, PULSE
            if len(candidates) >= 3:
                nums = [val for val, _ in candidates]
                confs = [conf for _, conf in candidates]

                for i in range(len(nums) - 2):
                    sys, dia, pulse = nums[i], nums[i + 1], nums[i + 2]
                    if (
                        (90 <= sys <= 260)
                        and (45 <= dia <= 160)
                        and (sys > dia)
                        and (40 <= pulse <= 200)
                    ):
                        mean_conf = float(np.mean(confs[i : i + 3]))
                        return ExtractedVitals(
                            systolic=sys,
                            diastolic=dia,
                            heart_rate=pulse,
                            confidence=round(mean_conf, 2),
                        )

            # Agar topilmasa, klinik diapazondagi raqamlarni saralab olish
            valid_nums = [(v, c) for v, c in candidates if 40 <= v <= 260]
            if len(valid_nums) >= 3:
                valid_nums.sort(key=lambda x: x[0], reverse=True)
                sys, s_conf = valid_nums[0]
                dia, d_conf = valid_nums[1]
                pulse, p_conf = valid_nums[2]

                if sys > dia and dia >= 45:
                    mean_conf = float(np.mean([s_conf, d_conf, p_conf]))
                    return ExtractedVitals(
                        systolic=sys,
                        diastolic=dia,
                        heart_rate=pulse,
                        confidence=round(
                            mean_conf * 0.9, 2
                        ),  # Tartib noaniqligi sababli biroz pasaytiriladi
                    )

            raise DomainError("Tasvirdan klinik ko'rsatkichlarni aniqlab bo'lmadi")

        except DomainError:
            raise
        except Exception as e:
            raise DomainError(f"OCR qayta ishlashda kutilmagan xatolik yuz berdi: {str(e)}")
