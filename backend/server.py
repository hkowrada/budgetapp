from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, date, time, timezone, timedelta
import jwt
from passlib.hash import bcrypt
from enum import Enum
import asyncio
import pytz
from zoneinfo import ZoneInfo

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = timedelta(days=30)

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Family Budget App", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    OWNER = "owner"
    COOWNER = "coowner"
    GUEST = "guest"

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class PurchaseStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress" 
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class RecurrenceType(str, Enum):
    MONTHLY = "monthly"
    WEEKLY = "weekly"
    YEARLY = "yearly"
    QUARTERLY = "quarterly"

class CalendarScope(str, Enum):
    HOUSEHOLD = "household"
    PERSONAL = "personal"

class EventTag(str, Enum):
    PERSONAL = "Personal"
    FAMILY = "Family" 
    BILLS = "Bills"
    WORK = "Work"
    HEALTH = "Health"

class ReminderChannel(str, Enum):
    INAPP = "inapp"
    EMAIL = "email"

class ReminderStatus(str, Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    SNOOZED = "snoozed"

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        if isinstance(data.get('date'), date) and not isinstance(data.get('date'), datetime):
            data['date'] = data['date'].isoformat()
        if isinstance(data.get('time'), time):
            data['time'] = data['time'].strftime('%H:%M:%S')
        if isinstance(data.get('created_at'), datetime):
            data['created_at'] = data['created_at'].isoformat()
        if isinstance(data.get('updated_at'), datetime):
            data['updated_at'] = data['updated_at'].isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        if isinstance(item.get('date'), str):
            try:
                item['date'] = datetime.fromisoformat(item['date']).date()
            except:
                pass
        if isinstance(item.get('time'), str):
            try:
                item['time'] = datetime.strptime(item['time'], '%H:%M:%S').time()
            except:
                pass
        if isinstance(item.get('created_at'), str):
            try:
                item['created_at'] = datetime.fromisoformat(item['created_at'])
            except:
                pass
        if isinstance(item.get('updated_at'), str):
            try:
                item['updated_at'] = datetime.fromisoformat(item['updated_at'])
            except:
                pass
    return item

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: TransactionType
    is_recurring: bool = False
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Account(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # bank, card, cash
    currency: str = "EUR"
    opening_balance: float = 0.0
    current_balance: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    type: TransactionType
    account_id: str
    to_account_id: Optional[str] = None  # For transfers
    category_id: Optional[str] = None  # Not required for transfers
    amount: float
    description: Optional[str] = None
    merchant: Optional[str] = None
    date: date
    is_recurring: bool = False
    is_initial: bool = False  # For one-time setup costs
    notes: Optional[str] = None

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: TransactionType
    account_id: str
    to_account_id: Optional[str] = None
    category_id: Optional[str] = None
    amount: float
    description: Optional[str] = None
    merchant: Optional[str] = None
    date: date
    is_recurring: bool = False
    is_initial: bool = False
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    type: TransactionType
    is_recurring: bool = False
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[TransactionType] = None
    is_recurring: Optional[bool] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    active: Optional[bool] = None

class CategoryMerge(BaseModel):
    source_category_id: str
    target_category_id: str

class PlannedPurchaseCreate(BaseModel):
    title: str
    estimated_cost: float
    target_date: date
    account_to_pay_from: str
    category_id: str
    installments: List[Dict[str, Any]] = []  # [{amount: float, due_date: date}]
    notes: Optional[str] = None

class PlannedPurchase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    estimated_cost: float
    target_date: date
    account_to_pay_from: str
    category_id: str
    installments: List[Dict[str, Any]] = []
    status: PurchaseStatus = PurchaseStatus.PLANNED
    linked_event_ids: List[str] = []  # Calendar events for installments
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str

class AccountCreate(BaseModel):
    name: str
    type: str  # bank, card, cash, savings, emergency
    currency: str = "EUR"
    opening_balance: float = 0.0

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = None

class BillCreate(BaseModel):
    name: str
    provider: Optional[str] = None
    category_id: str
    account_id: str
    recurrence: RecurrenceType
    due_day: int  # Day of month (1-31)
    expected_amount: float
    autopay: bool = False
    is_active: bool = True

class BillUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    expected_amount: Optional[float] = None
    due_day: Optional[int] = None
    autopay: Optional[bool] = None
    is_active: Optional[bool] = None

class Bill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    provider: Optional[str] = None
    category_id: str
    account_id: str
    recurrence: RecurrenceType
    due_day: int
    expected_amount: float
    autopay: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BudgetCreate(BaseModel):
    category_id: str
    month: int
    year: int
    limit_amount: float

class Budget(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    month: int
    year: int
    limit_amount: float
    spent_amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Calendar and Events Models
class Calendar(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    scope: CalendarScope
    owner_user_id: Optional[str] = None  # For personal calendars
    is_default: bool = False
    color: str = "#10B981"  # Default emerald color
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    calendar_id: str
    title: str
    notes: Optional[str] = None
    location: Optional[str] = None
    start: datetime
    end: datetime
    all_day: bool = False
    tags: List[EventTag] = []
    attendees: List[str] = []  # User IDs
    rrule: Optional[str] = None  # RFC 5545 RRULE string
    source_type: Optional[str] = None  # "bill", "manual"
    source_id: Optional[str] = None  # Bill ID if auto-generated

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    calendar_id: str
    title: str
    notes: Optional[str] = None
    location: Optional[str] = None
    start: datetime
    end: datetime
    all_day: bool = False
    tags: List[EventTag] = []
    attendees: List[str] = []
    rrule: Optional[str] = None
    exdates: List[datetime] = []  # Exception dates
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReminderCreate(BaseModel):
    event_id: str
    offset_minutes: int  # Minutes before event
    channel: ReminderChannel = ReminderChannel.INAPP
    message: Optional[str] = None

class Reminder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    offset_minutes: int
    channel: ReminderChannel
    status: ReminderStatus = ReminderStatus.SCHEDULED
    message: Optional[str] = None
    trigger_time: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    snoozed_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timezone: str = "Europe/Paris"
    quiet_hours_start: str = "22:00"  # 10 PM as string
    quiet_hours_end: str = "08:00"   # 8 AM as string
    default_reminder_minutes: int = 30
    email_notifications: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    total_income: float
    total_expenses: float
    monthly_surplus: float
    savings_rate: float
    upcoming_bills: List[Dict[str, Any]]
    category_breakdown: Dict[str, float]
    recent_transactions: List[Dict[str, Any]]
    current_salaries: Dict[str, Any] = Field(default_factory=dict)

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str  # CREATE, UPDATE, DELETE, VIEW
    entity: str  # transaction, bill, budget, etc.
    entity_id: str
    changes: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Authentication functions
def create_jwt_token(user_data: dict) -> str:
    payload = {
        **user_data,
        "exp": datetime.now(timezone.utc) + JWT_EXPIRATION
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    payload = verify_jwt_token(credentials.credentials)
    user_data = await db.users.find_one({"id": payload["id"]})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

async def log_audit(user_id: str, action: str, entity: str, entity_id: str, changes: Optional[Dict] = None):
    """Log user actions for audit trail"""
    audit = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        changes=changes
    )
    await db.audit_logs.insert_one(prepare_for_mongo(audit.dict()))

# Timezone utility functions
def get_paris_timezone():
    """Get Europe/Paris timezone with DST support"""
    return ZoneInfo("Europe/Paris")

def convert_to_paris_time(dt: datetime) -> datetime:
    """Convert datetime to Europe/Paris timezone"""
    if dt.tzinfo is None:
        # Assume UTC if no timezone
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(get_paris_timezone())

def is_in_quiet_hours(dt: datetime, quiet_start: time, quiet_end: time) -> bool:
    """Check if datetime is within quiet hours"""
    paris_dt = convert_to_paris_time(dt)
    current_time = paris_dt.time()
    
    if quiet_start <= quiet_end:
        # Normal case: e.g., 22:00 to 08:00 (next day)
        return current_time >= quiet_start or current_time <= quiet_end
    else:
        # Crossing midnight: e.g., 22:00 to 08:00
        return quiet_start <= current_time <= quiet_end

async def generate_bill_calendar_events():
    """Auto-generate calendar events for recurring bills"""
    bills = await db.bills.find({"is_active": True}).to_list(None)
    household_calendar = await db.calendars.find_one({"scope": "household", "is_default": True})
    
    if not household_calendar:
        # Create default household calendar
        household_calendar = Calendar(
            name="Household Calendar",
            scope=CalendarScope.HOUSEHOLD,
            is_default=True,
            color="#DC2626"
        )
        await db.calendars.insert_one(prepare_for_mongo(household_calendar.dict()))
        household_calendar = household_calendar.dict()
    
    for bill in bills:
        # Check if calendar event already exists for this bill
        existing_event = await db.events.find_one({
            "source_type": "bill",
            "source_id": bill["id"]
        })
        
        if not existing_event:
            # Create calendar event for bill due date
            paris_tz = get_paris_timezone()
            now = datetime.now(paris_tz)
            
            # Calculate next due date
            if bill["due_day"] <= now.day:
                # Next month
                if now.month == 12:
                    next_due = now.replace(year=now.year + 1, month=1, day=bill["due_day"], hour=9, minute=0, second=0, microsecond=0)
                else:
                    next_due = now.replace(month=now.month + 1, day=bill["due_day"], hour=9, minute=0, second=0, microsecond=0)
            else:
                # This month
                next_due = now.replace(day=bill["due_day"], hour=9, minute=0, second=0, microsecond=0)
            
            # Create event
            event = Event(
                calendar_id=household_calendar["id"],
                title=f"📋 {bill['name']} Due",
                notes=f"Amount: €{bill['expected_amount']} | Provider: {bill.get('provider', 'N/A')}",
                start=next_due,
                end=next_due + timedelta(hours=1),
                tags=[EventTag.BILLS],
                source_type="bill",
                source_id=bill["id"],
                created_by="system"
            )
            
            await db.events.insert_one(prepare_for_mongo(event.dict()))
            
            # Create default reminder (24 hours before)
            reminder = Reminder(
                event_id=event.id,
                offset_minutes=1440,  # 24 hours
                channel=ReminderChannel.INAPP,
                message=f"Bill due tomorrow: {bill['name']} - €{bill['expected_amount']}"
            )
            
            await db.reminders.insert_one(prepare_for_mongo(reminder.dict()))
            logger.info(f"Created calendar event and reminder for bill: {bill['name']}")

# Authentication Routes
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    user_data = await db.users.find_one({"email": login_request.email})
    if not user_data or not bcrypt.verify(login_request.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**parse_from_mongo(user_data))
    token = create_jwt_token({"id": user.id, "email": user.email, "role": user.role})
    
    await log_audit(user.id, "LOGIN", "auth", user.id)
    
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        user=user
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# User Management (Owner only)
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owner can view users")
    
    users = await db.users.find().to_list(None)
    return [User(**parse_from_mongo(user)) for user in users]

# Categories Management
@api_router.get("/categories", response_model=List[Category])
async def get_categories(current_user: User = Depends(get_current_user)):
    categories = await db.categories.find({"active": {"$ne": False}}).to_list(None)
    return [Category(**parse_from_mongo(cat)) for cat in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create categories")
    
    category = Category(**category_data.dict())
    await db.categories.insert_one(prepare_for_mongo(category.dict()))
    await log_audit(current_user.id, "CREATE", "category", category.id)
    return category

@api_router.patch("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, update_data: CategoryUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot update categories")
    
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.categories.update_one(
        {"id": category_id},
        {"$set": prepare_for_mongo(update_dict)}
    )
    
    await log_audit(current_user.id, "UPDATE", "category", category_id, update_dict)
    updated_category = await db.categories.find_one({"id": category_id})
    return Category(**parse_from_mongo(updated_category))

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot delete categories")
    
    # Soft delete by marking as inactive
    await db.categories.update_one(
        {"id": category_id},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await log_audit(current_user.id, "DELETE", "category", category_id)
    return {"message": "Category deleted successfully"}

@api_router.post("/categories/merge")
async def merge_categories(merge_data: CategoryMerge, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot merge categories")
    
    source_cat = await db.categories.find_one({"id": merge_data.source_category_id})
    target_cat = await db.categories.find_one({"id": merge_data.target_category_id})
    
    if not source_cat or not target_cat:
        raise HTTPException(status_code=404, detail="One or both categories not found")
    
    # Update all transactions to use target category
    await db.transactions.update_many(
        {"category_id": merge_data.source_category_id},
        {"$set": {"category_id": merge_data.target_category_id}}
    )
    
    # Update all budgets to use target category
    await db.budgets.update_many(
        {"category_id": merge_data.source_category_id},
        {"$set": {"category_id": merge_data.target_category_id}}
    )
    
    # Soft delete source category
    await db.categories.update_one(
        {"id": merge_data.source_category_id},
        {"$set": {"active": False}}
    )
    
    await log_audit(current_user.id, "MERGE", "category", merge_data.source_category_id, {
        "merged_into": merge_data.target_category_id
    })
    
    return {"message": f"Category '{source_cat['name']}' merged into '{target_cat['name']}'"}

# Enhanced Transactions
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(txn_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create transactions")
    
    # Validate accounts exist
    account = await db.accounts.find_one({"id": txn_data.account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if txn_data.type == TransactionType.TRANSFER:
        if not txn_data.to_account_id:
            raise HTTPException(status_code=400, detail="Transfer requires to_account_id")
        
        to_account = await db.accounts.find_one({"id": txn_data.to_account_id})
        if not to_account:
            raise HTTPException(status_code=404, detail="To account not found")
    
    # Validate category for non-transfers
    if txn_data.type != TransactionType.TRANSFER and txn_data.category_id:
        category = await db.categories.find_one({"id": txn_data.category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    transaction = Transaction(**txn_data.dict(), created_by=current_user.id)
    await db.transactions.insert_one(prepare_for_mongo(transaction.dict()))
    
    # Update account balances
    if txn_data.type == TransactionType.INCOME:
        await db.accounts.update_one(
            {"id": txn_data.account_id},
            {"$inc": {"current_balance": txn_data.amount}}
        )
    elif txn_data.type == TransactionType.EXPENSE:
        await db.accounts.update_one(
            {"id": txn_data.account_id},
            {"$inc": {"current_balance": -txn_data.amount}}
        )
    elif txn_data.type == TransactionType.TRANSFER:
        # Deduct from source account
        await db.accounts.update_one(
            {"id": txn_data.account_id},
            {"$inc": {"current_balance": -txn_data.amount}}
        )
        # Add to destination account
        await db.accounts.update_one(
            {"id": txn_data.to_account_id},
            {"$inc": {"current_balance": txn_data.amount}}
        )
    
    await log_audit(current_user.id, "CREATE", "transaction", transaction.id)
    return transaction

# Accounts Management
@api_router.post("/accounts", response_model=Account)
async def create_account(account_data: AccountCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create accounts")
    
    account = Account(**account_data.dict(), current_balance=account_data.opening_balance)
    await db.accounts.insert_one(prepare_for_mongo(account.dict()))
    await log_audit(current_user.id, "CREATE", "account", account.id)
    return account

@api_router.patch("/accounts/{account_id}", response_model=Account)
async def update_account(account_id: str, update_data: AccountUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot update accounts")
    
    account = await db.accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.accounts.update_one(
        {"id": account_id},
        {"$set": prepare_for_mongo(update_dict)}
    )
    
    await log_audit(current_user.id, "UPDATE", "account", account_id, update_dict)
    updated_account = await db.accounts.find_one({"id": account_id})
    return Account(**parse_from_mongo(updated_account))

# Planned Purchases
@api_router.get("/planned-purchases", response_model=List[PlannedPurchase])
async def get_planned_purchases(current_user: User = Depends(get_current_user)):
    purchases = await db.planned_purchases.find().to_list(None)
    return [PlannedPurchase(**parse_from_mongo(purchase)) for purchase in purchases]

@api_router.post("/planned-purchases", response_model=PlannedPurchase)
async def create_planned_purchase(purchase_data: PlannedPurchaseCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create planned purchases")
    
    # Validate account and category exist
    account = await db.accounts.find_one({"id": purchase_data.account_to_pay_from})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    category = await db.categories.find_one({"id": purchase_data.category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    purchase = PlannedPurchase(**purchase_data.dict(), created_by=current_user.id)
    await db.planned_purchases.insert_one(prepare_for_mongo(purchase.dict()))
    
    # Create calendar events for installments
    if purchase_data.installments:
        household_calendar = await db.calendars.find_one({"scope": "household"})
        if household_calendar:
            event_ids = []
            
            for i, installment in enumerate(purchase_data.installments):
                installment_date = datetime.fromisoformat(installment["due_date"]).replace(hour=10, minute=0)
                
                event = Event(
                    calendar_id=household_calendar["id"],
                    title=f"💰 {purchase.title} - Installment {i+1}",
                    notes=f"Amount: €{installment['amount']} | Purchase: {purchase.title}",
                    start=installment_date,
                    end=installment_date + timedelta(hours=1),
                    tags=[EventTag.BILLS],
                    source_type="planned_purchase",
                    source_id=purchase.id,
                    created_by=current_user.id
                )
                
                await db.events.insert_one(prepare_for_mongo(event.dict()))
                event_ids.append(event.id)
            
            # Update purchase with linked events
            await db.planned_purchases.update_one(
                {"id": purchase.id},
                {"$set": {"linked_event_ids": event_ids}}
            )
    
    await log_audit(current_user.id, "CREATE", "planned_purchase", purchase.id)
    return purchase

@api_router.post("/planned-purchases/{purchase_id}/convert-installment")
async def convert_installment_to_expense(
    purchase_id: str,
    installment_index: int,
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot convert installments")
    
    purchase = await db.planned_purchases.find_one({"id": purchase_id})
    if not purchase:
        raise HTTPException(status_code=404, detail="Planned purchase not found")
    
    if installment_index >= len(purchase["installments"]):
        raise HTTPException(status_code=400, detail="Invalid installment index")
    
    installment = purchase["installments"][installment_index]
    
    # Create expense transaction
    txn_data = TransactionCreate(
        type=TransactionType.EXPENSE,
        account_id=purchase["account_to_pay_from"],
        category_id=purchase["category_id"],
        amount=installment["amount"],
        description=f"{purchase['title']} - Installment {installment_index + 1}",
        date=datetime.fromisoformat(installment["due_date"]).date()
    )
    
    transaction = Transaction(**txn_data.dict(), created_by=current_user.id)
    await db.transactions.insert_one(prepare_for_mongo(transaction.dict()))
    
    # Update account balance
    await db.accounts.update_one(
        {"id": purchase["account_to_pay_from"]},
        {"$inc": {"current_balance": -installment["amount"]}}
    )
    
    # Mark installment as paid
    installment["paid"] = True
    installment["paid_at"] = datetime.now(timezone.utc).isoformat()
    installment["transaction_id"] = transaction.id
    
    # Update purchase
    purchase["installments"][installment_index] = installment
    await db.planned_purchases.update_one(
        {"id": purchase_id},
        {"$set": {"installments": purchase["installments"]}}
    )
    
    await log_audit(current_user.id, "CONVERT", "planned_purchase", purchase_id, {
        "installment_index": installment_index,
        "transaction_id": transaction.id
    })
    
    return {"message": "Installment converted to expense", "transaction_id": transaction.id}

# Password Management
@api_router.post("/auth/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot change password")
    
    # Verify current password
    user_data = await db.users.find_one({"id": current_user.id})
    if not user_data or not bcrypt.verify(password_data.old_password, user_data["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    new_password_hash = bcrypt.hash(password_data.new_password)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "password_hash": new_password_hash,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await log_audit(current_user.id, "CHANGE_PASSWORD", "user", current_user.id)
    
    return {"message": "Password changed successfully"}

# Enhanced Calendar Events (with proper permissions)
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create events")
    
    # Check calendar access and permissions
    calendar = await db.calendars.find_one({"id": event_data.calendar_id})
    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")
    
    # Permission check: can only write to own personal calendar or household calendar
    if calendar["scope"] == "personal" and calendar["owner_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create events in other users' personal calendars")
    
    event = Event(**event_data.dict(), created_by=current_user.id)
    await db.events.insert_one(prepare_for_mongo(event.dict()))
    await log_audit(current_user.id, "CREATE", "event", event.id)
    return event

# Accounts
@api_router.get("/accounts", response_model=List[Account])
async def get_accounts(current_user: User = Depends(get_current_user)):
    accounts = await db.accounts.find().to_list(None)
    return [Account(**parse_from_mongo(acc)) for acc in accounts]

@api_router.post("/accounts", response_model=Account)
async def create_account(account_data: Account, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create accounts")
    
    await db.accounts.insert_one(prepare_for_mongo(account_data.dict()))
    await log_audit(current_user.id, "CREATE", "account", account_data.id)
    return account_data

# Transactions
@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    limit: int = 100,
    offset: int = 0,
    category_id: Optional[str] = None,
    account_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if account_id:
        query["account_id"] = account_id
    if start_date:
        query["date"] = {"$gte": start_date.isoformat()}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date.isoformat()
        else:
            query["date"] = {"$lte": end_date.isoformat()}
    
    transactions = await db.transactions.find(query).skip(offset).limit(limit).to_list(None)
    return [Transaction(**parse_from_mongo(txn)) for txn in transactions]

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(txn_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create transactions")
    
    transaction = Transaction(**txn_data.dict(), created_by=current_user.id)
    await db.transactions.insert_one(prepare_for_mongo(transaction.dict()))
    
    # Update account balance
    category = await db.categories.find_one({"id": txn_data.category_id})
    if category:
        amount_change = txn_data.amount if category["type"] == "income" else -txn_data.amount
        await db.accounts.update_one(
            {"id": txn_data.account_id},
            {"$inc": {"current_balance": amount_change}}
        )
    
    await log_audit(current_user.id, "CREATE", "transaction", transaction.id)
    return transaction

# Bills
@api_router.get("/bills", response_model=List[Bill])
async def get_bills(current_user: User = Depends(get_current_user)):
    bills = await db.bills.find().to_list(None)
    return [Bill(**parse_from_mongo(bill)) for bill in bills]

@api_router.post("/bills", response_model=Bill)
async def create_bill(bill_data: BillCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create bills")
    
    bill = Bill(**bill_data.dict())
    await db.bills.insert_one(prepare_for_mongo(bill.dict()))
    await log_audit(current_user.id, "CREATE", "bill", bill.id)
    return bill

@api_router.patch("/bills/{bill_id}", response_model=Bill)
async def update_bill(
    bill_id: str, 
    update_data: BillUpdate, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot update bills")
    
    bill = await db.bills.find_one({"id": bill_id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.bills.update_one(
        {"id": bill_id},
        {"$set": prepare_for_mongo(update_dict)}
    )
    
    await log_audit(current_user.id, "UPDATE", "bill", bill_id, update_dict)
    updated_bill = await db.bills.find_one({"id": bill_id})
    return Bill(**parse_from_mongo(updated_bill))

@api_router.delete("/bills/{bill_id}")
async def delete_bill(
    bill_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot delete bills")
    
    bill = await db.bills.find_one({"id": bill_id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Delete the bill
    await db.bills.delete_one({"id": bill_id})
    await log_audit(current_user.id, "DELETE", "bill", bill_id)
    
    return {"message": f"Bill '{bill['name']}' deleted successfully"}

# Budgets
@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if month:
        query["month"] = month
    if year:
        query["year"] = year
    
    budgets = await db.budgets.find(query).to_list(None)
    return [Budget(**parse_from_mongo(budget)) for budget in budgets]

@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget_data: BudgetCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create budgets")
    
    budget = Budget(**budget_data.dict())
    await db.budgets.insert_one(prepare_for_mongo(budget.dict()))
    await log_audit(current_user.id, "CREATE", "budget", budget.id)
    return budget

# Enhanced Dashboard with current salary calculation
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    current_month = month or datetime.now().month
    current_year = year or datetime.now().year
    
    # Calculate monthly stats
    start_date = f"{current_year}-{current_month:02d}-01"
    if current_month == 12:
        end_date = f"{current_year + 1}-01-01"
    else:
        end_date = f"{current_year}-{current_month + 1:02d}-01"
    
    # Get transactions for the month
    transactions = await db.transactions.find({
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(None)
    
    # Get categories for classification
    categories = await db.categories.find().to_list(None)
    category_map = {cat["id"]: cat for cat in categories}
    
    # Get current salaries (most recent salary transaction for each user)
    users = await db.users.find().to_list(None)
    current_salaries = {}
    
    for user in users:
        if user["role"] in ["owner", "coowner"]:
            # Find salary categories for this user
            user_salary_categories = []
            for cat in categories:
                if cat["type"] == "income":
                    # Check if category contains user's name
                    if user["name"].lower() in cat["name"].lower():
                        user_salary_categories.append(cat["id"])
                    # Check for role-based categories (like "Salary - Spouse" for coowner)
                    elif user["role"] == "coowner" and "spouse" in cat["name"].lower():
                        user_salary_categories.append(cat["id"])
            
            if user_salary_categories:
                # Get most recent salary transaction
                recent_salary = await db.transactions.find_one(
                    {
                        "created_by": user["id"],
                        "type": "income", 
                        "category_id": {"$in": user_salary_categories}
                    },
                    sort=[("date", -1)]
                )
                
                if recent_salary:
                    current_salaries[user["id"]] = {
                        "name": user["name"],
                        "amount": recent_salary["amount"],
                        "category_id": recent_salary["category_id"]
                    }
    
    # Calculate totals - for monthly income, use current salaries only
    # For total expenses, use current month transactions  
    monthly_recurring_income = sum(salary_data["amount"] for salary_data in current_salaries.values())
    total_expenses = 0.0
    category_breakdown = {}
    
    for txn in transactions:
        category = category_map.get(txn["category_id"])
        if category and category["type"] == "expense":
            total_expenses += txn["amount"]
            cat_name = category["name"]
            category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + txn["amount"]
    
    monthly_surplus = monthly_recurring_income - total_expenses
    savings_rate = (monthly_surplus / monthly_recurring_income * 100) if monthly_recurring_income > 0 else 0
    
    # Get upcoming bills
    upcoming_bills = await db.bills.find({"is_active": True}).to_list(None)
    
    # Get recent transactions
    recent_transactions = await db.transactions.find().sort("created_at", -1).limit(10).to_list(None)
    
    return {
        **DashboardStats(
            total_income=monthly_recurring_income,
            total_expenses=total_expenses,
            monthly_surplus=monthly_surplus,
            savings_rate=round(savings_rate, 2),
            upcoming_bills=[{"id": bill["id"], "name": bill["name"], "amount": bill["expected_amount"], "due_day": bill["due_day"]} for bill in upcoming_bills],
            category_breakdown=category_breakdown,
            recent_transactions=[{"id": txn["id"], "amount": txn["amount"], "description": txn.get("description", ""), "date": txn["date"]} for txn in recent_transactions]
        ).dict(),
        "current_salaries": current_salaries
    }

# Update Salary Endpoint (replaces existing salary)
@api_router.patch("/salary/update")
async def update_salary(
    new_salary: float,
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot update salary")
    
    # Find user's salary category - handle both name-based and role-based matching
    categories = await db.categories.find({"type": "income"}).to_list(None)
    user_salary_category = None
    
    for cat in categories:
        # Check if category contains user's name
        if current_user.name.lower() in cat["name"].lower():
            user_salary_category = cat
            break
        # Check for role-based categories (like "Salary - Spouse" for DurgaBhavani)
        elif current_user.role == "coowner" and "spouse" in cat["name"].lower():
            user_salary_category = cat
            break
    
    if not user_salary_category:
        raise HTTPException(status_code=404, detail="Salary category not found for user")
    
    # Get user's default account
    accounts = await db.accounts.find({"is_active": True}).to_list(None)
    if not accounts:
        raise HTTPException(status_code=404, detail="No active accounts found")
    
    default_account = accounts[0]  # Use first active account
    
    # Get all existing salary transactions for this user
    existing_salary_transactions = await db.transactions.find({
        "created_by": current_user.id,
        "type": "income",
        "category_id": user_salary_category["id"]
    }).to_list(None)
    
    # Calculate total existing salary amount to reverse
    total_existing_salary = sum(txn["amount"] for txn in existing_salary_transactions)
    
    # Delete all existing salary transactions for this user
    await db.transactions.delete_many({
        "created_by": current_user.id,
        "type": "income",
        "category_id": user_salary_category["id"]
    })
    
    # Reverse the balance changes from old salary transactions
    if total_existing_salary > 0:
        await db.accounts.update_one(
            {"id": default_account["id"]},
            {"$inc": {"current_balance": -total_existing_salary}}
        )
    
    # Create new salary transaction for current month
    current_date = datetime.now().date()
    first_of_month = current_date.replace(day=1)
    
    salary_transaction = Transaction(
        type=TransactionType.INCOME,
        account_id=default_account["id"],
        category_id=user_salary_category["id"],
        amount=new_salary,
        description=f"{current_date.strftime('%B %Y')} Salary - Updated",
        date=first_of_month,
        is_recurring=True,
        created_by=current_user.id
    )
    
    await db.transactions.insert_one(prepare_for_mongo(salary_transaction.dict()))
    
    # Update account balance with new salary
    await db.accounts.update_one(
        {"id": default_account["id"]},
        {"$inc": {"current_balance": new_salary}}
    )
    
    await log_audit(current_user.id, "UPDATE_SALARY", "transaction", salary_transaction.id, {
        "new_amount": new_salary,
        "old_amount_total": total_existing_salary,
        "replaced_transactions": len(existing_salary_transactions)
    })
    
    return {
        "message": f"Salary updated to €{new_salary}", 
        "transaction_id": salary_transaction.id,
        "old_salary_total": total_existing_salary,
        "new_salary": new_salary
    }

# Audit Logs (Owner only)
@api_router.get("/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owner can view audit logs")
    
    logs = await db.audit_logs.find().sort("timestamp", -1).skip(offset).limit(limit).to_list(None)
    return [AuditLog(**parse_from_mongo(log)) for log in logs]

# Calendar Management
@api_router.get("/calendars", response_model=List[Calendar])
async def get_calendars(current_user: User = Depends(get_current_user)):
    query = {
        "$or": [
            {"scope": "household"},
            {"owner_user_id": current_user.id}
        ]
    }
    calendars = await db.calendars.find(query).to_list(None)
    return [Calendar(**parse_from_mongo(cal)) for cal in calendars]

@api_router.post("/calendars", response_model=Calendar)
async def create_calendar(calendar_data: Calendar, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create calendars")
    
    # Set owner for personal calendars
    if calendar_data.scope == CalendarScope.PERSONAL:
        calendar_data.owner_user_id = current_user.id
    
    await db.calendars.insert_one(prepare_for_mongo(calendar_data.dict()))
    await log_audit(current_user.id, "CREATE", "calendar", calendar_data.id)
    return calendar_data

# User Preferences Management
@api_router.get("/user/preferences", response_model=UserPreferences)
async def get_user_preferences(current_user: User = Depends(get_current_user)):
    preferences = await db.user_preferences.find_one({"user_id": current_user.id})
    if not preferences:
        # Create default preferences
        default_prefs = UserPreferences(user_id=current_user.id)
        await db.user_preferences.insert_one(prepare_for_mongo(default_prefs.dict()))
        return default_prefs
    return UserPreferences(**parse_from_mongo(preferences))

@api_router.patch("/user/preferences")
async def update_user_preferences(
    preference_updates: dict, 
    current_user: User = Depends(get_current_user)
):
    # Get existing preferences or create default
    existing = await db.user_preferences.find_one({"user_id": current_user.id})
    if not existing:
        new_prefs = UserPreferences(user_id=current_user.id)
        await db.user_preferences.insert_one(prepare_for_mongo(new_prefs.dict()))
        existing = await db.user_preferences.find_one({"user_id": current_user.id})
    
    # Update with new values
    update_data = {k: v for k, v in preference_updates.items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.user_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": prepare_for_mongo(update_data)}
    )
    
    updated_prefs = await db.user_preferences.find_one({"user_id": current_user.id})
    return {"message": "Preferences updated successfully", "preferences": parse_from_mongo(updated_prefs)}

# Events Management
@api_router.get("/events", response_model=List[Event])
async def get_events(
    calendar_id: Optional[str] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    tags: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    
    # Filter by accessible calendars
    accessible_calendars = await db.calendars.find({
        "$or": [
            {"scope": "household"},
            {"owner_user_id": current_user.id}
        ]
    }).to_list(None)
    accessible_calendar_ids = [cal["id"] for cal in accessible_calendars]
    
    if calendar_id:
        if calendar_id not in accessible_calendar_ids:
            raise HTTPException(status_code=403, detail="Access denied to this calendar")
        query["calendar_id"] = calendar_id
    else:
        query["calendar_id"] = {"$in": accessible_calendar_ids}
    
    # Date range filter
    if start and end:
        query["start"] = {"$gte": start.isoformat(), "$lte": end.isoformat()}
    elif start:
        query["start"] = {"$gte": start.isoformat()}
    elif end:
        query["start"] = {"$lte": end.isoformat()}
    
    # Tags filter
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    events = await db.events.find(query).sort("start", 1).to_list(None)
    return [Event(**parse_from_mongo(event)) for event in events]

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create events")
    
    # Check calendar access
    calendar = await db.calendars.find_one({"id": event_data.calendar_id})
    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")
    
    # Check permissions
    if calendar["scope"] == "personal" and calendar["owner_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create events in other users' personal calendars")
    
    event = Event(**event_data.dict(), created_by=current_user.id)
    await db.events.insert_one(prepare_for_mongo(event.dict()))
    await log_audit(current_user.id, "CREATE", "event", event.id)
    return event

@api_router.patch("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, update_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot update events")
    
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check permissions
    calendar = await db.calendars.find_one({"id": event["calendar_id"]})
    if calendar["scope"] == "personal" and calendar["owner_user_id"] != current_user.id:
        if event["created_by"] != current_user.id:
            raise HTTPException(status_code=403, detail="Cannot update this event")
    
    # Update fields
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.events.update_one(
        {"id": event_id},
        {"$set": prepare_for_mongo(update_data)}
    )
    
    await log_audit(current_user.id, "UPDATE", "event", event_id, update_data)
    
    updated_event = await db.events.find_one({"id": event_id})
    return Event(**parse_from_mongo(updated_event))

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot delete events")
    
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check permissions
    calendar = await db.calendars.find_one({"id": event["calendar_id"]})
    if calendar["scope"] == "personal" and calendar["owner_user_id"] != current_user.id:
        if event["created_by"] != current_user.id:
            raise HTTPException(status_code=403, detail="Cannot delete this event")
    
    await db.events.delete_one({"id": event_id})
    await db.reminders.delete_many({"event_id": event_id})  # Delete associated reminders
    await log_audit(current_user.id, "DELETE", "event", event_id)
    
    return {"message": "Event deleted successfully"}

# Reminders Management  
@api_router.post("/events/{event_id}/reminders", response_model=Reminder)
async def create_reminder(event_id: str, reminder_data: ReminderCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create reminders")
    
    # Verify event exists and user has access
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    reminder = Reminder(**reminder_data.dict())
    
    # Calculate trigger time
    event_start = datetime.fromisoformat(event["start"])
    reminder.trigger_time = event_start - timedelta(minutes=reminder.offset_minutes)
    
    await db.reminders.insert_one(prepare_for_mongo(reminder.dict()))
    await log_audit(current_user.id, "CREATE", "reminder", reminder.id)
    return reminder

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders(current_user: User = Depends(get_current_user)):
    # Get user's accessible events first
    accessible_calendars = await db.calendars.find({
        "$or": [
            {"scope": "household"},
            {"owner_user_id": current_user.id}
        ]
    }).to_list(None)
    accessible_calendar_ids = [cal["id"] for cal in accessible_calendars]
    
    accessible_events = await db.events.find({
        "calendar_id": {"$in": accessible_calendar_ids}
    }).to_list(None)
    accessible_event_ids = [event["id"] for event in accessible_events]
    
    reminders = await db.reminders.find({
        "event_id": {"$in": accessible_event_ids}
    }).to_list(None)
    
    return [Reminder(**parse_from_mongo(reminder)) for reminder in reminders]

# Agenda and Dashboard Integration
@api_router.get("/agenda")
async def get_agenda(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get upcoming events and bills for agenda view"""
    paris_tz = get_paris_timezone()
    now = datetime.now(paris_tz)
    end_date = now + timedelta(days=days)
    
    # Get accessible calendars
    accessible_calendars = await db.calendars.find({
        "$or": [
            {"scope": "household"},
            {"owner_user_id": current_user.id}
        ]
    }).to_list(None)
    accessible_calendar_ids = [cal["id"] for cal in accessible_calendars]
    
    # Get upcoming events
    events = await db.events.find({
        "calendar_id": {"$in": accessible_calendar_ids},
        "start": {"$gte": now.isoformat(), "$lte": end_date.isoformat()}
    }).sort("start", 1).to_list(None)
    
    # Get upcoming bills (separate from events)
    bills = await db.bills.find({"is_active": True}).to_list(None)
    upcoming_bills = []
    
    for bill in bills:
        # Calculate next due date
        current_date = now.date()
        if bill["due_day"] <= current_date.day:
            # Next month
            if current_date.month == 12:
                next_due = current_date.replace(year=current_date.year + 1, month=1, day=bill["due_day"])
            else:
                # Handle invalid days (like 31st in a month with only 30 days)
                try:
                    next_due = current_date.replace(month=current_date.month + 1, day=bill["due_day"])
                except ValueError:
                    # If due day doesn't exist in next month, use last day of month
                    import calendar
                    next_month = current_date.month + 1 if current_date.month < 12 else 1
                    next_year = current_date.year if current_date.month < 12 else current_date.year + 1
                    last_day = calendar.monthrange(next_year, next_month)[1]
                    next_due = current_date.replace(month=next_month, year=next_year, day=min(bill["due_day"], last_day))
        else:
            # This month - handle invalid days
            try:
                next_due = current_date.replace(day=bill["due_day"])
            except ValueError:
                # If due day doesn't exist in current month, use last day of month
                import calendar
                last_day = calendar.monthrange(current_date.year, current_date.month)[1]
                next_due = current_date.replace(day=min(bill["due_day"], last_day))
        
        if next_due <= end_date.date():
            upcoming_bills.append({
                "id": bill["id"],
                "name": bill["name"],
                "amount": bill["expected_amount"],
                "due_date": next_due.isoformat(),
                "provider": bill.get("provider")
            })
    
    return {
        "events": [Event(**parse_from_mongo(event)) for event in events],
        "upcoming_bills": upcoming_bills,
        "range": {
            "start": now.isoformat(),
            "end": end_date.isoformat(),
            "days": days
        }
    }

# Health Check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize the database with default data"""
    try:
        # Check if users exist, if not create the three required users
        user_count = await db.users.count_documents({})
        if user_count == 0:
            # Create the three required users
            users_to_create = [
                {
                    "id": str(uuid.uuid4()),
                    "email": "harish@budget.app",
                    "name": "harish",
                    "role": "owner",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "email": "durgabhavani@budget.app",
                    "name": "DurgaBhavani", 
                    "role": "coowner",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "email": "guest@budget.app",
                    "name": "guest",
                    "role": "guest",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            await db.users.insert_many(users_to_create)
            logger.info("Created default users: harish@budget.app, durgabhavani@budget.app, guest@budget.app (password: budget123)")
        
        # Create default categories if they don't exist
        category_count = await db.categories.count_documents({})
        if category_count == 0:
            categories_to_create = [
                # Income categories
                {"id": str(uuid.uuid4()), "name": "Salary - Harish", "type": "income", "is_recurring": True, "icon": "💰", "color": "#10B981", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Salary - Spouse", "type": "income", "is_recurring": True, "icon": "💰", "color": "#10B981", "created_at": datetime.now(timezone.utc).isoformat()},
                # Expense categories
                {"id": str(uuid.uuid4()), "name": "Housing & Utilities", "type": "expense", "is_recurring": True, "icon": "🏠", "color": "#EF4444", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Groceries", "type": "expense", "is_recurring": True, "icon": "🛒", "color": "#F59E0B", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Transportation", "type": "expense", "is_recurring": True, "icon": "🚗", "color": "#8B5CF6", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Insurance", "type": "expense", "is_recurring": True, "icon": "🛡️", "color": "#06B6D4", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Loan EMI", "type": "expense", "is_recurring": True, "icon": "🏦", "color": "#DC2626", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Childcare", "type": "expense", "is_recurring": True, "icon": "👶", "color": "#EC4899", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Subscriptions", "type": "expense", "is_recurring": True, "icon": "📺", "color": "#6366F1", "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Initial Setup", "type": "expense", "is_recurring": False, "icon": "🔧", "color": "#9CA3AF", "created_at": datetime.now(timezone.utc).isoformat()}
            ]
            await db.categories.insert_many(categories_to_create)
            logger.info("Created default categories")
        
        # Create default accounts if they don't exist
        account_count = await db.accounts.count_documents({})
        if account_count == 0:
            accounts_to_create = [
                {"id": str(uuid.uuid4()), "name": "Joint Checking Account", "type": "bank", "currency": "EUR", "opening_balance": 5000.0, "current_balance": 5000.0, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Savings Account", "type": "bank", "currency": "EUR", "opening_balance": 15000.0, "current_balance": 15000.0, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()},
                {"id": str(uuid.uuid4()), "name": "Credit Card", "type": "card", "currency": "EUR", "opening_balance": 0.0, "current_balance": 0.0, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
            ]
            await db.accounts.insert_many(accounts_to_create)
            logger.info("Created default accounts")
        
        # Create default calendars with proper personal calendar setup
        calendar_count = await db.calendars.count_documents({})
        if calendar_count == 0:
            users = await db.users.find().to_list(None)
            harish = next((u for u in users if u["email"] == "harish@budget.app"), None)
            spouse = next((u for u in users if u["email"] == "durgabhavani@budget.app"), None)
            
            calendars_to_create = [
                # Household calendar (shared)
                {"id": str(uuid.uuid4()), "name": "Household Calendar", "scope": "household", "owner_user_id": None, "is_default": True, "color": "#DC2626", "created_at": datetime.now(timezone.utc).isoformat()},
            ]
            
            # Personal calendars with proper names
            if harish:
                calendars_to_create.append({"id": str(uuid.uuid4()), "name": "harish", "scope": "personal", "owner_user_id": harish["id"], "is_default": False, "color": "#10B981", "created_at": datetime.now(timezone.utc).isoformat()})
            if spouse:
                calendars_to_create.append({"id": str(uuid.uuid4()), "name": "DurgaBhavani", "scope": "personal", "owner_user_id": spouse["id"], "is_default": False, "color": "#3B82F6", "created_at": datetime.now(timezone.utc).isoformat()})
            
            await db.calendars.insert_many(calendars_to_create)
            logger.info(f"Created {len(calendars_to_create)} default calendars with personal ownership")
        
        # Create default user preferences
        prefs_count = await db.user_preferences.count_documents({})
        if prefs_count == 0:
            users = await db.users.find().to_list(None)
            prefs_to_create = []
            
            for user in users:
                prefs = UserPreferences(user_id=user["id"])
                prefs_to_create.append(prepare_for_mongo(prefs.dict()))
            
            if prefs_to_create:
                await db.user_preferences.insert_many(prefs_to_create)
                logger.info(f"Created user preferences for {len(prefs_to_create)} users")
        
        # Generate calendar events for bills
        await generate_bill_calendar_events()
            
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()