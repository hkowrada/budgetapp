#!/usr/bin/env python3
"""
Additional Backend API Testing for Family Budget App
Testing edge cases and data integrity for salary updates
"""

import requests
import json
from datetime import datetime, date
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://familybudget-9.preview.emergentagent.com/api"

class ExtendedBudgetAppTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_info = None
        
    def login(self, email, password):
        """Login and get authentication token"""
        login_data = {"email": email, "password": password}
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_info = data["user"]
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                return True
            return False
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def get_all_transactions_for_user(self):
        """Get all transactions for current user"""
        try:
            response = self.session.get(f"{self.base_url}/transactions?limit=100")
            if response.status_code == 200:
                data = response.json()
                user_transactions = [t for t in data if t.get('created_by') == self.user_info.get('id')]
                return user_transactions
            return []
        except Exception as e:
            print(f"❌ Error getting transactions: {str(e)}")
            return []
    
    def get_categories(self):
        """Get all categories"""
        try:
            response = self.session.get(f"{self.base_url}/categories")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"❌ Error getting categories: {str(e)}")
            return []
    
    def get_accounts(self):
        """Get all accounts"""
        try:
            response = self.session.get(f"{self.base_url}/accounts")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"❌ Error getting accounts: {str(e)}")
            return []
    
    def test_data_integrity(self):
        """Test data integrity after salary updates"""
        print(f"\n🔍 TESTING DATA INTEGRITY")
        print("=" * 50)
        
        # Get all user transactions
        transactions = self.get_all_transactions_for_user()
        categories = self.get_categories()
        accounts = self.get_accounts()
        
        print(f"📊 Data Overview:")
        print(f"   Total user transactions: {len(transactions)}")
        print(f"   Total categories: {len(categories)}")
        print(f"   Total accounts: {len(accounts)}")
        
        # Find salary category for this user
        salary_categories = [c for c in categories if c.get('type') == 'income' and 
                           self.user_info.get('name', '').lower() in c.get('name', '').lower()]
        
        print(f"   Salary categories for {self.user_info.get('name')}: {len(salary_categories)}")
        
        if not salary_categories:
            print("❌ FAIL: No salary category found for user")
            return False
        
        salary_category_id = salary_categories[0]['id']
        
        # Check salary transactions
        salary_transactions = [t for t in transactions if 
                             t.get('type') == 'income' and 
                             t.get('category_id') == salary_category_id]
        
        print(f"   Salary transactions: {len(salary_transactions)}")
        
        # Critical test: Should be exactly 1 salary transaction
        if len(salary_transactions) == 1:
            print("✅ PASS: Exactly ONE salary transaction exists")
            salary_txn = salary_transactions[0]
            print(f"   - Amount: €{salary_txn.get('amount')}")
            print(f"   - Date: {salary_txn.get('date')}")
            print(f"   - Description: {salary_txn.get('description')}")
        else:
            print(f"❌ FAIL: Expected 1 salary transaction, found {len(salary_transactions)}")
            for i, txn in enumerate(salary_transactions):
                print(f"   Transaction {i+1}: €{txn.get('amount')} - {txn.get('description')} - {txn.get('date')}")
            return False
        
        # Check for old duplicate transactions (txn_1, txn_2 mentioned in requirements)
        old_duplicate_txns = [t for t in transactions if 
                            t.get('description', '').lower() in ['txn_1', 'txn_2']]
        
        if len(old_duplicate_txns) == 0:
            print("✅ PASS: No old duplicate transactions (txn_1, txn_2) found")
        else:
            print(f"❌ FAIL: Found {len(old_duplicate_txns)} old duplicate transactions")
            return False
        
        return True
    
    def test_multiple_salary_updates(self):
        """Test multiple rapid salary updates"""
        print(f"\n⚡ TESTING MULTIPLE RAPID SALARY UPDATES")
        print("=" * 50)
        
        test_salaries = [5000, 5500, 6000, 4800, 5200]
        
        for i, salary in enumerate(test_salaries):
            print(f"\n{i+1}. Updating salary to €{salary}...")
            
            try:
                response = self.session.patch(f"{self.base_url}/salary/update?new_salary={salary}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Success: €{data.get('new_salary')} (was €{data.get('old_salary_total')})")
                else:
                    print(f"   ❌ Failed: {response.status_code}")
                    return False
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")
                return False
        
        # Verify final state
        print(f"\n🔍 Verifying final state after multiple updates...")
        
        # Check dashboard
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats")
            if response.status_code == 200:
                data = response.json()
                final_income = data.get('total_income', 0)
                current_salaries = data.get('current_salaries', {})
                
                if final_income == 5200:  # Last salary amount
                    print("✅ PASS: Dashboard shows correct final salary amount")
                else:
                    print(f"❌ FAIL: Expected €5200, got €{final_income}")
                    return False
                
                # Check current_salaries field
                user_id = self.user_info.get('id')
                if user_id in current_salaries and current_salaries[user_id].get('amount') == 5200:
                    print("✅ PASS: current_salaries field is correct")
                else:
                    print("❌ FAIL: current_salaries field is incorrect")
                    return False
                    
            else:
                print(f"❌ FAIL: Dashboard request failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error checking dashboard: {str(e)}")
            return False
        
        # Check transaction count
        transactions = self.get_all_transactions_for_user()
        categories = self.get_categories()
        
        salary_categories = [c for c in categories if c.get('type') == 'income' and 
                           self.user_info.get('name', '').lower() in c.get('name', '').lower()]
        
        if salary_categories:
            salary_category_id = salary_categories[0]['id']
            salary_transactions = [t for t in transactions if 
                                 t.get('type') == 'income' and 
                                 t.get('category_id') == salary_category_id]
            
            if len(salary_transactions) == 1:
                print("✅ PASS: Still only ONE salary transaction after multiple updates")
            else:
                print(f"❌ FAIL: Found {len(salary_transactions)} salary transactions after multiple updates")
                return False
        
        return True

def main():
    """Main testing function for extended tests"""
    print("🔬 EXTENDED SALARY UPDATE TESTING")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    
    tester = ExtendedBudgetAppTester()
    
    # Login as Harish
    if not tester.login("harish@budget.app", "budget123"):
        print("❌ CRITICAL: Cannot login as Harish. Testing aborted.")
        sys.exit(1)
    
    print(f"✅ Logged in as {tester.user_info.get('name')} ({tester.user_info.get('role')})")
    
    # Run extended tests
    tests_passed = 0
    total_tests = 2
    
    # Test 1: Data Integrity
    if tester.test_data_integrity():
        tests_passed += 1
        print("✅ Data Integrity Test: PASSED")
    else:
        print("❌ Data Integrity Test: FAILED")
    
    # Test 2: Multiple Rapid Updates
    if tester.test_multiple_salary_updates():
        tests_passed += 1
        print("✅ Multiple Updates Test: PASSED")
    else:
        print("❌ Multiple Updates Test: FAILED")
    
    print(f"\n🏁 EXTENDED TESTING COMPLETE")
    print("=" * 40)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("✅ ALL EXTENDED TESTS PASSED")
        sys.exit(0)
    else:
        print("❌ SOME EXTENDED TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()