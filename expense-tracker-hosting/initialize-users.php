<?php
/**
 * USER INITIALIZATION SCRIPT
 * This script properly initializes users with hashed passwords in data.json
 * 
 * USAGE:
 * 1. Upload this file to your web hosting (same folder as index.html)
 * 2. Open it in your browser: http://yoursite.com/initialize-users.php
 * 3. It will create the users with correct hashed passwords
 * 4. DELETE this file after running (for security)
 */

$dataFile = __DIR__ . '/data.json';

// Check if data.json exists
if (!file_exists($dataFile)) {
    die('ERROR: data.json not found!');
}

// Read current data
$data = json_decode(file_get_contents($dataFile), true);

if ($data === null) {
    die('ERROR: data.json is not valid JSON!');
}

// Initialize users with CORRECT hashed passwords
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

// Ensure other required fields exist
if (!isset($data['categories'])) {
    $data['categories'] = ['Rent', 'Electricity', 'Groceries', 'Transport', 'Entertainment'];
}
if (!isset($data['expenses'])) {
    $data['expenses'] = [];
}
if (!isset($data['salaries'])) {
    $data['salaries'] = [];
}
if (!isset($data['recurring'])) {
    $data['recurring'] = [];
}

// Save updated data
$result = file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

if ($result === false) {
    die('ERROR: Could not write to data.json. Check file permissions (should be 666).');
}

// Display the generated hashes for reference
echo '<!DOCTYPE html>
<html>
<head>
    <title>User Initialization - Success</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .success {
            background: #d4edda;
            border: 2px solid #28a745;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .info {
            background: #d1ecf1;
            border: 2px solid #17a2b8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        h1 { color: #28a745; }
        h2 { color: #333; }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        .hash {
            word-break: break-all;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
        }
        ul {
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="success">
        <h1>✅ Users Initialized Successfully!</h1>
        <p>All three users have been created with properly hashed passwords.</p>
    </div>
    
    <div class="info">
        <h2>🔑 Login Credentials</h2>
        <ul>
            <li><strong>Harish</strong> - PIN: <code>1234</code> (Administrator - Full Access)</li>
            <li><strong>Bhavani</strong> - PIN: <code>5678</code> (Contributor - Add Only)</li>
            <li><strong>Guest</strong> - PIN: <code>0000</code> (Viewer - Read Only)</li>
        </ul>
    </div>
    
    <div class="info">
        <h2>🔐 Generated Password Hashes</h2>
        <p><strong>Harish (1234):</strong></p>
        <div class="hash">' . $data['users']['harish']['password'] . '</div>
        
        <p><strong>Bhavani (5678):</strong></p>
        <div class="hash">' . $data['users']['bhavani']['password'] . '</div>
        
        <p><strong>Guest (0000):</strong></p>
        <div class="hash">' . $data['users']['guest']['password'] . '</div>
    </div>
    
    <div class="warning">
        <h2>⚠️ IMPORTANT - Next Steps:</h2>
        <ol>
            <li><strong>DELETE this file (initialize-users.php) immediately for security!</strong></li>
            <li>If login_attempts.json exists, delete it to reset any lockouts</li>
            <li>Open <code>index.html</code> and try logging in</li>
            <li>Change the default PINs after first login</li>
        </ol>
    </div>
    
    <div class="info">
        <h2>✅ Ready to Test</h2>
        <p><a href="index.html" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Open Expense Tracker</a></p>
    </div>
</body>
</html>';

?>
