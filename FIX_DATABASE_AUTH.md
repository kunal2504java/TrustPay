# Fix Database Authentication Issue

## Problem
`password authentication failed for user "postgres"`

## Solution: Create a Dedicated User

### Step 1: Connect to PostgreSQL

```bash
psql -U postgres
```

Enter your postgres password when prompted.

### Step 2: Create TrustPay User

Inside psql, run these commands:

```sql
-- Create a new user for TrustPay
CREATE USER trustpay_user WITH PASSWORD 'trustpay_dev_password';

-- Grant privileges on the database
GRANT ALL PRIVILEGES ON DATABASE trustpay TO trustpay_user;

-- Connect to trustpay database
\c trustpay

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO trustpay_user;

-- Grant table creation privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO trustpay_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO trustpay_user;

-- Exit
\q
```

### Step 3: Update backend/.env

Open `backend/.env` and change the DATABASE_URL to:

```env
DATABASE_URL=postgresql://trustpay_user:trustpay_dev_password@localhost/trustpay
```

### Step 4: Test Connection

```bash
# Test the new user can connect
psql -U trustpay_user -d trustpay

# If successful, you'll see:
# trustpay=>

# Exit
\q
```

### Step 5: Start Backend

```bash
cd backend
python main.py
```

---

## Alternative: Find Your Postgres Password

If you want to use the postgres user instead, you need to find/reset the password:

### Option A: Reset Postgres Password

```bash
# Connect to PostgreSQL (if you can)
psql -U postgres

# Inside psql, reset the password
ALTER USER postgres WITH PASSWORD 'new_password_here';
\q
```

Then update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:new_password_here@localhost/trustpay
```

### Option B: Check pg_hba.conf (Advanced)

If you're on Windows and installed PostgreSQL recently, the default might be:
- Username: `postgres`
- Password: The one you set during installation

Location of pg_hba.conf on Windows:
```
C:\Program Files\PostgreSQL\[version]\data\pg_hba.conf
```

---

## Quick Fix Commands (Copy-Paste)

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Run these SQL commands:
CREATE USER trustpay_user WITH PASSWORD 'trustpay_dev_password';
GRANT ALL PRIVILEGES ON DATABASE trustpay TO trustpay_user;
\c trustpay
GRANT ALL ON SCHEMA public TO trustpay_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO trustpay_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO trustpay_user;
\q

# 3. Test connection
psql -U trustpay_user -d trustpay
\q
```

Then update `backend/.env`:
```env
DATABASE_URL=postgresql://trustpay_user:trustpay_dev_password@localhost/trustpay
```

And start the backend:
```bash
cd backend
python main.py
```

---

## Verification

After fixing, you should see:

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Visit http://localhost:8000/docs to see the API documentation!

---

## Still Having Issues?

### Check PostgreSQL is Running

```bash
# Windows - Check service status
sc query postgresql-x64-14

# Or check in Services app (services.msc)
```

### Check Connection String Format

The format should be:
```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://trustpay_user:trustpay_dev_password@localhost:5432/trustpay
```

### Enable Password Authentication

If using peer authentication, you might need to edit `pg_hba.conf`:

1. Find the file (usually in PostgreSQL data directory)
2. Change `peer` to `md5` for local connections
3. Restart PostgreSQL service

---

**Recommended**: Use the dedicated user approach (trustpay_user) for development!
