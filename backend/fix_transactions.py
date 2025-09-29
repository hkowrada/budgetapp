import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def fix_transactions():
    """Fix existing transactions to have the required 'type' field"""
    print("🔧 Fixing existing transactions...")
    
    # Add 'type' field to transactions that don't have it
    await db.transactions.update_many(
        {"type": {"$exists": False}},
        {"$set": {"type": "income"}}  # Default to income for old salary transactions
    )
    
    # Update expense transactions based on category type
    categories = await db.categories.find().to_list(None)
    expense_category_ids = [cat["id"] for cat in categories if cat["type"] == "expense"]
    
    await db.transactions.update_many(
        {"category_id": {"$in": expense_category_ids}},
        {"$set": {"type": "expense"}}
    )
    
    print("✅ Fixed transaction types")
    
    # Show current transaction summary
    total_transactions = await db.transactions.count_documents({})
    income_transactions = await db.transactions.count_documents({"type": "income"})
    expense_transactions = await db.transactions.count_documents({"type": "expense"})
    
    print(f"📊 Transaction Summary:")
    print(f"   Total: {total_transactions}")
    print(f"   Income: {income_transactions}")
    print(f"   Expense: {expense_transactions}")
    
    # Show harish's salary transactions
    harish_user = await db.users.find_one({"email": "harish@budget.app"})
    if harish_user:
        harish_salary_txns = await db.transactions.find({
            "created_by": harish_user["id"],
            "type": "income"
        }).to_list(None)
        
        print(f"💰 Harish's salary transactions: {len(harish_salary_txns)}")
        for txn in harish_salary_txns:
            print(f"   €{txn['amount']} - {txn.get('description', 'No description')} - {txn['date']}")

if __name__ == "__main__":
    asyncio.run(fix_transactions())