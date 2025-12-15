# 🚀 Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Python 3.10+ installed
- [ ] Git installed
- [ ] Docker & Docker Compose installed (for production)
- [ ] PostgreSQL installed (for production) or SQLite for dev

### File Verification
- [ ] All AI output files present in `ai_outputs/`:
  - [ ] risk_output.json (required)
  - [ ] risk_output.csv (required)
  - [ ] shap_feature_importance.csv (required)
  - [ ] confusion_matrix.png
  - [ ] pqc_dashboard.png
  - [ ] pqc_risk_analysis_dashboard.png
  - [ ] shap_feature_importance.png
  - [ ] shap_heatmap.png
  - [ ] shap_summary_detailed.png
  - [ ] shap_waterfall_explanation.png

### Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Update DATABASE_URL in `.env`
- [ ] Set appropriate LOG_LEVEL
- [ ] Configure MAX_UPLOAD_SIZE if needed
- [ ] Set GIT_CLONE_TIMEOUT appropriately

## Development Setup

### Installation
- [ ] Run `./setup.sh` or manual setup
- [ ] Activate virtual environment
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create directories: `uploads/`, `reports/`

### Database
- [ ] Database tables created
- [ ] Test database connection
- [ ] Verify migrations work (if using Alembic)

### Testing
- [ ] Start server: `uvicorn app.main:app --reload`
- [ ] Access Swagger UI: http://localhost:8000/docs
- [ ] Test health endpoint: GET /health
- [ ] Verify AI results loaded in logs
- [ ] Test upload endpoint with sample ZIP
- [ ] Test GitHub repo scanning
- [ ] Generate sample report

## Production Deployment

### Docker Setup
- [ ] Review `Dockerfile`
- [ ] Update `docker-compose.yml` with production settings
- [ ] Set strong PostgreSQL password
- [ ] Configure volumes for persistence
- [ ] Set up proper networking

### Security
- [ ] Change default database credentials
- [ ] Configure CORS origins (not wildcard)
- [ ] Set up HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up API authentication (if required)
- [ ] Review file upload security settings

### Performance
- [ ] Configure Uvicorn workers: `--workers 4`
- [ ] Set up connection pooling
- [ ] Configure caching if needed
- [ ] Optimize database queries
- [ ] Set appropriate timeout values

### Monitoring
- [ ] Set up logging to file/service
- [ ] Configure log rotation
- [ ] Set up health check monitoring
- [ ] Configure alerts for errors
- [ ] Set up metrics collection (optional)

### Backup
- [ ] Configure database backups
- [ ] Back up AI output files
- [ ] Document recovery procedures
- [ ] Test backup restoration

## Post-Deployment

### Verification
- [ ] Server responds to health checks
- [ ] API documentation accessible
- [ ] All endpoints functional
- [ ] AI data loads correctly
- [ ] Reports generate successfully
- [ ] GitHub cloning works
- [ ] File uploads work
- [ ] Database persistence verified

### Documentation
- [ ] Update API documentation
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] Update README with production URLs

### Client Integration
- [ ] Provide API endpoint URLs
- [ ] Share authentication details
- [ ] Provide example requests
- [ ] Share OpenAPI spec
- [ ] Test with frontend/client

## Maintenance

### Regular Tasks
- [ ] Monitor logs for errors
- [ ] Check disk space
- [ ] Review database size
- [ ] Update dependencies monthly
- [ ] Rotate API keys (if used)
- [ ] Clean up old uploads/reports
- [ ] Test backup restoration quarterly

### Updates
- [ ] Review security advisories
- [ ] Update Python dependencies
- [ ] Update Docker base images
- [ ] Test updates in staging first
- [ ] Plan for zero-downtime deployment

## Troubleshooting

### Common Issues Checklist
- [ ] AI files not loading
  - Check file paths
  - Verify JSON validity
  - Review permissions
- [ ] Database connection errors
  - Check DATABASE_URL
  - Verify credentials
  - Check network connectivity
- [ ] Git clone failures
  - Verify git installed
  - Check repository access
  - Review timeout settings
- [ ] Report generation errors
  - Check reportlab installation
  - Verify AI assets accessible
  - Review disk space
- [ ] High memory usage
  - Review upload size limits
  - Check for memory leaks
  - Optimize queries

## Performance Benchmarks

### Expected Performance
- [ ] Health check: < 50ms
- [ ] AI results load: < 2s on startup
- [ ] Small repo scan (100 files): < 30s
- [ ] Medium repo scan (1000 files): < 5min
- [ ] PDF report generation: < 10s
- [ ] Dashboard data: < 500ms

### Load Testing
- [ ] Test concurrent uploads
- [ ] Test multiple simultaneous scans
- [ ] Verify database connection pool
- [ ] Monitor memory under load
- [ ] Test report generation concurrency

## Security Audit

### Checklist
- [ ] No hardcoded credentials
- [ ] Environment variables used properly
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] File upload validation working
- [ ] ZIP bomb protection in place
- [ ] Path traversal protection
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] HTTPS enforced in production

## Compliance

### NIST/NSA Alignment
- [ ] AI model accuracy documented
- [ ] Risk scoring methodology documented
- [ ] PQC recommendations align with NIST
- [ ] Report format meets compliance needs
- [ ] Audit trail maintained

## Sign-off

### Development
- [ ] Developer tested locally
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Tests passing

### Staging
- [ ] Deployed to staging
- [ ] Integration tests passed
- [ ] Performance acceptable
- [ ] Security scan completed

### Production
- [ ] Production deployment successful
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Team trained on maintenance
- [ ] Incident response plan ready

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Approved By**: _____________

**Notes**: _____________