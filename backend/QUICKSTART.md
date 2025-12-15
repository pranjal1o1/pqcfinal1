# 🚀 Quick Start Guide

Get the Quantum-Resistant Crypto Analyzer backend running in 5 minutes!

## Prerequisites

- Python 3.10+ OR Docker
- Git
- 2GB free disk space

## Option 1: Local Setup (Fastest)

### Step 1: Install Dependencies

```bash
# Clone or navigate to project
cd quantum-crypto-analyzer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### Step 2: Verify AI Outputs

```bash
# Check AI output files are present
ls -la ai_outputs/

# Should see:
# - risk_output.json
# - risk_output.csv
# - shap_feature_importance.csv
# - *.png files
```

### Step 3: Run Application

```bash
# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO: Application startup complete
# INFO: Successfully loaded 500 AI risk records
```

### Step 4: Test the API

Open browser to: http://localhost:8000/docs

Try the health check:
```bash
curl http://localhost:8000/health
```

## Option 2: Docker Setup (Production)

### Step 1: Build and Run

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### Step 2: Verify Running

```bash
# Check containers
docker-compose ps

# Should show:
# - crypto_analyzer_backend (running)
# - crypto_analyzer_db (running)
```

### Step 3: Test

```bash
curl http://localhost:8000/health
```

## 🧪 Test the Scanner

### Upload a Test ZIP

```bash
# Create test file
echo 'import RSA; key = RSA.generate(2048)' > test_crypto.py
zip test.zip test_crypto.py

# Upload and scan
curl -X POST "http://localhost:8000/scan/upload" \
  -F "file=@test.zip"
```

### Scan GitHub Repo

```bash
curl -X POST "http://localhost:8000/scan/repo" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/pyca/cryptography",
    "branch": "main"
  }'
```

## 📊 View Results

### Get Dashboard

```bash
curl http://localhost:8000/risk/dashboard | json_pp
```

### Top Priorities

```bash
curl http://localhost:8000/risk/top-priorities?limit=5 | json_pp
```

### Generate Report

1. Get a scan_id from previous scan
2. Generate PDF:

```bash
curl -X POST "http://localhost:8000/report/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "YOUR_SCAN_ID",
    "format": "pdf",
    "include_ai_analysis": true,
    "include_shap_plots": true
  }'
```

3. Download:

```bash
curl "http://localhost:8000/report/export/YOUR_SCAN_ID/pdf" \
  --output crypto_report.pdf
```

## 🎯 Next Steps

1. **Explore API Documentation**: http://localhost:8000/docs
2. **View AI Visualizations**: http://localhost:8000/assets/pqc_dashboard.png
3. **Check SHAP Data**: http://localhost:8000/risk/shap
4. **Generate Custom Reports**: Use POST /report/generate with different options

## 🐛 Common Issues

### "AI results service not initialized"
- Ensure ai_outputs/ directory exists with required files
- Check logs: `docker-compose logs backend`

### "Module not found"
- Activate virtual environment: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

### Database errors
- Delete existing: `rm crypto_analyzer.db`
- Restart: Application will recreate tables

### Port already in use
- Change port: `uvicorn app.main:app --port 8001`
- Or kill existing: `lsof -ti:8000 | xargs kill`

## 📚 Learn More

- Full Documentation: README.md
- API Reference: http://localhost:8000/redoc
- Example Payloads: Check `/docs` for request schemas

## 🎉 You're Ready!

The backend is now running and ready to analyze cryptographic vulnerabilities with AI-powered insights!