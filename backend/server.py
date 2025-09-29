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
    account_id: str
    category_id: str
    amount: float
    description: Optional[str] = None
    merchant: Optional[str] = None
    date: date
    is_recurring: bool = False
    is_initial: bool = False  # For one-time setup costs
    notes: Optional[str] = None

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str
    category_id: str
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
    quiet_hours_start: time = time(22, 0)  # 10 PM
    quiet_hours_end: time = time(8, 0)   # 8 AM
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

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories(current_user: User = Depends(get_current_user)):
    categories = await db.categories.find().to_list(None)
    return [Category(**parse_from_mongo(cat)) for cat in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: Category, current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create categories")
    
    await db.categories.insert_one(prepare_for_mongo(category_data.dict()))
    await log_audit(current_user.id, "CREATE", "category", category_data.id)
    return category_data

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

# Dashboard
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
    
    total_income = 0.0
    total_expenses = 0.0
    category_breakdown = {}
    
    for txn in transactions:
        category = category_map.get(txn["category_id"])
        if category:
            if category["type"] == "income":
                total_income += txn["amount"]
            else:
                total_expenses += txn["amount"]
                cat_name = category["name"]
                category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + txn["amount"]
    
    monthly_surplus = total_income - total_expenses
    savings_rate = (monthly_surplus / total_income * 100) if total_income > 0 else 0
    
    # Get upcoming bills
    upcoming_bills = await db.bills.find({"is_active": True}).to_list(None)
    
    # Get recent transactions
    recent_transactions = await db.transactions.find().sort("created_at", -1).limit(10).to_list(None)
    
    return DashboardStats(
        total_income=total_income,
        total_expenses=total_expenses,
        monthly_surplus=monthly_surplus,
        savings_rate=round(savings_rate, 2),
        upcoming_bills=[{"id": bill["id"], "name": bill["name"], "amount": bill["expected_amount"], "due_day": bill["due_day"]} for bill in upcoming_bills],
        category_breakdown=category_breakdown,
        recent_transactions=[{"id": txn["id"], "amount": txn["amount"], "description": txn.get("description", ""), "date": txn["date"]} for txn in recent_transactions]
    )

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
                    "name": "Harish",
                    "role": "owner",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "email": "spouse@budget.app",
                    "name": "Spouse",
                    "role": "coowner",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "email": "guest@budget.app",
                    "name": "Guest",
                    "role": "guest",
                    "password_hash": bcrypt.hash("budget123"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            await db.users.insert_many(users_to_create)
            logger.info("Created default users: harish@budget.app, spouse@budget.app, guest@budget.app (password: budget123)")
        
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
            
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()