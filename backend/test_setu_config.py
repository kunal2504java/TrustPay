"""
Test script to verify Setu configuration and API connectivity
Run this before creating escrows to ensure everything is set up correctly
"""
import asyncio
import sys
from app.core.config import settings
from app.services.setu_service import SetuService

async def test_setu_config():
    """Test Setu configuration and connectivity"""
    
    print("=" * 60)
    print("SETU CONFIGURATION TEST")
    print("=" * 60)
    
    # Check configuration
    print("\n1. Checking Configuration...")
    print(f"   Base URL: {settings.SETU_BASE_URL}")
    print(f"   Client ID: {'✓ Set' if settings.SETU_CLIENT_ID else '✗ Missing'}")
    print(f"   Client Secret: {'✓ Set' if settings.SETU_CLIENT_SECRET else '✗ Missing'}")
    print(f"   Merchant ID: {'✓ Set' if settings.SETU_MERCHANT_ID else '✗ Missing'}")
    print(f"   Merchant VPA: {settings.SETU_MERCHANT_VPA or '✗ Missing'}")
    print(f"   Webhook Secret: {'✓ Set' if settings.SETU_WEBHOOK_SECRET else '✗ Missing'}")
    
    if not all([
        settings.SETU_CLIENT_ID,
        settings.SETU_CLIENT_SECRET,
        settings.SETU_MERCHANT_ID,
        settings.SETU_MERCHANT_VPA
    ]):
        print("\n❌ ERROR: Missing required Setu configuration!")
        print("   Please update your .env file with Setu credentials")
        return False
    
    # Test OAuth authentication
    print("\n2. Testing OAuth Authentication...")
    try:
        setu_service = SetuService()
        token = await setu_service._get_access_token()
        print(f"   ✓ Successfully obtained access token")
        print(f"   Token (first 20 chars): {token[:20]}...")
    except Exception as e:
        print(f"   ✗ Authentication failed: {e}")
        return False
    
    # Test collect request creation (with test data)
    print("\n3. Testing Collect Request Creation...")
    print("   Note: This will create a test collect request")
    print("   Using test VPA: test@paytm")
    
    try:
        collect_response = await setu_service.create_collect_request(
            amount=10000,  # ₹100.00
            customer_vpa="test@paytm",
            reference_id="TEST_" + str(asyncio.get_event_loop().time()),
            transaction_note="Test collect request from TrustPay",
            metadata={"test": True},
            expire_after=2  # 2 minutes
        )
        print(f"   ✓ Collect request created successfully")
        print(f"   Collect ID: {collect_response.get('id', 'N/A')}")
        print(f"   Status: {collect_response.get('status', 'N/A')}")
        
        # Test get collect status
        if collect_response.get('id'):
            print("\n4. Testing Get Collect Status...")
            try:
                status_response = await setu_service.get_collect_status(collect_response['id'])
                print(f"   ✓ Status retrieved successfully")
                print(f"   Current Status: {status_response.get('status', 'N/A')}")
            except Exception as e:
                print(f"   ✗ Status retrieval failed: {e}")
        
    except Exception as e:
        print(f"   ✗ Collect request failed: {e}")
        print(f"   Error details: {str(e)}")
        return False
    
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour Setu configuration is working correctly.")
    print("You can now create escrows with UPI collect requests.")
    return True

if __name__ == "__main__":
    result = asyncio.run(test_setu_config())
    sys.exit(0 if result else 1)
