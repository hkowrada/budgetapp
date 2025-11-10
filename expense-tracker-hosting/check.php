<?php
// Simple check to see if PHP is working
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP Check</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .box {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success {
            color: #28a745;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .info {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        td:first-child {
            font-weight: bold;
            width: 40%;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="box">
        <div class="success">✅ PHP is Working!</div>
        
        <div class="info">
            <strong>Good news!</strong> Your server supports PHP and it's running correctly.
        </div>
        
        <h3>Server Information:</h3>
        <table>
            <tr>
                <td>PHP Version:</td>
                <td><?php echo phpversion(); ?></td>
            </tr>
            <tr>
                <td>Server Software:</td>
                <td><?php echo $_SERVER['SERVER_SOFTWARE']; ?></td>
            </tr>
            <tr>
                <td>Document Root:</td>
                <td><?php echo $_SERVER['DOCUMENT_ROOT']; ?></td>
            </tr>
            <tr>
                <td>Current Directory:</td>
                <td><?php echo __DIR__; ?></td>
            </tr>
        </table>
        
        <h3>File Check:</h3>
        <table>
            <tr>
                <td>api.php exists:</td>
                <td><?php echo file_exists(__DIR__ . '/api.php') ? '✅ Yes' : '❌ No - Upload api.php'; ?></td>
            </tr>
            <tr>
                <td>data.json exists:</td>
                <td><?php echo file_exists(__DIR__ . '/data.json') ? '✅ Yes' : '❌ No - Upload data.json'; ?></td>
            </tr>
            <tr>
                <td>data.json writable:</td>
                <td>
                    <?php 
                    $dataFile = __DIR__ . '/data.json';
                    if (file_exists($dataFile)) {
                        if (is_writable($dataFile)) {
                            echo '✅ Yes - Permissions are correct';
                        } else {
                            echo '❌ No - Set permissions to 666';
                        }
                    } else {
                        echo '⚠️ File not found';
                    }
                    ?>
                </td>
            </tr>
            <tr>
                <td>.htaccess exists:</td>
                <td><?php echo file_exists(__DIR__ . '/.htaccess') ? '✅ Yes' : '⚠️ No - Upload .htaccess for security'; ?></td>
            </tr>
            <tr>
                <td>index.html exists:</td>
                <td><?php echo file_exists(__DIR__ . '/index.html') ? '✅ Yes' : '❌ No - Upload index.html'; ?></td>
            </tr>
        </table>
        
        <div style="margin-top: 30px;">
            <a href="test.html" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                🔧 Run Full Tests
            </a>
            <a href="index.html" style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                🚀 Go to App
            </a>
        </div>
        
        <?php
        $allGood = file_exists(__DIR__ . '/api.php') && 
                   file_exists(__DIR__ . '/data.json') && 
                   file_exists(__DIR__ . '/index.html') &&
                   is_writable(__DIR__ . '/data.json');
        
        if ($allGood) {
            echo '<div class="info" style="background: #d4edda; margin-top: 20px;">';
            echo '<strong>🎉 All files are set up correctly!</strong><br>';
            echo 'You can now use the expense tracker.';
            echo '</div>';
        } else {
            echo '<div class="info" style="background: #fff3cd; margin-top: 20px;">';
            echo '<strong>⚠️ Some files are missing or have wrong permissions.</strong><br>';
            echo 'Please fix the issues shown above.';
            echo '</div>';
        }
        ?>
    </div>
</body>
</html>
