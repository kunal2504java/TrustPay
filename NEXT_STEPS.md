# 🚀 TrustPay - Next Steps

## ✅ What's Done

- ✅ Database `trustpay` created successfully
- ✅ Backend `.env` file created
- ✅ Secret key generated

## 📝 What You Need to Do Now

### Step 1: Update Database Password

Open `backend/.env` and replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual postgres password:

```env
DATABASE_URL=postgresql://postgres:your_actual_password@localhost/trustpay
```

**Example:**
If your postgres password is `mypassword123`, it should look like:
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost/trustpay
```

### Step 2: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- FastAPI
- SQLAlchemy
- PostgreSQL drivers
- JWT authentication
- And all other dependencies

### Step 3: Start the Backend Server

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 4: Verify Backend is Working

Open your browser and go to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

You should see the interactive API documentation!

### Step 5: Test the API

In the API docs (http://localhost:8000/docs):

1. **Register a User**
   - Click on `POST /api/v1/auth/register`
   - Click "Try it out"
   - Fill in the request body:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "testpassword123",
       "vpa": "test@upi"
     }
     ```
   - Click "Execute"
   - You should get a 200 response with user details

2. **Login**
   - Click on `POST /api/v1/auth/login`
   - Click "Try it out"
   - Fill in:
     ```json
     {
       "email": "test@example.com",
       "password": "testpassword123"
     }
     ```
   - Click "Execute"
   - Copy the `access_token` from the response

3. **Test Authenticated Endpoint**
   - Click the "Authorize" button at the top
   - Enter: `Bearer your_access_token_here`
   - Click "Authorize"
   - Now try `GET /api/v1/users/me`
   - You should see your user details!

### Step 6: Start the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at: http://localhost:3000

### Step 7: Use the Quick Start Script (Optional)

For future development, you can use:

```bash
start-dev.bat
```

This will start both backend and frontend automatically!

---

## 🎯 Quick Command Reference

```bash
# Backend
cd backend
pip install -r requirements.txt    # Install dependencies (first time only)
python main.py                     # Start backend server

# Frontend
cd frontend
npm install                        # Install dependencies (first time only)
npm run dev                        # Start frontend server

# Database
psql -U postgres -d trustpay       # Connect to database
\dt                                # List tables
\q                                 # Exit
```

---

## 🔍 Verify Everything is Working

### Backend Checklist
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file updated with correct password
- [ ] Server starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Can register a user
- [ ] Can login and get token
- [ ] Database tables created (check with `psql -U postgres -d trustpay` then `\dt`)

### Frontend Checklist
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Landing page loads with animations
- [ ] Can navigate to dashboard

---

## 🆘 Common Issues

### Issue: "ModuleNotFoundError" when starting backend
**Solution**: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "Database connection error"
**Solution**: Check your password in `backend/.env`
```env
DATABASE_URL=postgresql://postgres:correct_password@localhost/trustpay
```

### Issue: "Port 8000 already in use"
**Solution**: Kill the process or change port in `backend/main.py`

### Issue: Frontend can't find modules
**Solution**: Install dependencies
```bash
cd frontend
npm install
```

---

## 📚 What to Read Next

1. **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
2. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Understand the architecture
3. **[TODO.md](TODO.md)** - See what to build next
4. **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database troubleshooting

---

## 🎉 You're Almost There!

Just update the password in `backend/.env` and run:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Then in another terminal:

```bash
cd frontend
npm install
npm run dev
```

**Happy coding! 🚀**
