from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import json
import base64
import resend
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'sync-messaging-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ConversationCreate(BaseModel):
    name: Optional[str] = None
    is_group: bool = False
    participant_ids: List[str]

class ConversationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: Optional[str] = None
    is_group: bool
    participants: List[UserResponse]
    last_message: Optional[dict] = None
    unread_count: int = 0
    created_at: str
    updated_at: str

class MessageCreate(BaseModel):
    conversation_id: str
    content: str
    message_type: str = "text"
    file_url: Optional[str] = None
    file_name: Optional[str] = None

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    conversation_id: str
    sender_id: str
    sender: Optional[UserResponse] = None
    content: str
    message_type: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    created_at: str
    read_by: List[str] = []

class AddParticipantsRequest(BaseModel):
    user_ids: List[str]

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ==================== UTILITIES ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_user_by_id(user_id: str) -> Optional[dict]:
    return await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})

# ==================== WEBSOCKET MANAGER ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        # Update user online status
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"is_online": True, "last_seen": datetime.now(timezone.utc).isoformat()}}
        )
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
    
    async def broadcast_to_conversation(self, conversation_id: str, message: dict, exclude_user: str = None):
        conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
        if conversation:
            for participant in conversation.get("participant_ids", []):
                if participant != exclude_user and participant in self.active_connections:
                    await self.send_to_user(participant, message)

