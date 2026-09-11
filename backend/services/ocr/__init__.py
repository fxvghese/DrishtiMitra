"""OCR package exports."""

from backend.services.ocr.base import BaseOCRService, OCRResult, OCRBlock
from backend.services.ocr.paddleocr_service import PaddleOCRService, get_ocr_service
from backend.services.ocr.rapidocr_service import RapidOCRService

__all__ = [
    "BaseOCRService",
    "OCRResult",
    "OCRBlock",
    "PaddleOCRService",
    "RapidOCRService",
    "get_ocr_service",
]
