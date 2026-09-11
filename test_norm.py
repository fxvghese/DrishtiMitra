from backend.services.extraction.label_extractor import normalize_ocr_text
raw = """Aashirvaad Whole Wheat Atta
Net Qty: 5 kg
MRP 245.00 incl. of all taxes
Mfg By: ITC Limited, Kolkata
Pkd 06/2026
Consumer Care: support@itc.in"""
print(repr(normalize_ocr_text(raw)))