# DrishtiMitra — Legal Metrology Compliance System (SIH 26034)

A complete compliance inspection system for the **Legal Metrology (Packaged Commodities) Rules, 2011** under SIH Problem Statement 26034.

## Overview

DrishtiMitra enables officers to scan product labels, extract structured data via OCR, and automatically evaluate compliance against the Legal Metrology Rules. The system combines:

- **Frontend**: Vanilla ES6 static application (no build step)
- **Backend**: FastAPI with PostgreSQL/Supabase
- **OCR**: PaddleOCR for text extraction
- **Compliance Engine**: Deterministic rule engine for Rules 6, 10, 11, 12, 13, 14, 16, 17, 24, 26
- **Storage**: Supabase Storage for evidence images
- **Reference Catalogue**: ~349k products from Open Food Facts & Flipkart

---

## Project Structure

```
DrishtiMitra/
├── backend/                 # FastAPI backend
│   ├── main.py              # Application entry point
│   ├── routes/              # API routes
│   │   ├── health.py        # GET /health
│   │   ├── inspections.py   # POST /scan, POST /evaluate
│   │   └── catalogue.py     # GET /catalogue/search
│   ├── services/            # Business logic
│   │   ├── ocr/             # PaddleOCR wrapper
│   │   ├── extraction/      # Label field extraction
│   │   ├── preprocessing/   # Image preprocessing
│   │   ├── catalogue/       # CSV importers & search
│   │   └── storage.py       # Supabase Storage
│   ├── rules/               # Compliance rule engine
│   │   ├── engine.py        # Orchestration
│   │   ├── applicability.py # Rule 26 exemption logic
│   │   └── rule_*.py        # Individual rule implementations
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── database/            # DB connection & config
│   ├── tests/               # Pytest suite (35 tests)
│   ├── database/migrations/ # SQL migrations (001-008)
│   ├── supabase/migrations/ # Supabase CLI migrations
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/                # Vanilla ES6 static frontend
│   ├── index.html           # Entry point
│   ├── src/
│   │   ├── main.js          # App bootstrap & routing
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API clients
│   │   ├── context/         # React-like state (InspectionContext, AuthContext)
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Router, validators, formatters
│   │   └── styles/          # CSS design system
│   └── .env.example
│
├── .gitignore
├── backend/.env.example
├── frontend/.env.example
└── README.md
```

---

## Key Features

### Backend
- **Image Ingestion**: `POST /api/v1/inspections/scan` — multi-image upload with optional OCR text/hints
- **Compliance Evaluation**: `POST /api/v1/inspections/{id}/evaluate` — runs deterministic rule engine (Rules 6, 10, 11, 12, 13, 14, 16, 17, 24, 26)
- **Catalogue Search**: `GET /api/v1/catalogue/search?q=...&limit=...` — searches ~349k reference products
- **Health Check**: `GET /health` — database connectivity status
- **Authentication**: Supabase JWT Bearer token validation
- **Multi-image Support**: Multiple images per inspection with surface tagging (FRONT/BACK/SIDE)
- **RLS Policies**: Row-level security on all inspection-related tables

### Frontend
- **Scan Page**: Multi-surface capture (camera/upload), surface tagging (FRONT/BACK/SIDE), optional OCR hints
- **Review Page**: Verification panel with extracted fields, surface evidence gallery, compliance trigger
- **Report Page**: Final compliance report with rule-level breakdown
- **Catalogue Search**: Search reference products by brand/product/category
- **Dashboard/History**: Inspection listing and detail views
- **Authentication**: Supabase Auth (JWT) with dev-mode fallback

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Supabase account (for production) or local PostgreSQL
- Modern browser (Chrome/Edge/Firefox)

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials and DATABASE_URL

# 4. Run migrations (if using Supabase/PostgreSQL)
# Run migrations from supabase/migrations/ in Supabase SQL Editor

# 5. Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server runs at `http://localhost:8000` | Docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# No build step required — pure ES6 modules
# Serve with any static file server:

# Option 1: Python
python -m http.server 5173

# Option 2: Node http-server
npx http-server -p 5173

# Option 3: VS Code "Live Server" extension
# Right-click index.html → "Open with Live Server"
```

Open `http://localhost:5173` (or your server port).

### Configuration

**Backend** — Set via `.env`:
- `DATABASE_URL` — PostgreSQL connection string (or SQLite for local dev)
- `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY` — Supabase credentials
- `SUPABASE_JWT_SECRET` — JWT secret for token validation

