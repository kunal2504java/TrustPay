# WebSocket Real-Time Updates Guide

## Overview

WebSocket support has been added to enable real-time escrow status updates in the dashboard. Users will automatically receive notifications when:
- Payment status changes
- Escrow status changes (INITIATED → HELD → RELEASED/REFUNDED)
- Confirmations are added
- Disputes are raised

## Backend Setup

### WebSocket Endpoint
```
ws://your-backend-url/api/v1/ws?token=<jwt_token>
```

### Message Types

**From Client:**
- `{"type": "subscribe", "escrow_id": "uuid"}` - Subscribe to escrow updates
- `{"type": "unsubscribe", "escrow_id": "uuid"}` - Unsubscribe from escrow
- `{"type": "ping"}` - Keep connection alive

**From Server:**
- `{"type": "connected", "user_id": "uuid"}` - Connection established
- `{"type": "escrow_update", "escrow_id": "uuid", "data": {...}}` - Escrow updated
- `{"type": "payment_status", "escrow_id": "uuid", "status": "..."}` - Payment status changed
- `{"type": "status_change", "escrow_id": "uuid", "old_status": "...", "new_status": "..."}` - Escrow status changed
- `{"type": "pong"}` - Response to ping

## Frontend Usage

### 1. Automatic Connection

WebSocket automatically connects when user logs in (handled in AuthContext):

```javascript
import { wsService } from '../services/websocket';

// Connection happens automatically in AuthContext
// No manual setup needed!
```

### 2. Using the Hook in Components

```javascript
import { useEscrowUpdates } from '../hooks/useWebSocket';

function EscrowDetailPage() {
  const [escrow, setEscrow] = useState(null);
  const escrowId = "your-escrow-id";

  // Subscribe to real-time updates
  useEscrowUpdates(escrowId, (message) => {
    console.log('Escrow update received:', message);
    
    // Update local state
    if (message.type === 'escrow_update') {
      setEscrow(prev => ({
        ...prev,
        status: message.data.status
      }));
    }
  });

  return (
    <div>
      <h1>Escrow Status: {escrow?.status}</h1>
    </div>
  );
}
```

### 3. Manual Subscription

```javascript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { subscribe, unsubscribe, on } = useWebSocket();

  useEffect(() => {
    // Subscribe to escrow
    subscribe('escrow-id-123');

    // Listen for updates
    const unsubscribeListener = on('escrow_update', (message) => {
      console.log('Update:', message);
    });

    // Cleanup
    return () => {
      unsubscribe('escrow-id-123');
      unsubscribeListener();
    };
  }, []);
}
```

### 4. Listen to All Events

```javascript
const { on } = useWebSocket();

useEffect(() => {
  // Listen to connection status
  const unsub1 = on('connected', () => {
    console.log('WebSocket connected!');
  });

  const unsub2 = on('disconnected', () => {
    console.log('WebSocket disconnected');
  });

  const unsub3 = on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return () => {
    unsub1();
    unsub2();
    unsub3();
  };
}, []);
```

## Triggering Updates from Backend

### In Escrow Service

```python
from app.services.websocket_manager import manager

# After updating escrow status
await self._notify_escrow_update(escrow, event_type="status_change")

# Or manually
await manager.broadcast_escrow_update(
    str(escrow.id),
    {
        "status": escrow.status.value,
        "amount": float(escrow.amount),
        "event_type": "payment_completed"
    }
)
```

### In Webhook Handler

```python
from app.services.websocket_manager import manager

@router.post("/razorpay")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    # ... process webhook ...
    
    # Notify connected clients
    await manager.broadcast_escrow_update(
        str(escrow_id),
        {
            "status": "HELD",
            "event_type": "payment_captured"
        }
    )
```

## Testing WebSocket

### 1. Test Connection

Open browser console on your frontend:

```javascript
// Check if WebSocket is connected
console.log(wsService.ws?.readyState); // 1 = OPEN

// Send ping
wsService.ping();
```

### 2. Test with wscat (CLI tool)

```bash
npm install -g wscat

# Connect
wscat -c "ws://localhost:8000/api/v1/ws?token=YOUR_JWT_TOKEN"

# Subscribe to escrow
> {"type": "subscribe", "escrow_id": "your-escrow-id"}

# Send ping
> {"type": "ping"}
```

### 3. Monitor in Browser DevTools

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Click on the WebSocket connection
4. View Messages tab to see real-time communication

## Deployment Considerations

### Railway Backend

WebSocket is automatically supported. No additional configuration needed.

### Vercel Frontend

Vercel supports WebSocket connections. The frontend will automatically use the correct protocol (ws:// or wss://) based on your API URL.

### Environment Variables

Make sure your `VITE_API_URL` is set correctly:

```env
# Development
VITE_API_URL=http://localhost:8000

# Production
VITE_API_URL=https://your-backend.up.railway.app
```

The WebSocket service automatically converts http → ws and https → wss.

## Reconnection Logic

The WebSocket service includes automatic reconnection:
- Max 5 reconnection attempts
- 3-second delay between attempts
- Automatically resubscribes to all escrows after reconnection

## Security

- WebSocket connections require JWT authentication
- Token is passed as query parameter: `?token=<jwt>`
- Users can only subscribe to escrows they have access to
- Connection is automatically closed if token is invalid

## Troubleshooting

### Connection Fails

1. Check if backend is running
2. Verify JWT token is valid
3. Check browser console for errors
4. Ensure CORS is configured correctly

### Not Receiving Updates

1. Verify subscription: `wsService.subscriptions`
2. Check if escrow_id is correct
3. Look for errors in backend logs
4. Test with manual trigger from backend

### Connection Drops

- Normal behavior after inactivity
- Automatic reconnection will trigger
- Implement ping/pong to keep alive

## Example: Complete Integration

```javascript
import { useEscrowUpdates } from '../hooks/useWebSocket';
import { useState, useEffect } from 'react';

function EscrowDashboard() {
  const [escrows, setEscrows] = useState([]);
  const { on } = useWebSocket();

  // Listen to all escrow updates
  useEffect(() => {
    const unsubscribe = on('escrow_update', (message) => {
      setEscrows(prev => prev.map(escrow => 
        escrow.id === message.escrow_id
          ? { ...escrow, ...message.data }
          : escrow
      ));
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {escrows.map(escrow => (
        <EscrowCard key={escrow.id} escrow={escrow} />
      ))}
    </div>
  );
}
```

## Next Steps

1. Deploy backend to Railway (WebSocket will work automatically)
2. Deploy frontend to Vercel
3. Test real-time updates by:
   - Creating an escrow
   - Making a payment
   - Watching status update in real-time
4. Monitor WebSocket connections in Railway logs

---

**WebSocket is now live!** Your dashboard will automatically update when escrow statuses change, providing a seamless real-time experience for users.
