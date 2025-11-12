<?php
// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/data.json';

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

// Check if data file exists and is writable
if (!file_exists($dataFile)) {
    // Try to create initial data file
    $initialData = [
        'categories' => ['Rent', 'Electricity', 'Groceries', 'Transport', 'Entertainment'],
        'expenses' => [],
        'salaries' => [
            date('Y-m') => 2700
        ],
        'recurring' => []
    ];
    
    $result = @file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
    if ($result === false) {
        sendResponse(false, 'Cannot create data file. Check folder permissions.', null, 500);
    }
    @chmod($dataFile, 0666); // Set permissions
}

// Check if file is readable
if (!is_readable($dataFile)) {
    sendResponse(false, 'Data file is not readable. Check file permissions.', null, 500);
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Read and return data
        $data = @file_get_contents($dataFile);
        if ($data === false) {
            sendResponse(false, 'Failed to read data file', null, 500);
        }
        
        // Validate JSON
        $jsonData = json_decode($data, true);
        if ($jsonData === null && $data !== 'null') {
            sendResponse(false, 'Data file contains invalid JSON', null, 500);
        }
        
        // Fix: Ensure salaries is an object, not an array
        // Empty arrays [] in JSON become empty PHP arrays, which re-encode as []
        // We need them to be objects {} 
        if (isset($jsonData['salaries']) && is_array($jsonData['salaries']) && empty($jsonData['salaries'])) {
            // Convert empty array to empty object for JSON
            $jsonData['salaries'] = new stdClass();
        }
        
        // Re-encode with proper formatting
        $output = json_encode($jsonData, JSON_PRETTY_PRINT);
        
        // Additional fix: Replace empty salaries array with empty object
        $output = preg_replace('/"salaries":\s*\[\s*\]/', '"salaries": {}', $output);
        
        echo $output;
        
    } elseif ($method === 'POST') {
        // Check if file is writable
        if (!is_writable($dataFile)) {
            sendResponse(false, 'Data file is not writable. Set permissions to 666.', null, 500);
        }
        
        // Get input data
        $input = @file_get_contents('php://input');
        if ($input === false) {
            sendResponse(false, 'Failed to read input data', null, 400);
        }
        
        // Decode JSON
        $data = json_decode($input, true);
        if ($data === null) {
            sendResponse(false, 'Invalid JSON data received', null, 400);
        }
        
        // Validate data structure
        if (!isset($data['categories']) || !isset($data['expenses'])) {
            sendResponse(false, 'Invalid data structure', null, 400);
        }
        
        // Ensure salaries is properly initialized
        if (!isset($data['salaries'])) {
            $data['salaries'] = new stdClass();
        } else if (is_array($data['salaries']) && empty($data['salaries'])) {
            // Convert empty array to object
            $data['salaries'] = new stdClass();
        }
        
        // Write to file with proper formatting
        $jsonString = json_encode($data, JSON_PRETTY_PRINT);
        
        // Ensure empty salaries is {} not []
        $jsonString = preg_replace('/"salaries":\s*\[\s*\]/', '"salaries": {}', $jsonString);
        
        $result = @file_put_contents($dataFile, $jsonString);
        if ($result === false) {
            sendResponse(false, 'Failed to write data file. Check permissions.', null, 500);
        }
        
        sendResponse(true, 'Data saved successfully', ['bytes' => $result]);
        
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
} catch (Exception $e) {
    sendResponse(false, 'Server error: ' . $e->getMessage(), null, 500);
}
?>