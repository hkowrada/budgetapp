<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// User database with hashed passwords
// To generate a new hash: password_hash('your_pin', PASSWORD_BCRYPT)
$users = [
    'harish' => [
        'name' => 'Harish',
        'password' => password_hash('1234', PASSWORD_BCRYPT), // Change this PIN!
        'role' => 'admin',
        'permissions' => ['add', 'edit', 'delete', 'manage_categories', 'manage_salary', 'manage_recurring']
    ],
    'bhavani' => [
        'name' => 'Bhavani',
        'password' => password_hash('5678', PASSWORD_BCRYPT), // Change this PIN!
        'role' => 'contributor',
        'permissions' => ['add']
    ],
    'guest' => [
        'name' => 'Guest',
        'password' => password_hash('0000', PASSWORD_BCRYPT), // Change this PIN!
        'role' => 'viewer',
        'permissions' => []
    ]
];

// Rate limiting - prevent brute force attacks
$max_attempts = 5;
$lockout_time = 300; // 5 minutes

if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['last_attempt'] = time();
}

// Reset attempts after lockout time
if (time() - $_SESSION['last_attempt'] > $lockout_time) {
    $_SESSION['login_attempts'] = 0;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // LOGIN
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['pin'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and PIN required']);
        exit();
    }
    
    // Check rate limiting
    if ($_SESSION['login_attempts'] >= $max_attempts) {
        $remaining = $lockout_time - (time() - $_SESSION['last_attempt']);
        http_response_code(429);
        echo json_encode([
            'success' => false, 
            'message' => "Too many login attempts. Try again in " . ceil($remaining / 60) . " minutes."
        ]);
        exit();
    }
    
    $username = $input['username'];
    $pin = $input['pin'];
    
    // Check if user exists
    if (!isset($users[$username])) {
        $_SESSION['login_attempts']++;
        $_SESSION['last_attempt'] = time();
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username or PIN']);
        exit();
    }
    
    // Verify password
    if (password_verify($pin, $users[$username]['password'])) {
        // Success! Reset attempts
        $_SESSION['login_attempts'] = 0;
        $_SESSION['user'] = $username;
        $_SESSION['user_data'] = [
            'name' => $users[$username]['name'],
            'role' => $users[$username]['role'],
            'permissions' => $users[$username]['permissions']
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'name' => $users[$username]['name'],
                'role' => $users[$username]['role'],
                'permissions' => $users[$username]['permissions']
            ]
        ]);
    } else {
        $_SESSION['login_attempts']++;
        $_SESSION['last_attempt'] = time();
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username or PIN']);
    }
    
} elseif ($method === 'GET') {
    // CHECK SESSION
    if (isset($_SESSION['user']) && isset($_SESSION['user_data'])) {
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => $_SESSION['user_data']
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
    
} elseif ($method === 'DELETE') {
    // LOGOUT
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
