from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.services.websocket_manager import manager
from app.core.security import get_current_user_ws
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time escrow updates
    
    Client should connect with: ws://backend-url/api/v1/ws?token=<jwt_token>
    
    Message types from client:
    - {"type": "subscribe", "escrow_id": "uuid"} - Subscribe to escrow updates
    - {"type": "unsubscribe", "escrow_id": "uuid"} - Unsubscribe from escrow
    - {"type": "ping"} - Keep connection alive
    
    Message types from server:
    - {"type": "connected", "user_id": "uuid"} - Connection established
    - {"type": "escrow_update", "escrow_id": "uuid", "data": {...}} - Escrow updated
    - {"type": "payment_status", "escrow_id": "uuid", "status": "..."} - Payment status changed
    - {"type": "status_change", "escrow_id": "uuid", "old_status": "...", "new_status": "..."} - Escrow status changed
    - {"type": "pong"} - Response to ping
    - {"type": "error", "message": "..."} - Error occurred
    """
    
    # Verify token and get user
    try:
        user = await get_current_user_ws(token)
        user_id = str(user.id)
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Connect the user
    await manager.connect(websocket, user_id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "message": "WebSocket connection established"
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get("type")
                
                if message_type == "subscribe":
                    escrow_id = message.get("escrow_id")
                    if escrow_id:
                        await manager.subscribe_to_escrow(user_id, escrow_id)
                        await websocket.send_json({
                            "type": "subscribed",
                            "escrow_id": escrow_id
                        })
                
                elif message_type == "unsubscribe":
                    escrow_id = message.get("escrow_id")
                    if escrow_id:
                        manager.unsubscribe_from_escrow(user_id, escrow_id)
                        await websocket.send_json({
                            "type": "unsubscribed",
                            "escrow_id": escrow_id
                        })
                
                elif message_type == "ping":
                    await websocket.send_json({"type": "pong"})
                
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    })
            
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)
