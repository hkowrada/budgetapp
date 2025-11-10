<?php
// Secure Authentication System for Family Expense Tracker
// This file handles user authentication, sessions, and security

session_start();

// Security configurations
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.cookie_samesite', 'Strict');

// Session timeout (30 minutes)
define('SESSION_TIMEOUT', 1800);

// Rate limiting configuration
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

$dataFile = __DIR__ . '/data.json';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to send JSON response
function sendResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit();
}

// Function to load data
function loadData() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        return null;
    }
    $content = @file_get_contents($dataFile);
    if ($content === false) {
        return null;
    }
    return json_decode($content, true);
}

// Function to save data
function saveData($data) {
    global $dataFile;
    $result = @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    return $result !== false;
}

// Function to initialize users if not exist
function initializeUsers() {
    $data = loadData();
    if ($data === null) {
        $data = [
            'categories' => ['Rent', 'Electricity', 'Groceries', 'Transport', 'Entertainment'],
            'expenses' => [],
            'salaries' => [],
            'recurring' => []
        ];
    }
    
    // Initialize users with hashed passwords if not exist
    if (!isset($data['users'])) {
        $data['users'] = [
            'harish' => [
                'username' => 'harish',
                'name' => 'Harish',
                'password' => password_hash('1234', PASSWORD_BCRYPT),
                'role' => 'admin',
                'permissions' => ['add', 'edit', 'delete', 'manage_categories', 'manage_salary', 'manage_recurring']
            ],
            'bhavani' => [
                'username' => 'bhavani',
                'name' => 'Bhavani',
                'password' => password_hash('5678', PASSWORD_BCRYPT),
                'role' => 'contributor',
                'permissions' => ['add']
            ],
            'guest' => [
                'username' => 'guest',
                'name' => 'Guest',
                'password' => password_hash('0000', PASSWORD_BCRYPT),
                'role' => 'viewer',
                'permissions' => []
            ]
        ];
        saveData($data);
    }
    
    return $data;
}

// Function to get login attempts
function getLoginAttempts($username) {
    $attemptsFile = __DIR__ . '/login_attempts.json';
    if (!file_exists($attemptsFile)) {
        return ['count' => 0, 'timestamp' => time()];
    }
    
    $attempts = json_decode(file_get_contents($attemptsFile), true);
    if (!isset($attempts[$username])) {
        return ['count' => 0, 'timestamp' => time()];
    }
    
    return $attempts[$username];
}

// Function to record login attempt
function recordLoginAttempt($username, $success) {
    $attemptsFile = __DIR__ . '/login_attempts.json';
    $attempts = [];
    
    if (file_exists($attemptsFile)) {
        $attempts = json_decode(file_get_contents($attemptsFile), true);
    }
    
    if (!isset($attempts[$username])) {
        $attempts[$username] = ['count' => 0, 'timestamp' => time()];
    }
    
    if ($success) {
        // Reset attempts on successful login
        $attempts[$username] = ['count' => 0, 'timestamp' => time()];
    } else {
        // Increment failed attempts
        $currentAttempt = $attempts[$username];
        $timeSinceFirst = time() - $currentAttempt['timestamp'];
        
        if ($timeSinceFirst > LOCKOUT_TIME) {
            // Reset if lockout time has passed
            $attempts[$username] = ['count' => 1, 'timestamp' => time()];
        } else {
            $attempts[$username]['count']++;
        }
    }
    
    file_put_contents($attemptsFile, json_encode($attempts, JSON_PRETTY_PRINT));
}

// Function to check if user is locked out
function isLockedOut($username) {
    $attempt = getLoginAttempts($username);
    
    if ($attempt['count'] >= MAX_LOGIN_ATTEMPTS) {
        $timeSinceLock = time() - $attempt['timestamp'];
        if ($timeSinceLock < LOCKOUT_TIME) {
            $remainingTime = LOCKOUT_TIME - $timeSinceLock;
            $remainingMinutes = ceil($remainingTime / 60);
            return ['locked' => true, 'minutes' => $remainingMinutes];
        }
    }
    
    return ['locked' => false];
}

// Function to check session validity
function checkSession() {
    if (!isset($_SESSION['user'])) {
        return false;
    }
    
    // Check session timeout
    if (isset($_SESSION['last_activity'])) {
        $elapsed = time() - $_SESSION['last_activity'];
        if ($elapsed > SESSION_TIMEOUT) {
            session_unset();
            session_destroy();
            return false;
        }
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    return true;
}

// Handle different endpoints
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendResponse(false, 'Invalid request method', null, 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['username']) || !isset($input['pin'])) {
            sendResponse(false, 'Username and PIN are required', null, 400);
        }
        
        $username = trim($input['username']);
        $pin = trim($input['pin']);
        
        // Check if locked out
        $lockoutStatus = isLockedOut($username);
        if ($lockoutStatus['locked']) {
            sendResponse(false, "Too many failed attempts. Please try again in {$lockoutStatus['minutes']} minutes.", null, 429);
        }
        
        // Initialize users
        $data = initializeUsers();
        
        // Check if user exists
        if (!isset($data['users'][$username])) {
            recordLoginAttempt($username, false);
            sendResponse(false, 'Invalid username or PIN', null, 401);
        }
        
        $user = $data['users'][$username];
        
        // Verify password
        if (!password_verify($pin, $user['password'])) {
            recordLoginAttempt($username, false);
            $remainingAttempts = MAX_LOGIN_ATTEMPTS - (getLoginAttempts($username)['count'] + 1);
            if ($remainingAttempts > 0) {
                sendResponse(false, "Invalid PIN. {$remainingAttempts} attempts remaining.", null, 401);
            } else {
                sendResponse(false, 'Too many failed attempts. Account locked for 15 minutes.', null, 429);
            }
        }
        
        // Successful login
        recordLoginAttempt($username, true);
        
        // Set session data
        $_SESSION['user'] = [
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
            'permissions' => $user['permissions']
        ];
        $_SESSION['last_activity'] = time();
        $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
        
        sendResponse(true, 'Login successful', [
            'user' => [
                'username' => $user['username'],
                'name' => $user['name'],
                'role' => $user['role'],
                'permissions' => $user['permissions']
            ],
            'sessionId' => session_id()
        ]);
        break;
        
    case 'check':
        if (!checkSession()) {
            sendResponse(false, 'Not authenticated', null, 401);
        }
        
        sendResponse(true, 'Session valid', [
            'user' => $_SESSION['user']
        ]);
        break;
        
    case 'logout':
        session_unset();
        session_destroy();
        sendResponse(true, 'Logged out successfully');
        break;
        
    default:
        sendResponse(false, 'Invalid action', null, 400);
}
?>