import requests
import sys
import json
import time
from datetime import datetime

class SyncMessagingAPITester:
    def __init__(self, base_url="https://msg-platform-41.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
                if success:
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                if success:
                    print(f"   Response: {response.text[:200]}...")

            if success:
                self.log_test(name, True)
            else:
                error_detail = response_data.get('detail', response.text) if response_data else response.text
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_detail}")

            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_register(self, email, password, name):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": email, "password": password, "name": name}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Registered user ID: {self.user_id}")
            return True
        return False

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Logged in user ID: {self.user_id}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_search_users(self, query="test"):
        """Test user search"""
        success, response = self.run_test(
            "Search Users",
            "GET",
            f"users/search?q={query}",
            200
        )
        return success, response if success else []

    def test_create_conversation(self, participant_ids, is_group=False, name=None):
        """Test creating a conversation"""
        data = {
            "participant_ids": participant_ids,
            "is_group": is_group
        }
        if name:
            data["name"] = name
            
        success, response = self.run_test(
            f"Create {'Group' if is_group else '1-to-1'} Conversation",
            "POST",
            "conversations",
            200,
            data=data
        )
        return success, response.get('id') if success else None

    def test_get_conversations(self):
        """Test getting conversations list"""
        success, response = self.run_test(
            "Get Conversations",
            "GET",
            "conversations",
            200
        )
        return success, response if success else []

    def test_send_message(self, conversation_id, content, message_type="text"):
        """Test sending a message"""
        success, response = self.run_test(
            "Send Message",
            "POST",
            "messages",
            200,
            data={
                "conversation_id": conversation_id,
                "content": content,
                "message_type": message_type
            }
        )
        return success, response.get('id') if success else None

    def test_get_messages(self, conversation_id):
        """Test getting messages for a conversation"""
        success, response = self.run_test(
            "Get Messages",
            "GET",
            f"messages/{conversation_id}",
            200
        )
        return success, response if success else []

    def test_mark_messages_read(self, conversation_id):
        """Test marking messages as read"""
        success, response = self.run_test(
            "Mark Messages Read",
            "POST",
            f"messages/{conversation_id}/read",
            200
        )
        return success

    def test_file_upload(self):
        """Test file upload functionality"""
        # Create a simple test PDF file (minimal PDF structure)
        test_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
181
%%EOF"""
        files = {'file': ('test.pdf', test_content, 'application/pdf')}
        
        success, response = self.run_test(
            "File Upload",
            "POST",
            "files/upload",
            200,
            files=files
        )
        return success, response.get('file_url') if success else None

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Sync Messaging API Tests")
        print("=" * 50)
        
        # Test 1: Root endpoint
        self.test_root_endpoint()
        
        # Test 2: User registration
        timestamp = int(time.time())
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        
        if not self.test_register(test_email, test_password, test_name):
            print("❌ Registration failed, stopping tests")
            return False
        
        # Test 3: Get current user
        self.test_get_me()
        
        # Test 4: User search
        search_success, search_results = self.test_search_users("test")
        
        # Test 5: Create second user for conversation testing
        second_email = f"test_user2_{timestamp}@example.com"
        second_token = self.token
        second_user_id = self.user_id
        
        # Register second user
        second_success, second_response = self.run_test(
            "Register Second User",
            "POST",
            "auth/register",
            200,
            data={"email": second_email, "password": test_password, "name": f"Second User {timestamp}"}
        )
        
        if second_success:
            second_user_id = second_response['user']['id']
            # Switch back to first user
            self.token = second_token
        
        # Test 6: Create 1-to-1 conversation
        conv_success, conversation_id = self.test_create_conversation([second_user_id])
        
        if not conversation_id:
            print("❌ Failed to create conversation, skipping message tests")
        else:
            # Test 7: Send message
            msg_success, message_id = self.test_send_message(conversation_id, "Hello, this is a test message!")
            
            # Test 8: Get messages
            self.test_get_messages(conversation_id)
            
            # Test 9: Mark messages as read
            self.test_mark_messages_read(conversation_id)
            
            # Test 10: Send another message
            self.test_send_message(conversation_id, "This is a second test message.")
        
        # Test 11: Get conversations list
        self.test_get_conversations()
        
        # Test 12: Create group conversation
        group_success, group_id = self.test_create_conversation([second_user_id], is_group=True, name="Test Group")
        
        if group_id:
            # Test 13: Send message to group
            self.test_send_message(group_id, "Hello group!")
        
        # Test 14: File upload
        file_success, file_url = self.test_file_upload()
        
        if file_url and conversation_id:
            # Test 15: Send file message
            self.test_send_message(conversation_id, "test.txt", "file")
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = SyncMessagingAPITester()
    success = tester.run_comprehensive_test()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())