manager = ConnectionManager()

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "avatar": None,
        "is_online": False,
        "last_seen": now,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        avatar=None,
        is_online=False,
        last_seen=now
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        avatar=user.get("avatar"),
        is_online=user.get("is_online", False),
        last_seen=user.get("last_seen")
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Generate a password reset token"""
    user = await db.users.find_one({"email": data.email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "Si cet email existe, un lien de réinitialisation a été généré"}
    
    # Generate reset token (valid for 1 hour)
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.delete_many({"user_id": user["id"]})  # Remove old tokens
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user["id"],
        "email": data.email,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # In production, send email with reset link
    # For now, return the token directly (for testing)
    logger.info(f"Password reset token generated for {data.email}: {reset_token}")
    
    return {
        "message": "Token de réinitialisation généré",
        "reset_token": reset_token,  # Remove this in production - send via email instead
        "expires_in": "1 hour"
    }

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using token"""
    reset_record = await db.password_resets.find_one({"token": data.token}, {"_id": 0})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    # Check if token expired
    expires_at = datetime.fromisoformat(reset_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": data.token})
        raise HTTPException(status_code=400, detail="Token expiré")
    
    # Validate password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
    
    # Update password
    hashed_password = hash_password(data.new_password)
    await db.users.update_one(
        {"id": reset_record["user_id"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Delete used token
    await db.password_resets.delete_one({"token": data.token})
    
    return {"message": "Mot de passe réinitialisé avec succès"}

@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change password for authenticated user"""
    user = await db.users.find_one({"id": current_user["id"]})
    
    if not verify_password(data.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 6 caractères")
    
    hashed_password = hash_password(data.new_password)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password": hashed_password}}
    )
    
    return {"message": "Mot de passe modifié avec succès"}

# ==================== USER ENDPOINTS ====================

@api_router.get("/users/search", response_model=List[UserResponse])
async def search_users(q: str, current_user: dict = Depends(get_current_user)):
    if len(q) < 2:
        return []
    
    users = await db.users.find(
        {
            "$and": [
                {"id": {"$ne": current_user["id"]}},
                {"$or": [
                    {"name": {"$regex": q, "$options": "i"}},
                    {"email": {"$regex": q, "$options": "i"}}
                ]}
            ]
        },
        {"_id": 0, "password": 0}
    ).to_list(20)
    
    return [UserResponse(**u) for u in users]

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.put("/users/profile")
async def update_profile(name: Optional[str] = None, avatar: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if name:
        update_data["name"] = name
    if avatar:
        update_data["avatar"] = avatar
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await get_user_by_id(current_user["id"])
    return UserResponse(**updated_user)

# ==================== CONVERSATION ENDPOINTS ====================

@api_router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(data: ConversationCreate, current_user: dict = Depends(get_current_user)):
    participant_ids = list(set([current_user["id"]] + data.participant_ids))
    
    # For 1-to-1 chat, check if conversation already exists
    if not data.is_group and len(participant_ids) == 2:
        existing = await db.conversations.find_one({
            "is_group": False,
            "participant_ids": {"$all": participant_ids, "$size": 2}
        }, {"_id": 0})
        
        if existing:
            participants = []
            for pid in existing["participant_ids"]:
                user = await get_user_by_id(pid)
                if user:
                    participants.append(UserResponse(**user))
            
            return ConversationResponse(
                id=existing["id"],
                name=existing.get("name"),
                is_group=existing["is_group"],
                participants=participants,
                last_message=existing.get("last_message"),
                unread_count=0,
                created_at=existing["created_at"],
                updated_at=existing["updated_at"]
            )
    
    conv_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    conv_doc = {
        "id": conv_id,
        "name": data.name if data.is_group else None,
        "is_group": data.is_group,
        "participant_ids": participant_ids,
        "last_message": None,
        "created_at": now,
        "updated_at": now,
        "created_by": current_user["id"]
    }
    
    await db.conversations.insert_one(conv_doc)
    
    # Get participant details
    participants = []
    for pid in participant_ids:
        user = await get_user_by_id(pid)
        if user:
            participants.append(UserResponse(**user))
    
    return ConversationResponse(
        id=conv_id,
        name=data.name if data.is_group else None,
        is_group=data.is_group,
        participants=participants,
        last_message=None,
        unread_count=0,
        created_at=now,
        updated_at=now
    )

@api_router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    conversations = await db.conversations.find(
        {"participant_ids": current_user["id"]},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    
    result = []
    for conv in conversations:
        participants = []
        for pid in conv["participant_ids"]:
            user = await get_user_by_id(pid)
            if user:
                participants.append(UserResponse(**user))
        
        # Count unread messages
        unread_count = await db.messages.count_documents({
            "conversation_id": conv["id"],
            "sender_id": {"$ne": current_user["id"]},
            "read_by": {"$nin": [current_user["id"]]}
        })
        
        result.append(ConversationResponse(
            id=conv["id"],
            name=conv.get("name"),
            is_group=conv["is_group"],
            participants=participants,
            last_message=conv.get("last_message"),
            unread_count=unread_count,
            created_at=conv["created_at"],
            updated_at=conv["updated_at"]
        ))
    
    return result

@api_router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participant_ids": current_user["id"]},
        {"_id": 0}
    )
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    participants = []
    for pid in conv["participant_ids"]:
        user = await get_user_by_id(pid)
        if user:
            participants.append(UserResponse(**user))
    
    unread_count = await db.messages.count_documents({
        "conversation_id": conversation_id,
        "sender_id": {"$ne": current_user["id"]},
        "read_by": {"$nin": [current_user["id"]]}
    })
    
    return ConversationResponse(
        id=conv["id"],
        name=conv.get("name"),
        is_group=conv["is_group"],
        participants=participants,
        last_message=conv.get("last_message"),
        unread_count=unread_count,
        created_at=conv["created_at"],
        updated_at=conv["updated_at"]
    )

@api_router.post("/conversations/{conversation_id}/participants")
async def add_participants(conversation_id: str, data: AddParticipantsRequest, current_user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participant_ids": current_user["id"], "is_group": True},
        {"_id": 0}
    )
    
    if not conv:
        raise HTTPException(status_code=404, detail="Group conversation not found")
    
    new_participants = list(set(conv["participant_ids"] + data.user_ids))
    
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"participant_ids": new_participants, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Participants added successfully"}

# ==================== MESSAGE ENDPOINTS ====================

@api_router.post("/messages", response_model=MessageResponse)
async def send_message(data: MessageCreate, current_user: dict = Depends(get_current_user)):
    # Verify user is part of conversation
    conv = await db.conversations.find_one(
        {"id": data.conversation_id, "participant_ids": current_user["id"]},
        {"_id": 0}
    )
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    msg_doc = {
        "id": msg_id,
        "conversation_id": data.conversation_id,
        "sender_id": current_user["id"],
        "content": data.content,
        "message_type": data.message_type,
        "file_url": data.file_url,
        "file_name": data.file_name,
        "created_at": now,
        "read_by": [current_user["id"]]
    }
    
    await db.messages.insert_one(msg_doc)
    
    # Update conversation's last message
    last_message = {
        "content": data.content if data.message_type == "text" else f"Sent a {data.message_type}",
        "sender_id": current_user["id"],
        "created_at": now
    }
    
    await db.conversations.update_one(
        {"id": data.conversation_id},
        {"$set": {"last_message": last_message, "updated_at": now}}
    )
    
    # Get sender info
    sender = await get_user_by_id(current_user["id"])
    
    response = MessageResponse(
        id=msg_id,
        conversation_id=data.conversation_id,
        sender_id=current_user["id"],
        sender=UserResponse(**sender) if sender else None,
        content=data.content,
        message_type=data.message_type,
        file_url=data.file_url,
        file_name=data.file_name,
        created_at=now,
        read_by=[current_user["id"]]
    )
    
    # Broadcast to other participants via WebSocket
    ws_message = {
        "type": "new_message",
        "data": response.model_dump()
    }
    await manager.broadcast_to_conversation(data.conversation_id, ws_message, exclude_user=current_user["id"])
    
    return response

@api_router.get("/messages/{conversation_id}", response_model=List[MessageResponse])
async def get_messages(conversation_id: str, limit: int = 50, before: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    # Verify user is part of conversation
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participant_ids": current_user["id"]},
        {"_id": 0}
    )
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    query = {"conversation_id": conversation_id}
    if before:
        query["created_at"] = {"$lt": before}
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    messages.reverse()  # Return in chronological order
    
    result = []
    for msg in messages:
        sender = await get_user_by_id(msg["sender_id"])
        result.append(MessageResponse(
            id=msg["id"],
            conversation_id=msg["conversation_id"],
            sender_id=msg["sender_id"],
            sender=UserResponse(**sender) if sender else None,
            content=msg["content"],
            message_type=msg["message_type"],
            file_url=msg.get("file_url"),
            file_name=msg.get("file_name"),
            created_at=msg["created_at"],
            read_by=msg.get("read_by", [])
        ))
    
    return result

@api_router.post("/messages/{conversation_id}/read")
async def mark_messages_read(conversation_id: str, current_user: dict = Depends(get_current_user)):
    # Verify user is part of conversation
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participant_ids": current_user["id"]},
        {"_id": 0}
    )
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "read_by": {"$nin": [current_user["id"]]}
        },
        {"$addToSet": {"read_by": current_user["id"]}}
    )
    
    return {"message": "Messages marked as read"}

# ==================== FILE UPLOAD ====================

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/files/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", 
                     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # For images, we can return a base64 data URL or just the path
    # In production, you'd use cloud storage like S3
    file_url = f"/api/files/{unique_filename}"
    
    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_type": file.content_type
    }

@api_router.get("/files/{filename}")
async def get_file(filename: str):
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# ==================== WEBSOCKET ====================

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            await websocket.close(code=4001)
            return
        
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "typing":
                    # Broadcast typing indicator
                    await manager.broadcast_to_conversation(
                        message.get("conversation_id"),
                        {"type": "typing", "user_id": user_id, "conversation_id": message.get("conversation_id")},
                        exclude_user=user_id
                    )
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"is_online": False, "last_seen": datetime.now(timezone.utc).isoformat()}}
            )
    except jwt.InvalidTokenError:
        await websocket.close(code=4001)

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Sync Messaging API"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
