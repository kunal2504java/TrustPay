"""
Quick test to verify password hashing and verification
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.security import get_password_hash, verify_password

# Test password
test_password = "seller123"

# Hash it
hashed = get_password_hash(test_password)
print(f"Password: {test_password}")
print(f"Hashed: {hashed}")

# Verify it
is_valid = verify_password(test_password, hashed)
print(f"Verification: {is_valid}")

# Test with wrong password
is_invalid = verify_password("wrongpassword", hashed)
print(f"Wrong password verification: {is_invalid}")
