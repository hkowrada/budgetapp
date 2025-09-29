import asyncio
import os
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_demo_data():
    """Seed the database with realistic demo data for Paris household"""
    
    print("🌱 Seeding demo data for Paris household...")
    
    # Get categories and accounts
    categories = await db.categories.find().to_list(None)
    accounts = await db.accounts.find().to_list(None)
    
    if not categories or not accounts:
        print("❌ No categories or accounts found. Run the server first to initialize default data.")
        return
    
    # Create category and account mappings
    cat_map = {cat['name']: cat['id'] for cat in categories}
    acc_map = {acc['name']: acc['id'] for acc in accounts}
    
    # Sample bills for Paris household
    bills_data = [
        {
            "id": "bill_1",
            "name": "Electricity Bill",
            "provider": "EDF",
            "category_id": cat_map.get("Housing & Utilities"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 15,
            "expected_amount": 90.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "bill_2",
            "name": "Water Bill",
            "provider": "Eau de Paris",
            "category_id": cat_map.get("Housing & Utilities"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 5,
            "expected_amount": 30.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "bill_3",
            "name": "Internet & WiFi",
            "provider": "Orange",
            "category_id": cat_map.get("Housing & Utilities"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 1,
            "expected_amount": 35.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "bill_4",
            "name": "Mobile Phone",
            "provider": "SFR",
            "category_id": cat_map.get("Housing & Utilities"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 10,
            "expected_amount": 45.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "bill_5",
            "name": "Home Insurance",
            "provider": "AXA",
            "category_id": cat_map.get("Insurance"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 20,
            "expected_amount": 18.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "bill_6",
            "name": "Home Loan EMI",
            "provider": "BNP Paribas",
            "category_id": cat_map.get("Loan EMI"),
            "account_id": acc_map.get("Joint Checking Account"),
            "recurrence": "monthly",
            "due_day": 1,
            "expected_amount": 1000.0,
            "autopay": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Sample transactions for current month
    current_date = datetime.now().date()
    current_month_start = current_date.replace(day=1)
    
    transactions_data = [
        # Income transactions
        {
            "id": "txn_1",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Salary - Harish"),
            "amount": 3210.0,
            "description": "September Salary",
            "merchant": "Tech Company",
            "date": current_month_start.isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly salary deposit",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "txn_2",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Salary - Spouse"),
            "amount": 2200.0,
            "description": "September Salary",
            "merchant": "Design Agency",
            "date": current_month_start.isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly salary deposit",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Expense transactions
        {
            "id": "txn_3",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Housing & Utilities"),
            "amount": 90.0,
            "description": "Electricity Bill - EDF",
            "merchant": "EDF",
            "date": (current_date.replace(day=15) if current_date.day >= 15 else current_date).isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly electricity bill",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "txn_4",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Groceries"),
            "amount": 85.50,
            "description": "Weekly Groceries",
            "merchant": "Carrefour",
            "date": (current_date - datetime.timedelta(days=2)).isoformat(),
            "is_recurring": False,
            "is_initial": False,
            "notes": "Weekly grocery shopping",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "txn_5",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Transportation"),
            "amount": 75.20,
            "description": "Monthly Metro Pass",
            "merchant": "RATP",
            "date": current_month_start.isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly public transport pass",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "txn_6",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Loan EMI"),
            "amount": 1000.0,
            "description": "Home Loan EMI",
            "merchant": "BNP Paribas",
            "date": current_month_start.isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly home loan payment",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "txn_7",
            "account_id": acc_map.get("Joint Checking Account"),
            "category_id": cat_map.get("Childcare"),
            "amount": 180.0,
            "description": "Monthly Daycare",
            "merchant": "Little Stars Daycare",
            "date": current_month_start.isoformat(),
            "is_recurring": True,
            "is_initial": False,
            "notes": "Monthly childcare payment",
            "created_by": "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert bills
    existing_bills = await db.bills.count_documents({})
    if existing_bills == 0:
        await db.bills.insert_many(bills_data)
        print(f"✅ Inserted {len(bills_data)} demo bills")
    else:
        print(f"📋 Bills already exist ({existing_bills} bills)")
    
    # Insert transactions
    existing_transactions = await db.transactions.count_documents({})
    if existing_transactions == 0:
        await db.transactions.insert_many(transactions_data)
        print(f"✅ Inserted {len(transactions_data)} demo transactions")
    else:
        print(f"💳 Transactions already exist ({existing_transactions} transactions)")
    
    print("🎉 Demo data seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())