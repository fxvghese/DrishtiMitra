"""One-off diagnostic probe: verify RapidOCR initializes and runs real inference on Python 3.14.

Generates a synthetic generic-text image (no product-specific data) and runs the real engine.
Safe to delete after diagnostics.
"""
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

img = Image.new("RGB", (900, 520), "white")
d = ImageDraw.Draw(img)
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 46)
d.text((40, 40), "Sample Text Line One", fill="black", font=font)
d.text((40, 130), "SECOND LINE 12345", fill="black", font=font)
d.text((40, 220), "Total: 250 grams", fill="black", font=font)
d.text((40, 310), "Price 99 Rupees Only", fill="black", font=font)
d.text((40, 400), "contact: demo@example.com", fill="black", font=font)

img_bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
ok, buf = cv2.imencode(".png", img_bgr)
assert ok

from rapidocr import RapidOCR

engine = RapidOCR()
result = engine(buf.tobytes())

print("TYPE:", type(result))
txts = list(result.txts) if result.txts is not None else []
scores = list(result.scores) if result.scores is not None else []
print("NUM_BOXES:", len(result.boxes) if result.boxes is not None else 0)
print("TEXTS:", txts)
print("SCORES:", [round(float(s), 3) for s in scores])
