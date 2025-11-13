# TrustPay - Quick Start Guide

## 📁 Clean Project Structure

```
TrustPay/
├── frontend/              # All frontend code (React)
├── backend/               # All backend code (FastAPI)
├── docs/                  # Documentation (PRD, Technical)
├── README.md              # Project overview
├── SETUP.md               # Detailed setup guide
├── PROJECT_OVERVIEW.md    # Architecture details
└── start-dev.bat          # Quick start script
```

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set minimum required:
```env
DATABASE_URL=postgresql://user:password@localhost/trustpay
SECRET_KEY=your-secret-key-min-32-chars
```

Create database:
```bash
# Use postgres user
createdb -U postgres trustpay

# Or use psql
psql -U postgres
CREATE DATABASE trustpay;
\q
```

**Having issues?** See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed troubleshooting.

### Step 2: Setup Frontend

```bash
cd frontend
npm install
```

### Step 3: Start Development

**Option A: Use Quick Start Script (Windows)**
```bash
start-dev.bat
```

**Option B: Manual Start**

Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📝 First API Test

1. Go to http://localhost:8000/docs
2. Try `POST /api/v1/auth/register` to create a user
3. Try `POST /api/v1/auth/login` to get a token
4. Use the token to test other endpoints

## 📚 More Information

- **Setup Details**: See [SETUP.md](SETUP.md)
- **Architecture**: See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Product Specs**: See [docs/PRD.md](docs/PRD.md)
- **Technical Specs**: See [docs/technicaldoc.md](docs/technicaldoc.md)

## 🆘 Common Issues

**Database connection error?**
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -l`

**Frontend can't connect to backend?**
- Ensure backend is running on port 8000
- Check browser console for errors

**Module not found?**
- Backend: Activate venv and run `pip install -r requirements.txt`
- Frontend: Run `npm install` in frontend folder

## 🎯 Next Steps

1. ✅ Setup complete
2. 📖 Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture
3. 🔧 Customize components in `frontend/src/components/`
4. 🛠️ Add features in `backend/app/`
5. 🚀 Deploy to production

---

**Happy Coding!** 🚀
