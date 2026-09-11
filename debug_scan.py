import subprocess
import time
import requests
import sys
import numpy as np
import cv2

# Create a Bingo-like test image
img = np.ones((300, 500, 3), dtype=np.uint8) * 255
# Add text similar to a Bingo packet
cv2.putText(img, 'BINGO', (50, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)
cv2.putText(img, 'MAD ANGLES', (50, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img, 'ACHAARI MUNCH', (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img, 'Net Wt: 66g', (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
cv2.putText(img, 'MRP Rs 30', (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
cv2.putText(img, 'Mfg: 01/2026', (50, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
cv2.putText(img, 'Consumer Care: 1800-123-4567', (50, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

_, img_bytes = cv2.imencode('.jpg', img)
image_bytes = img_bytes.tobytes()

# Start server
server_process = subprocess.Popen([
    sys.executable, '-m', 'uvicorn', 'backend.main:app', 
    '--host', '0.0.0.0', '--port', '8012', '--log-level', 'info'
], cwd=r'C:\Users\Felix\Downloads\DrishtiMitra')

# Wait for startup
print("Waiting for server to start...")
time.sleep(8)

try:
    print('Testing with Bingo-like image...')
    r = requests.post(
        'http://localhost:8012/api/v1/inspections/scan',
        files={'image': ('bingo.jpg', image_bytes, 'image/jpeg')},
        headers={'Authorization': 'Bearer development-token'},
        timeout=60
    )
    print(f'Status: {r.status_code}')
    if r.status_code == 201:
        data = r.json()
        print(f'Inspection ID: {data["data"]["id"]}')
        print(f'Status: {data["data"]["status"]}')
        extracted = data["data"]["extracted_data"]
        print(f'product_name: {extracted["product_name"]}')
        print(f'manufacturer: {extracted["manufacturer"]}')
        print(f'net_quantity: {extracted["net_quantity"]}')
        print(f'mrp: {extracted["mrp"]}')
        print(f'date: {extracted["date"]}')
        print(f'consumer_care: {extracted["consumer_care"]}')
        print(f'confidence: {extracted["extraction_confidence"]}')
    else:
        print(f'Error: {r.text[:1000]}')

finally:
    server_process.terminate()
    server_process.wait(timeout=5)