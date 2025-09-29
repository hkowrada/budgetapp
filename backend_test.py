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
    
    def test_salary_update_sequence(self):
        """Test the complete salary update sequence as requested"""
        print(f"\n🧪 TESTING SALARY UPDATE SEQUENCE")
        print("=" * 60)
        
        # Step 1: Get initial dashboard stats
        print("\n1️⃣ Getting initial dashboard stats...")
        initial_stats = self.get_dashboard_stats()
        if not initial_stats:
            print("❌ Failed to get initial dashboard stats")
            return False
        
        initial_income = initial_stats.get('total_income', 0)
        initial_salaries = initial_stats.get('current_salaries', {})
        print(f"   Initial total income: €{initial_income}")
        print(f"   Initial current salaries: {initial_salaries}")
        
        # Step 2: Update salary to €3000
        print("\n2️⃣ Updating salary to €3000...")
        update_result_1 = self.update_salary(3000)
        if not update_result_1:
            print("❌ Failed to update salary to €3000")
            return False
        
        # Step 3: Verify dashboard after first update
        print("\n3️⃣ Verifying dashboard after €3000 update...")
        stats_after_3000 = self.get_dashboard_stats()
        if not stats_after_3000:
            print("❌ Failed to get dashboard stats after €3000 update")
            return False
        
        income_after_3000 = stats_after_3000.get('total_income', 0)
        salaries_after_3000 = stats_after_3000.get('current_salaries', {})
        
        # Step 4: Update salary to €4500
        print("\n4️⃣ Updating salary to €4500...")
        update_result_2 = self.update_salary(4500)
        if not update_result_2:
            print("❌ Failed to update salary to €4500")
            return False
        
        # Step 5: Verify final dashboard state
        print("\n5️⃣ Verifying final dashboard state...")
        final_stats = self.get_dashboard_stats()
        if not final_stats:
            print("❌ Failed to get final dashboard stats")
            return False
        
        final_income = final_stats.get('total_income', 0)
        final_salaries = final_stats.get('current_salaries', {})
        
        # Step 6: Check transactions to ensure no duplicates
        print("\n6️⃣ Checking transaction integrity...")
        transactions = self.get_transactions(50)  # Get more transactions to check for duplicates
        
        # Analysis and validation
        print(f"\n📋 ANALYSIS RESULTS")
        print("=" * 40)
        
        success = True
        
        # Check if salary updates are replacing, not adding
        print(f"Initial income: €{initial_income}")
        print(f"Income after €3000 update: €{income_after_3000}")
        print(f"Final income after €4500 update: €{final_income}")
        
        # The key test: final income should be €4500, not cumulative
        if final_income == 4500:
            print("✅ PASS: Salary updates are REPLACING, not adding")
        else:
            print(f"❌ FAIL: Expected final income €4500, got €{final_income}")
            success = False
        
        # Check current_salaries field
        user_id = self.user_info.get('id') if self.user_info else None
        if user_id and user_id in final_salaries:
            user_salary = final_salaries[user_id]
            if user_salary.get('amount') == 4500:
                print("✅ PASS: current_salaries field shows correct amount")
            else:
                print(f"❌ FAIL: current_salaries shows €{user_salary.get('amount')}, expected €4500")
                success = False
        else:
            print("❌ FAIL: User not found in current_salaries or field missing")
            success = False
        
        # Check for duplicate transactions
        if transactions:
            salary_txns = [t for t in transactions if t.get('type') == 'income' and 
                          t.get('created_by') == user_id and 
                          'salary' in t.get('description', '').lower()]
            
            if len(salary_txns) == 1:
                print("✅ PASS: Only ONE salary transaction exists (no duplicates)")
            else:
                print(f"❌ FAIL: Found {len(salary_txns)} salary transactions, expected 1")
                success = False
        
        return success

def main():
    """Main testing function"""
    print("🚀 FAMILY BUDGET APP - SALARY UPDATE TESTING")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    
    tester = BudgetAppTester()
    
    # Test with Harish as requested
    if not tester.login("harish@budget.app", "budget123"):
        print("❌ CRITICAL: Cannot login as Harish. Testing aborted.")
        sys.exit(1)
    
    # Run the comprehensive salary update test
    success = tester.test_salary_update_sequence()
    
    print(f"\n🏁 TESTING COMPLETE")
    print("=" * 30)
    
    if success:
        print("✅ ALL TESTS PASSED: Salary update functionality is working correctly")
        print("   - Salary updates REPLACE instead of ADD")
        print("   - Dashboard shows correct current salary")
        print("   - No duplicate salary transactions")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED: Issues found with salary update functionality")
        sys.exit(1)

if __name__ == "__main__":
    main()