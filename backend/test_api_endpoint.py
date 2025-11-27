import requests
import json

# Test the API endpoint directly
BASE_URL = "http://localhost:8000"

def test_login():
    """Test login to get auth token"""
    print("\n🔐 Testing login...")
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "email": "test@trustpay.com",
            "password": "test123"
        }
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful")
        print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
        return data.get('access_token')
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_list_escrows(token):
    """Test listing escrows with auth token"""
    print("\n📋 Testing list escrows...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/api/v1/escrows/",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ List escrows successful")
        print(f"Found {len(data)} escrows")
        return data
    else:
        print(f"❌ List escrows failed")
        print(f"Response: {response.text}")
        return None

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing health endpoint...")
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Health check passed: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("TrustPay API Endpoint Test")
    print("=" * 60)
    
    # Test health
    test_health()
    
    # Test login
    token = test_login()
    
    if token:
        # Test list escrows
        test_list_escrows(token)
    
    print("\n" + "=" * 60)
