from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store escrow subscriptions: escrow_id -> set of user_ids
        self.escrow_subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Clean up empty sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        logger.info(f"User {user_id} disconnected")
    
    async def subscribe_to_escrow(self, user_id: str, escrow_id: str):
        """Subscribe a user to escrow updates"""
        if escrow_id not in self.escrow_subscriptions:
            self.escrow_subscriptions[escrow_id] = set()
        
        self.escrow_subscriptions[escrow_id].add(user_id)
        logger.info(f"User {user_id} subscribed to escrow {escrow_id}")
    
    def unsubscribe_from_escrow(self, user_id: str, escrow_id: str):
        """Unsubscribe a user from escrow updates"""
        if escrow_id in self.escrow_subscriptions:
            self.escrow_subscriptions[escrow_id].discard(user_id)
            
            # Clean up empty sets
            if not self.escrow_subscriptions[escrow_id]:
                del self.escrow_subscriptions[escrow_id]
        
        logger.info(f"User {user_id} unsubscribed from escrow {escrow_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user's connections"""
        if user_id in self.active_connections:
            disconnected = set()
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection, user_id)
    
    async def broadcast_escrow_update(self, escrow_id: str, update_data: dict):
        """Broadcast an update to all users subscribed to an escrow"""
        if escrow_id not in self.escrow_subscriptions:
            return
        
        message = {
            "type": "escrow_update",
            "escrow_id": escrow_id,
            "data": update_data
        }
        
        # Send to all subscribed users
        for user_id in self.escrow_subscriptions[escrow_id]:
            await self.send_personal_message(message, user_id)
    
    async def notify_payment_status(self, escrow_id: str, status: str, user_id: str):
        """Notify about payment status changes"""
        message = {
            "type": "payment_status",
            "escrow_id": escrow_id,
            "status": status,
            "timestamp": None  # Will be set by client
        }
        
        await self.send_personal_message(message, user_id)
    
    async def notify_escrow_status_change(self, escrow_id: str, old_status: str, new_status: str):
        """Notify all parties about escrow status changes"""
        message = {
            "type": "status_change",
            "escrow_id": escrow_id,
            "old_status": old_status,
            "new_status": new_status
        }
        
        await self.broadcast_escrow_update(escrow_id, message)


# Global connection manager instance
manager = ConnectionManager()
