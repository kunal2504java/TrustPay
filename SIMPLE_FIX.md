# Simple Database Fix

## Option 1: Find Your Postgres Password

Your postgres password is the one you set when you installed PostgreSQL.

Common default passwords people use:
- `postgres`
- `admin`
- `root`
- `12345678`
- The password you set during installation

## Option 2: Reset Postgres Password

```bash
# 1. Connect to postgres (if you can remember the password)
psql -U postgres

# 2. Reset the password
ALTER USER postgres WITH PASSWORD 'newpassword123';

# 3. Exit
\q
```

Then update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:newpassword123@localhost/trustpay
```

## Option 3: Use Trust Authentication (Development Only)

### Step 1: Find pg_hba.conf

On Windows, it's usually at:
```
C:\Program Files\PostgreSQL\[version]\data\pg_hba.conf
```

For example:
```
C:\Program Files\PostgreSQL\14\data\pg_hba.conf
C:\Program Files\PostgreSQL\15\data\pg_hba.conf
C:\Program Files\PostgreSQL\16\data\pg_hba.conf
```

### Step 2: Edit pg_hba.conf

Open as Administrator and find lines like:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
```

Change `scram-sha-256` to `trust`:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
```

### Step 3: Restart PostgreSQL

```bash
# Windows - Restart PostgreSQL service
net stop postgresql-x64-14
net start postgresql-x64-14
```

Or use Services app (services.msc) to restart PostgreSQL.

### Step 4: Update .env

```env
DATABASE_URL=postgresql://postgres@localhost/trustpay
```

(No password needed with trust authentication)

---

## Recommended Quick Fix

**Just tell me your postgres password and I'll update the .env file!**

Or if you don't remember it, run:

```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'mynewpassword';
\q
```

Then I'll update the .env with: `postgresql://postgres:mynewpassword@localhost/trustpay`
