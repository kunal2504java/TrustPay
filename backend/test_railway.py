"""
Quick diagnostic script to test Railway environment
"""
import os
import sys

print("=== Railway Environment Diagnostic ===\n")

# Check critical environment variables
critical_vars = [
    "DATABASE_URL",
    "SECRET_KEY",
]

optional_vars = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "FRONTEND_URL",
    "REDIS_URL",
]

print("Critical Variables:")
for var in critical_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive data
        if "DATABASE_URL" in var:
            print(f"✓ {var}: {value[:20]}... (length: {len(value)})")
        else:
            print(f"✓ {var}: ****** (length: {len(value)})")
    else:
        print(f"✗ {var}: MISSING")

print("\nOptional Variables:")
for var in optional_vars:
    value = os.getenv(var)
    if value:
        print(f"✓ {var}: Set")
    else:
        print(f"- {var}: Not set")

# Test database connection
print("\n=== Database Connection Test ===")
try:
    from sqlalchemy import create_engine, text
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        print("✗ DATABASE_URL not set")
        sys.exit(1)
    
    # Fix postgres:// to postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        print("✓ Fixed DATABASE_URL scheme (postgres:// -> postgresql://)")
    
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    sys.exit(1)

print("\n=== All checks passed! ===")
