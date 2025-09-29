#!/usr/bin/env python3
"""
Backend API Testing for Family Budget App
Testing Phase 1 Implementation - Simple Budget App
Focus: Bills Update API, Quick Expense Entry, Dashboard Integration
"""

import requests
import json
from datetime import datetime, date
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://familybudget-9.preview.emergentagent.com/api"

class BudgetAppTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_info = None
        
    def login(self, email, password):
        """Login and get authentication token"""
        print(f"\n🔐 Testing login for {email}...")
        
        login_data = {
            "email": email,
            "password": password
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            print(f"Login response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_info = data["user"]
                
                # Set authorization header for future requests
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                
                print(f"✅ Login successful for {self.user_info['name']} ({self.user_info['role']})")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def get_dashboard_stats(self):
        """Get current dashboard statistics"""
        print(f"\n📊 Testing dashboard stats...")
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats")
            print(f"Dashboard stats response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Dashboard stats retrieved successfully")
                print(f"   Total Income: €{data.get('total_income', 0)}")
                print(f"   Total Expenses: €{data.get('total_expenses', 0)}")
                print(f"   Monthly Surplus: €{data.get('monthly_surplus', 0)}")
                print(f"   Current Salaries: {data.get('current_salaries', {})}")
                return data
            else:
                print(f"❌ Dashboard stats failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Dashboard stats error: {str(e)}")
            return None
    
    def update_salary(self, new_salary):
        """Update user salary"""
        print(f"\n💰 Testing salary update to €{new_salary}...")
        
        try:
            # Use query parameter as per the API definition
            response = self.session.patch(f"{self.base_url}/salary/update?new_salary={new_salary}")
            print(f"Salary update response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Salary update successful")
                print(f"   Message: {data.get('message', '')}")
                print(f"   Old Salary Total: €{data.get('old_salary_total', 0)}")
                print(f"   New Salary: €{data.get('new_salary', 0)}")
                print(f"   Transaction ID: {data.get('transaction_id', 'N/A')}")
                return data
            else:
                print(f"❌ Salary update failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Salary update error: {str(e)}")
            return None
    
    def get_transactions(self, limit=10):
        """Get recent transactions"""
        print(f"\n📝 Testing transactions retrieval...")
        
        try:
            response = self.session.get(f"{self.base_url}/transactions?limit={limit}")
            print(f"Transactions response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} transactions")
                
                # Show salary transactions specifically
                salary_transactions = [t for t in data if t.get('type') == 'income' and 'salary' in t.get('description', '').lower()]
                print(f"   Salary transactions found: {len(salary_transactions)}")
                
                for txn in salary_transactions:
                    print(f"   - {txn.get('description', 'N/A')}: €{txn.get('amount', 0)} on {txn.get('date', 'N/A')}")
                
                return data
            else:
                print(f"❌ Transactions retrieval failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Transactions error: {str(e)}")
            return None
    
    def get_bills(self):
        """Get all bills"""
        print(f"\n📋 Getting all bills...")
        
        try:
            response = self.session.get(f"{self.base_url}/bills")
            print(f"Bills response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} bills")
                
                for bill in data:
                    print(f"   - {bill.get('name', 'N/A')}: €{bill.get('expected_amount', 0)} due on {bill.get('due_day', 'N/A')} (ID: {bill.get('id', 'N/A')})")
                
                return data
            else:
                print(f"❌ Bills retrieval failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Bills error: {str(e)}")
            return None
    
    def update_bill(self, bill_id, new_amount, new_due_day=None):
        """Update a bill amount and optionally due day"""
        print(f"\n💡 Testing bill update for ID {bill_id} to €{new_amount}...")
        
        update_data = {
            "expected_amount": new_amount
        }
        
        if new_due_day is not None:
            update_data["due_day"] = new_due_day
            print(f"   Also updating due day to: {new_due_day}")
        
        try:
            response = self.session.patch(f"{self.base_url}/bills/{bill_id}", json=update_data)
            print(f"Bill update response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Bill update successful")
                print(f"   Bill: {data.get('name', 'N/A')}")
                print(f"   New Amount: €{data.get('expected_amount', 0)}")
                if new_due_day is not None:
                    print(f"   New Due Day: {data.get('due_day', 'N/A')}")
                return data
            else:
                print(f"❌ Bill update failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Bill update error: {str(e)}")
            return None
    
    def create_expense(self, description, amount, account_id, category_id, due_date=None):
        """Create a quick expense entry"""
        print(f"\n💸 Testing expense creation: {description} - €{amount}...")
        
        expense_data = {
            "type": "expense",
            "account_id": account_id,
            "category_id": category_id,
            "amount": amount,
            "description": description,
            "date": due_date or datetime.now().date().isoformat()
        }
        
        if due_date:
            print(f"   With due date: {due_date}")
        
        try:
            response = self.session.post(f"{self.base_url}/transactions", json=expense_data)
            print(f"Expense creation response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Expense created successfully")
                print(f"   Description: {data.get('description', 'N/A')}")
                print(f"   Amount: €{data.get('amount', 0)}")
                print(f"   Date: {data.get('date', 'N/A')}")
                print(f"   Transaction ID: {data.get('id', 'N/A')}")
                return data
            else:
                print(f"❌ Expense creation failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Expense creation error: {str(e)}")
            return None
    
    def get_accounts(self):
        """Get all accounts"""
        print(f"\n🏦 Getting all accounts...")
        
        try:
            response = self.session.get(f"{self.base_url}/accounts")
            print(f"Accounts response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} accounts")
                
                for account in data:
                    print(f"   - {account.get('name', 'N/A')}: €{account.get('current_balance', 0)} (ID: {account.get('id', 'N/A')})")
                
                return data
            else:
                print(f"❌ Accounts retrieval failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Accounts error: {str(e)}")
            return None
    
    def get_categories(self):
        """Get all categories"""
        print(f"\n📂 Getting all categories...")
        
        try:
            response = self.session.get(f"{self.base_url}/categories")
            print(f"Categories response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} categories")
                
                expense_categories = [cat for cat in data if cat.get('type') == 'expense']
                print(f"   Expense categories: {len(expense_categories)}")
                
                return data
            else:
                print(f"❌ Categories retrieval failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Categories error: {str(e)}")
            return None
    
    def create_bill(self, name, expected_amount, due_day, account_id, category_id, provider=None):
        """Create a new recurring bill"""
        print(f"\n📋 Testing bill creation: {name} - €{expected_amount} due on {due_day}...")
        
        bill_data = {
            "name": name,
            "expected_amount": expected_amount,
            "due_day": due_day,
            "account_id": account_id,
            "category_id": category_id,
            "recurrence": "monthly",
            "autopay": False,
            "is_active": True
        }
        
        if provider:
            bill_data["provider"] = provider
        
        try:
            response = self.session.post(f"{self.base_url}/bills", json=bill_data)
            print(f"Bill creation response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Bill created successfully")
                print(f"   Name: {data.get('name', 'N/A')}")
                print(f"   Amount: €{data.get('expected_amount', 0)}")
                print(f"   Due Day: {data.get('due_day', 'N/A')}")
                print(f"   Bill ID: {data.get('id', 'N/A')}")
                return data
            else:
                print(f"❌ Bill creation failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Bill creation error: {str(e)}")
            return None
    
    def test_bills_update_api(self):
        """Test Bills Update API with all 6 bills as specified"""
        print(f"\n🧪 TESTING BILLS UPDATE API")
        print("=" * 60)
        
        # Get all bills first
        bills = self.get_bills()
        if not bills:
            print("❌ Failed to get bills")
            return False
        
        # Expected bills from the review request
        expected_bills = {
            "Electricity Bill": 100,
            "Water Bill": 30,
            "Internet & WiFi": 35,
            "Mobile Phone": 45,
            "Home Insurance": 18,
            "Home Loan EMI": 1000
        }
        
        success = True
        updated_bills = []
        
        # Test updating each bill
        for bill in bills:
            bill_name = bill.get('name', '')
            bill_id = bill.get('id')
            
            # Find matching expected bill
            new_amount = None
            for expected_name, amount in expected_bills.items():
                if expected_name.lower() in bill_name.lower() or bill_name.lower() in expected_name.lower():
                    new_amount = amount
                    break
            
            if new_amount and bill_id:
                print(f"\n📝 Updating {bill_name} to €{new_amount}...")
                result = self.update_bill(bill_id, new_amount)
                if result:
                    updated_bills.append(result)
                    print(f"✅ Successfully updated {bill_name}")
                else:
                    print(f"❌ Failed to update {bill_name}")
                    success = False
            else:
                print(f"⚠️ Skipping {bill_name} - not in expected bills list")
        
        print(f"\n📊 Bills Update Summary:")
        print(f"   Total bills updated: {len(updated_bills)}")
        print(f"   Expected updates: {len(expected_bills)}")
        
        return success and len(updated_bills) > 0
    
    def test_quick_expense_entry(self):
        """Test Quick Expense Entry API"""
        print(f"\n🧪 TESTING QUICK EXPENSE ENTRY API")
        print("=" * 60)
        
        # Get accounts and categories first
        accounts = self.get_accounts()
        categories = self.get_categories()
        
        if not accounts or not categories:
            print("❌ Failed to get accounts or categories")
            return False
        
        # Use first active account
        account = accounts[0]
        account_id = account.get('id')
        
        # Find a suitable expense category (like Groceries)
        expense_categories = [cat for cat in categories if cat.get('type') == 'expense']
        if not expense_categories:
            print("❌ No expense categories found")
            return False
        
        category = expense_categories[0]  # Use first expense category
        category_id = category.get('id')
        
        # Test expenses
        test_expenses = [
            {"description": "Coffee and pastries", "amount": 15.50},
            {"description": "Grocery shopping", "amount": 85.30},
            {"description": "Gas station fill-up", "amount": 65.00}
        ]
        
        success = True
        created_expenses = []
        
        for expense in test_expenses:
            result = self.create_expense(
                expense["description"], 
                expense["amount"], 
                account_id, 
                category_id
            )
            if result:
                created_expenses.append(result)
            else:
                success = False
        
        print(f"\n📊 Expense Entry Summary:")
        print(f"   Total expenses created: {len(created_expenses)}")
        print(f"   Expected expenses: {len(test_expenses)}")
        
        return success and len(created_expenses) > 0
    
    def test_dashboard_integration(self):
        """Test Dashboard Integration - verify calculations are accurate"""
        print(f"\n🧪 TESTING DASHBOARD INTEGRATION")
        print("=" * 60)
        
        # Get dashboard stats
        stats = self.get_dashboard_stats()
        if not stats:
            print("❌ Failed to get dashboard stats")
            return False
        
        # Get transactions to verify calculations
        transactions = self.get_transactions(100)
        if not transactions:
            print("❌ Failed to get transactions")
            return False
        
        # Manual calculation
        manual_income = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'income')
        manual_expenses = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'expense')
        manual_surplus = manual_income - manual_expenses
        
        # Compare with dashboard
        dashboard_income = stats.get('total_income', 0)
        dashboard_expenses = stats.get('total_expenses', 0)
        dashboard_surplus = stats.get('monthly_surplus', 0)
        
        print(f"\n📊 Dashboard vs Manual Calculation:")
        print(f"   Income - Dashboard: €{dashboard_income}, Manual: €{manual_income}")
        print(f"   Expenses - Dashboard: €{dashboard_expenses}, Manual: €{manual_expenses}")
        print(f"   Surplus - Dashboard: €{dashboard_surplus}, Manual: €{manual_surplus}")
        
        # Tolerance for floating point comparison
        tolerance = 0.01
        
        success = True
        if abs(dashboard_income - manual_income) > tolerance:
            print(f"❌ Income mismatch: Dashboard €{dashboard_income} vs Manual €{manual_income}")
            success = False
        else:
            print("✅ Income calculation matches")
        
        if abs(dashboard_expenses - manual_expenses) > tolerance:
            print(f"❌ Expenses mismatch: Dashboard €{dashboard_expenses} vs Manual €{manual_expenses}")
            success = False
        else:
            print("✅ Expenses calculation matches")
        
        if abs(dashboard_surplus - manual_surplus) > tolerance:
            print(f"❌ Surplus mismatch: Dashboard €{dashboard_surplus} vs Manual €{manual_surplus}")
            success = False
        else:
            print("✅ Surplus calculation matches")
        
        return success
    
    def test_data_consistency(self):
        """Test Data Consistency - ensure no duplicates and proper categorization"""
        print(f"\n🧪 TESTING DATA CONSISTENCY")
        print("=" * 60)
        
        # Get all data
        transactions = self.get_transactions(200)
        bills = self.get_bills()
        accounts = self.get_accounts()
        
        if not transactions or not bills or not accounts:
            print("❌ Failed to get required data")
            return False
        
        success = True
        
        # Check for duplicate bill entries
        bill_names = [bill.get('name', '') for bill in bills]
        if len(bill_names) != len(set(bill_names)):
            print("❌ Duplicate bill names found")
            success = False
        else:
            print("✅ No duplicate bill names")
        
        # Check account balance consistency
        for account in accounts:
            account_id = account.get('id')
            account_name = account.get('name', 'Unknown')
            current_balance = account.get('current_balance', 0)
            
            # Calculate expected balance from transactions
            account_transactions = [t for t in transactions if t.get('account_id') == account_id]
            
            balance_from_txns = account.get('opening_balance', 0)
            for txn in account_transactions:
                if txn.get('type') == 'income':
                    balance_from_txns += txn.get('amount', 0)
                elif txn.get('type') == 'expense':
                    balance_from_txns -= txn.get('amount', 0)
            
            if abs(current_balance - balance_from_txns) > 0.01:
                print(f"❌ Balance inconsistency for {account_name}: Current €{current_balance}, Expected €{balance_from_txns}")
                success = False
            else:
                print(f"✅ Balance consistent for {account_name}: €{current_balance}")
        
        return success
    
    def run_phase1_tests(self):
        """Run all Phase 1 tests as specified in the review request"""
        print(f"\n🚀 RUNNING PHASE 1 BUDGET APP TESTS")
        print("=" * 70)
        
        test_results = {}
        
        # Test 1: Bills Update API
        print(f"\n1️⃣ BILLS UPDATE API TESTING")
        test_results['bills_update'] = self.test_bills_update_api()
        
        # Test 2: Quick Expense Entry API
        print(f"\n2️⃣ QUICK EXPENSE ENTRY API TESTING")
        test_results['expense_entry'] = self.test_quick_expense_entry()
        
        # Test 3: Dashboard Integration
        print(f"\n3️⃣ DASHBOARD INTEGRATION TESTING")
        test_results['dashboard_integration'] = self.test_dashboard_integration()
        
        # Test 4: Data Consistency
        print(f"\n4️⃣ DATA CONSISTENCY TESTING")
        test_results['data_consistency'] = self.test_data_consistency()
        
        # Final verification - get updated dashboard stats
        print(f"\n5️⃣ FINAL DASHBOARD VERIFICATION")
        final_stats = self.get_dashboard_stats()
        
        return test_results, final_stats