**Frontend** — Configure via UI (Settings page) or localStorage:
- `dm_api_base_url` — Backend URL (default: `http://localhost:8000`)
- `dm_supabase_url` — Supabase project URL
- `dm_supabase_anon_key` — Supabase anon key

---

## Running Tests

```bash
cd backend
# All tests
pytest backend/tests -v

# Specific test modules
pytest backend/tests/test_compliance.py -v
pytest backend/tests/test_catalogue.py -v
pytest backend/tests/test_importer_upsert.py -v
```

All 35 tests should pass.

---

## Deployment

### Backend (Production)
- Set `APP_ENV=production`, `DEBUG=false`
- Use PostgreSQL `DATABASE_URL` (Supabase pooler recommended)
- Set `SUPABASE_SERVICE_KEY` for server-side storage ops
- Configure CORS for your frontend domain
- Run with `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`
- Use process manager (systemd, PM2, Docker)

### Frontend (Production)
- Static files — deploy to any static host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront, nginx)
- No build step required
- Configure `dm_api_base_url` in localStorage or Settings page
- Configure Supabase Auth credentials in Settings page

### CORS
Backend allows all origins by default (`allow_origins=["*"]`). Restrict in production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Database Schema

Core tables:
- `rules` — Compliance rule definitions (10 seed rules)
- `products` — Product master data
- `inspections` — Inspection records with `user_id`, `product_id`, `status`
- `inspection_images` — Multiple images per inspection with surface tagging
- `extracted_data` — Structured OCR extractions (1:1 with inspection)
- `violations` — Rule evaluation results (1:N per inspection)
- `reference_products` — ~349k catalogue records (Open Food Facts + Flipkart)

RLS policies enforce user isolation on `inspections`, `inspection_images`, `extracted_data`, `violations`.

---

## Reference Catalogue

- **Open Food Facts**: ~338k products — `code` as `external_id`, fields: `product_name`, `brands`, `categories`, `quantity`, `image_url`, `url`
- **Flipkart**: ~12k products — `title` as product name, `seller_name` as brand, `mrp`, `category_1/2/3`, `image_links`, `highlights` as metadata

Import:
```bash
cd backend
# Update .env with Supabase PostgreSQL DATABASE_URL
python import_catalogue.py
```

---

## Compliance Engine

Deterministic rule evaluation (no LLM):
- **Rule 6**: Mandatory declarations (manufacturer, net qty, MRP, date, consumer care)
- **Rule 10**: Complete manufacturer/packer/importer address
- **Rule 11**: Quantity general provisions ("when packed" qualifier check)
- **Rule 12**: Manner of quantity (no "minimum", "approx", etc.)
- **Rule 13**: SI units, prohibited count names (dozen, score, gross)
- **Rule 14**: Textile dimensions (sarees, bedsheets, etc.)
- **Rule 16**: Usable sheets count (tissues, foil, etc.)
- **Rule 17**: Container dimensions & capacity references
- **Rule 24**: Wholesale package declarations
- **Rule 26**: Exemption logic (≤10g/ml, pan masala exception, fast food, DPCO, farm produce)

Statuses: `PASS`, `FAIL`, `REVIEW`, `NOT_APPLICABLE` → Overall: `COMPLIANT`, `NON_COMPLIANT`, `REVIEW`

---

## Environment Variables Reference

### Backend (`.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes* | PostgreSQL URL or SQLite path |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Anon/publishable key |
| `SUPABASE_SERVICE_KEY` | Yes | Service role key (storage) |
| `SUPABASE_JWT_SECRET` | Yes | JWT secret for token validation |
| `APP_ENV` | No | `development`/`production` |
| `DEBUG` | No | `true`/`false` |

*If not set, falls back to SQLite `./legal_metrology.db`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: paddleocr` | `pip install paddleocr paddlepaddle` (may need CPU-only build) |
| `psycopg2.OperationalError` | Check `DATABASE_URL`, network, Supabase IP allowlist |
| `401 Unauthorized` | Check `SUPABASE_JWT_SECRET`, token expiry, clock sync |
| `CardinalityViolation` | Unique constraint on `(source, external_id)` missing — run migration 008 |
| Frontend can't connect | Check `dm_api_base_url` in localStorage, CORS, backend running |
| PaddleOCR not found | Falls back to empty OCR result (safe REVIEW state) |

---

## License

Proprietary — SIH 26034 project. All rights reserved.