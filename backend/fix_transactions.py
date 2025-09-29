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
    """Fix existing transactions to have proper fields and remove duplicate salaries"""
    print("🔧 Fixing existing transactions...")
    
    # Get users
    harish = await db.users.find_one({"email": "harish@budget.app"})
    durgabhavani = await db.users.find_one({"email": "durgabhavani@budget.app"})
    
    if not harish or not durgabhavani:
        print("❌ Could not find required users")
        return
    
    print(f"👤 Harish ID: {harish['id']}")
    print(f"👤 DurgaBhavani ID: {durgabhavani['id']}")
    
    # Get categories
    categories = await db.categories.find().to_list(None)
    income_categories = [cat for cat in categories if cat["type"] == "income"]
    expense_categories = [cat for cat in categories if cat["type"] == "expense"]
    
    print(f"📂 Income categories: {[cat['name'] for cat in income_categories]}")
    
    # Find Harish's salary category
    harish_salary_category = None
    for cat in income_categories:
        if "harish" in cat["name"].lower():
            harish_salary_category = cat
            break
    
    # Find DurgaBhavani's salary category  
    durga_salary_category = None
    for cat in income_categories:
        if "durgabhavani" in cat["name"].lower() or "durga" in cat["name"].lower():
            durga_salary_category = cat
            break
    
    if not harish_salary_category:
        print("❌ Could not find Harish's salary category")
        return
        
    print(f"💼 Harish salary category: {harish_salary_category['name']}")
    if durga_salary_category:
        print(f"💼 DurgaBhavani salary category: {durga_salary_category['name']}")
    
    # Clean up all old salary transactions
    print("🧹 Removing all old salary transactions...")
    
    # Delete transactions with old IDs (txn_1, txn_2, etc.)
    old_salary_transactions = await db.transactions.find({
        "$or": [
            {"id": "txn_1"},
            {"id": "txn_2"}, 
            {"description": {"$regex": "September Salary", "$options": "i"}},
            {"description": {"$regex": "^[0-9]+ Salary", "$options": "i"}}
        ]
    }).to_list(None)
    
    print(f"🗑️ Found {len(old_salary_transactions)} old salary transactions to remove:")
    for txn in old_salary_transactions:
        print(f"   - {txn['id']}: €{txn['amount']} - {txn.get('description', 'No desc')}")
    
    # Delete old salary transactions
    await db.transactions.delete_many({
        "$or": [
            {"id": "txn_1"},
            {"id": "txn_2"},
            {"description": {"$regex": "September Salary", "$options": "i"}},
            {"description": {"$regex": "^[0-9]+ Salary", "$options": "i"}}
        ]
    })
    
    # Update remaining transactions to have proper type field
    await db.transactions.update_many(
        {"type": {"$exists": False}},
        {"$set": {"type": "expense"}}
    )
    
    # Update expense transactions based on category type
    expense_category_ids = [cat["id"] for cat in expense_categories]
    await db.transactions.update_many(
        {"category_id": {"$in": expense_category_ids}},
        {"$set": {"type": "expense"}}
    )
    
    print("✅ Cleaned up old salary transactions")
    
    # Show current transaction summary
    total_transactions = await db.transactions.count_documents({})
    income_transactions = await db.transactions.count_documents({"type": "income"})
    expense_transactions = await db.transactions.count_documents({"type": "expense"})
    
    print(f"📊 Transaction Summary:")
    print(f"   Total: {total_transactions}")
    print(f"   Income: {income_transactions}")
    print(f"   Expense: {expense_transactions}")
    
    # Show remaining income transactions
    all_income_txns = await db.transactions.find({"type": "income"}).to_list(None)
    print(f"💰 Remaining income transactions: {len(all_income_txns)}")
    for txn in all_income_txns:
        print(f"   €{txn['amount']} - {txn.get('description', 'No description')} - {txn.get('created_by', 'Unknown')} - {txn['date']}")

if __name__ == "__main__":
    asyncio.run(fix_transactions())