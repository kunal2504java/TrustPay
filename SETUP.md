# TrustPay Setup Guide

Complete setup guide for TrustPay UPI Escrow Platform.

## Project Structure

```
TrustPay/
├── frontend/           # React frontend (Port 3000)
├── backend/            # FastAPI backend (Port 8000)
├── docs/              # Documentation
│   ├── PRD.md
│   └── technicaldoc.md
├── README.md
└── SETUP.md          # This file
```

## Prerequisites

### Required
- **Node.js** 18+ and npm
- **Python** 3.9+
- **PostgreSQL** 13+

### Optional (for full features)
- **Redis** 6+ (for caching and task queue)
- **Polygon RPC** access (for blockchain integration)
- **Setu API** credentials (for UPI integration)

## Step-by-Step Setup

### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Minimum required: DATABASE_URL and SECRET_KEY
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb trustpay

# Or using psql:
psql -U postgres
CREATE DATABASE trustpay;
\q
```

Update `.env` file with your database URL:
```
DATABASE_URL=postgresql://username:password@localhost/trustpay
```

### 4. Generate Secret Key

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to `.env`:
```
SECRET_KEY=your-generated-secret-key-here
```

### 5. Start Backend Server

```bash
# Make sure you're in backend directory with venv activated
python main.py
```

Backend API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost/trustpay
SECRET_KEY=your-secret-key-min-32-chars

# Optional - UPI Integration
SETU_API_KEY=your-setu-api-key
SETU_BASE_URL=https://api.setu.co

# Optional - Blockchain Integration
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-ethereum-private-key
CONTRACT_ADDRESS=0x...

# Optional - Redis
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=development
DEBUG=true
```

## Testing the Setup

### 1. Test Backend API

Visit `http://localhost:8000/docs` to see the interactive API documentation.

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

### 2. Test Frontend

Visit `http://localhost:3000` to see the landing page.

### 3. Create Test User

Using the API docs at `/docs`, try:
1. POST `/api/v1/auth/register` - Create a new user
2. POST `/api/v1/auth/login` - Login and get token
3. GET `/api/v1/users/me` - Get user info (use Bearer token)

## Development Workflow

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd backend
python main.py       # Start dev server (auto-reload enabled)
pytest              # Run tests (when available)
```

## Common Issues

### Issue: Database connection error

**Solution**: 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `psql -l`

### Issue: Frontend can't connect to backend

**Solution**:
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify API URL in frontend code

### Issue: Module not found errors

**Solution**:
- Frontend: Run `npm install` again
- Backend: Ensure virtual environment is activated and run `pip install -r requirements.txt`

## Next Steps

### For Development

1. **Frontend**: 
   - Customize components in `frontend/src/components/`
   - Add new pages in `frontend/src/pages/`
   - Update styling in Tailwind config

2. **Backend**:
   - Add new endpoints in `backend/app/api/v1/endpoints/`
   - Create new models in `backend/app/models/`
   - Implement business logic in `backend/app/services/`

### For Production

1. **Frontend**:
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Update API URL to production backend

2. **Backend**:
   - Use production database (managed PostgreSQL)
   - Set up Redis for caching
   - Configure Setu API credentials
   - Set up blockchain wallet
   - Deploy to AWS, GCP, or similar
   - Enable HTTPS
   - Set up monitoring and logging

## Additional Resources

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)
- [Product Requirements](docs/PRD.md)
- [Technical Documentation](docs/technicaldoc.md)

## Support

For issues or questions:
- Check documentation in `/docs`
- Review API docs at `/docs` endpoint
- Contact: support@trustpay.in

---

Happy coding! 🚀