def main():
    """Main testing function"""
    print("🚀 FAMILY BUDGET APP - PHASE 1 TESTING")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print("Focus: Bills Update API, Quick Expense Entry, Dashboard Integration")
    
    tester = BudgetAppTester()
    
    # Test with Harish as requested
    if not tester.login("harish@budget.app", "budget123"):
        print("❌ CRITICAL: Cannot login as Harish. Testing aborted.")
        sys.exit(1)
    
    # Run the comprehensive Phase 1 tests
    test_results, final_stats = tester.run_phase1_tests()
    
    print(f"\n🏁 TESTING COMPLETE")
    print("=" * 50)
    
    # Summary of results
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print(f"\n📊 TEST RESULTS SUMMARY:")
    print(f"   Tests Passed: {passed_tests}/{total_tests}")
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
    
    if final_stats:
        print(f"\n📈 FINAL DASHBOARD STATE:")
        print(f"   Combined Household Income: €{final_stats.get('total_income', 0)}")
        print(f"   Monthly Expenses: €{final_stats.get('total_expenses', 0)}")
        print(f"   Surplus: €{final_stats.get('monthly_surplus', 0)}")
        print(f"   Savings Rate: {final_stats.get('savings_rate', 0)}%")
    
    if passed_tests == total_tests:
        print("\n✅ ALL PHASE 1 TESTS PASSED")
        print("   - Bills Update API working correctly")
        print("   - Quick Expense Entry functional")
        print("   - Dashboard calculations accurate")
        print("   - Data consistency maintained")
        sys.exit(0)
    else:
        print(f"\n❌ {total_tests - passed_tests} TEST(S) FAILED")
        print("   Issues found with Phase 1 implementation")
        sys.exit(1)

if __name__ == "__main__":
    main()