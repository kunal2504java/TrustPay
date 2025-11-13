# TrustPay - Database Setup Guide

## PostgreSQL Setup on Windows

### Issue: Password Authentication Failed

If you get `password authentication failed for user "Kunal"`, it means PostgreSQL is trying to use your Windows username instead of the postgres user.

### Solution 1: Create Database with Postgres User

```bash
# Method 1: Specify the postgres user explicitly
createdb -U postgres trustpay

# You'll be prompted for the postgres password
```

### Solution 2: Use psql Command Line

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Inside psql, create the database
CREATE DATABASE trustpay;

# Verify it was created
\l

# Exit psql
\q
```

### Solution 3: Create User with Your Windows Username

This is the recommended approach for development:

```bash
# Connect as postgres
psql -U postgres

# Inside psql, create a user matching your Windows username
CREATE USER "Kunal" WITH PASSWORD 'your_password_here';

# Grant superuser privileges (for development)
ALTER USER "Kunal" WITH SUPERUSER;

# Create the database
CREATE DATABASE trustpay OWNER "Kunal";

# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE trustpay TO "Kunal";

# Exit
\q
```

Now you can use `createdb trustpay` without specifying -U postgres.

### Solution 4: Use pgAdmin (GUI Method)

1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" → "Database"
5. Name: `trustpay`
6. Owner: `postgres` (or your user)
7. Click "Save"

---

## Configure Backend Database Connection

After creating the database, update your backend configuration:

### Step 1: Copy Environment File

```bash
cd backend
cp .env.example .env
```

### Step 2: Edit .env File

Open `backend/.env` and update the DATABASE_URL:

**If using postgres user:**
```env
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost/trustpay
```

**If you created a user with your Windows username:**
```env
DATABASE_URL=postgresql://Kunal:your_password@localhost/trustpay
```

**Default PostgreSQL port is 5432, if different:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/trustpay
```

### Step 3: Generate Secret Key

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and add to `.env`:
```env
SECRET_KEY=your-generated-secret-key-here
```

### Step 4: Complete .env Configuration

Your `backend/.env` should look like:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost/trustpay

# Security
SECRET_KEY=your-generated-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Blockchain (Optional for now)
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=
CONTRACT_ADDRESS=

# UPI Gateway (Optional for now)
SETU_API_KEY=
SETU_BASE_URL=https://api.setu.co

# Redis (Optional for now)
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

## Verify Database Connection

### Test Connection with psql

```bash
# Test connection
psql -U postgres -d trustpay

# If successful, you'll see:
# trustpay=#

# List tables (should be empty initially)
\dt

# Exit
\q
```

### Test with Python

Create a test file `backend/test_db.py`:

```python
import asyncio
from app.core.database import engine
from sqlalchemy import text

async def test_connection():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.fetchone()
            print("✅ Database connection successful!")
            print(f"PostgreSQL version: {version[0]}")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
```

Run the test:
```bash
cd backend
python test_db.py
```

---

## Start Backend Server

Once database is configured:

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

The tables will be created automatically on first run!

---

## Verify Tables Were Created

```bash
# Connect to database
psql -U postgres -d trustpay

# List all tables
\dt

# You should see:
# - users
# - escrows
# - confirmations
# - disputes
# - blockchain_logs

# Describe a table
\d users

# Exit
\q
```

---

## Common Issues & Solutions

### Issue 1: "database trustpay does not exist"
**Solution**: Create it first using one of the methods above

### Issue 2: "password authentication failed"
**Solution**: 
- Check your password is correct
- Use `-U postgres` flag
- Or create a user matching your Windows username

### Issue 3: "could not connect to server"
**Solution**:
- Ensure PostgreSQL service is running
- Check Windows Services → PostgreSQL should be "Running"
- Or restart: `net stop postgresql-x64-14` then `net start postgresql-x64-14`

### Issue 4: "peer authentication failed"
**Solution**: This is a Linux issue, not common on Windows

### Issue 5: Port 5432 already in use
**Solution**:
- Another PostgreSQL instance is running
- Check Task Manager
- Or use a different port in DATABASE_URL

---

## Quick Reference Commands

```bash
# Create database
createdb -U postgres trustpay

# Drop database (careful!)
dropdb -U postgres trustpay

# Connect to database
psql -U postgres -d trustpay

# List databases
psql -U postgres -c "\l"

# List tables in trustpay
psql -U postgres -d trustpay -c "\dt"

# Backup database
pg_dump -U postgres trustpay > backup.sql

# Restore database
psql -U postgres trustpay < backup.sql
```

---

## Next Steps

1. ✅ Create database
2. ✅ Configure backend/.env
3. ✅ Test connection
4. ✅ Start backend server
5. ✅ Verify tables created
6. 🚀 Start developing!

---

**Need more help?** Check [SETUP.md](../SETUP.md) or [QUICK_START.md](../QUICK_START.md)
