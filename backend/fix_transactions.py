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
    
    # Get all users first
    all_users = await db.users.find().to_list(None)
    print("📋 All users in database:")
    for user in all_users:
        print(f"   - {user['name']} ({user['email']}) - Role: {user['role']}")
    
    # Get users - try different email formats
    harish = await db.users.find_one({"$or": [
        {"email": "harish@budget.app"}, 
        {"name": "Harish"},
        {"email": {"$regex": "harish", "$options": "i"}}
    ]})
    
    durgabhavani = await db.users.find_one({"$or": [
        {"email": "durgabhavani@budget.app"},
        {"name": "DurgaBhavani"},
        {"email": {"$regex": "durga", "$options": "i"}}
    ]})
    
    if not harish:
        print("❌ Could not find Harish user")
        return
        
    print(f"👤 Found Harish: {harish['name']} ({harish['email']}) - ID: {harish['id']}")
    if durgabhavani:
        print(f"👤 Found DurgaBhavani: {durgabhavani['name']} ({durgabhavani['email']}) - ID: {durgabhavani['id']}")
    
    # Get all transactions to see what we're working with
    all_transactions = await db.transactions.find().to_list(None)
    print(f"\n📊 Current transactions ({len(all_transactions)}):")
    for txn in all_transactions:
        print(f"   - {txn['id']}: €{txn['amount']} - {txn.get('description', 'No desc')} - Type: {txn.get('type', 'Unknown')} - Created by: {txn.get('created_by', 'Unknown')}")
    
    # Clean up all old salary transactions
    print("\n🧹 Removing problematic old salary transactions...")
    
    # Delete transactions with old IDs (txn_1, txn_2, etc.)
    old_salary_transactions = await db.transactions.find({
        "$or": [
            {"id": "txn_1"},
            {"id": "txn_2"}, 
            {"description": {"$regex": "September Salary", "$options": "i"}},
            {"created_by": {"$exists": False}},
            {"created_by": None}
        ]
    }).to_list(None)
    
    print(f"🗑️ Found {len(old_salary_transactions)} old salary transactions to remove:")
    for txn in old_salary_transactions:
        print(f"   - {txn['id']}: €{txn['amount']} - {txn.get('description', 'No desc')}")
    
    # Delete old salary transactions
    deleted_result = await db.transactions.delete_many({
        "$or": [
            {"id": "txn_1"},
            {"id": "txn_2"},
            {"description": {"$regex": "September Salary", "$options": "i"}},
            {"created_by": {"$exists": False}},
            {"created_by": None}
        ]
    })
    
    print(f"✅ Deleted {deleted_result.deleted_count} old salary transactions")
    
    # Update remaining transactions to have proper type field
    await db.transactions.update_many(
        {"type": {"$exists": False}},
        {"$set": {"type": "expense"}}
    )
    
    # Update expense transactions based on category type
    categories = await db.categories.find().to_list(None)
    expense_category_ids = [cat["id"] for cat in categories if cat["type"] == "expense"]
    await db.transactions.update_many(
        {"category_id": {"$in": expense_category_ids}},
        {"$set": {"type": "expense"}}
    )
    
    print("✅ Updated transaction types")
    
    # Show final transaction summary
    remaining_transactions = await db.transactions.find().to_list(None)
    print(f"\n📊 Final Transaction Summary ({len(remaining_transactions)}):")
    for txn in remaining_transactions:
        txn_type = txn.get('type', 'Unknown')
        created_by = txn.get('created_by', 'Unknown')
        print(f"   - {txn['id']}: €{txn['amount']} - {txn.get('description', 'No desc')} - Type: {txn_type} - Created by: {created_by}")
    
    print("\n🎉 Transaction cleanup completed!")

if __name__ == "__main__":
    asyncio.run(fix_transactions())