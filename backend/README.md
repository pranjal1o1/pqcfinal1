# Quantum-Resistant Cryptographic Transition Analyzer - Backend

A production-ready FastAPI backend for analyzing cryptographic vulnerabilities and providing Post-Quantum Cryptography (PQC) migration recommendations using pre-trained AI models.

## 🎯 Features

- **Automated Crypto Scanning**: Detects RSA, ECC, DH, AES, and SHA-1 usage in source code
- **AI-Powered Risk Assessment**: Correlates findings with Kaggle-trained ML risk models
- **Multi-Format Reports**: Generate PDF, CSV, and JSON compliance reports
- **GitHub Integration**: Clone and scan repositories directly
- **SHAP Explainability**: Visual explanations of AI risk predictions
- **RESTful API**: Full OpenAPI/Swagger documentation

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── database.py             # Database configuration
│   ├── schemas.py              # Pydantic models
│   ├── api/
│   │   ├── scan.py            # Scanning endpoints
│   │   ├── risk.py            # Risk analysis endpoints
│   │   └── report.py          # Report generation endpoints
│   ├── models/
│   │   └── scan.py            # SQLAlchemy database models
│   ├── services/
│   │   ├── ai_results_service.py    # AI output loader
│   │   ├── scanner_service.py       # Crypto scanner
│   │   ├── correlation_service.py   # Finding correlation
│   │   └── report_service.py        # Report generator
│   └── utils/
│       └── github.py          # Git utilities
├── ai_outputs/                # Kaggle AI output files
│   ├── risk_output.json
│   ├── risk_output.csv
│   ├── shap_feature_importance.csv
│   └── *.png                  # Visualization assets
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Place AI Output Files**
Ensure all Kaggle AI outputs are in the `ai_outputs/` directory:
- risk_output.json
- risk_output.csv
- shap_feature_importance.csv
- Dashboard PNG files

4. **Run the Application**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **Access API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Docker Deployment

1. **Build and Run with Docker Compose**
```bash
docker-compose up -d
```

2. **Check Status**
```bash
docker-compose ps
docker-compose logs -f backend
```

3. **Stop Services**
```bash
docker-compose down
```

## 📡 API Endpoints

### Scanning

- `POST /scan/upload` - Upload ZIP file and scan
- `POST /scan/repo` - Clone and scan GitHub repository
- `GET /scan/results/{scan_id}` - Retrieve scan results
- `GET /scan/list` - List recent scans

### Risk Analysis

- `GET /risk/ai-results` - Get AI risk analysis data
- `GET /risk/top-priorities` - Get top priority vulnerabilities
- `GET /risk/by-risk-level/{level}` - Filter by risk level
- `GET /risk/dashboard` - Get dashboard summary
- `GET /risk/shap` - Get SHAP explainability data

### Reports

- `POST /report/generate` - Generate compliance report
- `GET /report/export/{scan_id}/{format}` - Export report (PDF/CSV/JSON)
- `GET /report/assets/{filename}` - Serve visualization assets

## 🔍 Usage Examples

### Upload and Scan Code

```bash
curl -X POST "http://localhost:8000/scan/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/code.zip"
```

### Scan GitHub Repository

```bash
curl -X POST "http://localhost:8000/scan/repo" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/user/repo",
    "branch": "main"
  }'
```

### Get Dashboard Data

```bash
curl "http://localhost:8000/risk/dashboard"
```

### Generate PDF Report

```bash
curl -X POST "http://localhost:8000/report/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "your-scan-id",
    "format": "pdf",
    "include_ai_analysis": true,
    "include_shap_plots": true
  }'
```

### Download Report

```bash
curl "http://localhost:8000/report/export/your-scan-id/pdf" \
  --output report.pdf
```

## 🧠 AI Integration

The backend automatically loads and uses pre-generated AI outputs from Kaggle:

1. **Risk Assessment**: 500 vulnerability records with ML predictions
2. **Feature Importance**: SHAP values for model explainability
3. **Visualizations**: Pre-rendered dashboards and SHAP plots

### AI Correlation Logic

Findings are matched with AI data using:
- Algorithm type (RSA, ECC, DH)
- Key size (1024, 2048, 3072, etc.)
- System type inference from file structure

## 📊 Report Features

### PDF Reports Include:
- Executive summary with key metrics
- Top priority vulnerabilities table
- Detailed findings with AI correlation
- Risk distribution charts
- SHAP explainability plots
- PQC migration recommendations
- NIST/NSA compliance mapping

### CSV Export:
- Raw finding data
- AI risk scores
- Migration timelines
- All correlation metadata

### JSON Export:
- Complete structured data
- Full AI analysis results
- Programmatic access to all fields

## 🔒 Security Considerations

- **File Upload Validation**: Max 100MB, ZIP only
- **Secure Extraction**: Validates ZIP contents before extraction
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **Input Validation**: Pydantic schemas for all inputs
- **Read-Only AI Data**: AI outputs are never modified

## 📈 Performance

- **Async Operations**: FastAPI's async support for I/O operations
- **Database Connection Pooling**: SQLAlchemy session management
- **Regex Pre-compilation**: Crypto patterns compiled once at startup
- **Streaming Reports**: Large reports streamed to avoid memory issues

## 🐛 Troubleshooting

### AI Results Not Loading
```bash
# Check AI outputs directory
ls -la ai_outputs/
# Verify risk_output.json exists and is valid JSON
python -m json.tool ai_outputs/risk_output.json
```

### Database Connection Issues
```bash
# For SQLite (default)
rm crypto_analyzer.db
# Restart application to recreate

# For PostgreSQL
docker-compose restart db
```

### Git Clone Failures
- Ensure git is installed: `git --version`
- Check repository URL is public or credentials are set
- Verify network connectivity

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./crypto_analyzer.db` | Database connection string |
| `MAX_UPLOAD_SIZE` | `104857600` | Max upload size in bytes |
| `GIT_CLONE_TIMEOUT` | `300` | Git clone timeout in seconds |
| `AI_OUTPUTS_DIR` | `./ai_outputs` | Path to AI output files |

## 📚 Tech Stack

- **FastAPI** - Modern async web framework
- **SQLAlchemy** - ORM and database management
- **PostgreSQL/SQLite** - Database options
- **Pydantic** - Data validation
- **ReportLab** - PDF generation
- **Pandas** - Data processing
- **GitPython** - Git operations

## 🎓 Academic Use

This backend is designed for:
- **Research**: PQC migration analysis
- **Education**: Cryptographic security assessment
- **Compliance**: NIST/NSA standard evaluation
- **Industry**: Enterprise security audits

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📧 Support

For issues or questions:
- GitHub Issues: [Create an issue]
- Documentation: `/docs` endpoint
- API Reference: `/redoc` endpoint

## 🔄 Version History

- **v1.0.0** - Initial release with full AI integration
  - Crypto scanning engine
  - AI risk correlation
  - Multi-format reporting
  - Docker deployment