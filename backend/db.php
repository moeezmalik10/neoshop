<?php
// PDO connection helper with improved error handling

function db_connect(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    
    $config = require __DIR__ . '/config.php';
    $db = $config['db'];
    
    try {
        // First try to connect without database name to check if MySQL is running
        $dsn_connect = sprintf('mysql:host=%s;port=%d;charset=%s', $db['host'], $db['port'], $db['charset']);
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5, // 5 second timeout
        ];
        
        // Try to connect to MySQL server first
        $temp_pdo = new PDO($dsn_connect, $db['user'], $db['pass'], $options);
        
        // Check if database exists, create if it doesn't
        $stmt = $temp_pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$db['name']}'");
        if (!$stmt->fetch()) {
            // Create database if it doesn't exist
            $temp_pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $temp_pdo->exec("USE `{$db['name']}`");
            
            // Run migrations if database was just created
            run_migrations($temp_pdo);
        }
        
        // Now connect to the specific database
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $db['host'], $db['port'], $db['name'], $db['charset']);
        $pdo = new PDO($dsn, $db['user'], $db['pass'], $options);
        
        return $pdo;
        
    } catch (PDOException $e) {
        // Log the error for debugging
        error_log("Database connection failed: " . $e->getMessage());
        
        // Return a more user-friendly error
        throw new Exception("Database connection failed. Please check if MySQL is running and credentials are correct. Error: " . $e->getMessage());
    }
}

function run_migrations($pdo) {
    try {
        $migrations_file = __DIR__ . '/migrations.sql';
        if (file_exists($migrations_file)) {
            $sql = file_get_contents($migrations_file);
            // Remove comments and empty lines
            $sql = preg_replace('/--.*$/m', '', $sql);
            $sql = preg_replace('/^\s*$/m', '', $sql);
            
            // Split by semicolon and execute each statement
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    $pdo->exec($statement);
                }
            }
        }
    } catch (Exception $e) {
        error_log("Migration failed: " . $e->getMessage());
        // Don't throw here, just log the error
    }
}

function test_db_connection(): array {
    $result = [
        'status' => 'unknown',
        'message' => '',
        'details' => []
    ];
    
    try {
        $config = require __DIR__ . '/config.php';
        $db = $config['db'];
        
        // Test 1: Check if MySQL extension is loaded
        $result['details']['extensions'] = [
            'mysqli' => extension_loaded('mysqli'),
            'pdo_mysql' => extension_loaded('pdo_mysql')
        ];
        
        // Test 2: Check if we can connect to MySQL server
        $dsn_connect = sprintf('mysql:host=%s;port=%d;charset=%s', $db['host'], $db['port'], $db['charset']);
        $temp_pdo = new PDO($dsn_connect, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        $result['details']['server_connection'] = true;
        $result['details']['server_version'] = $temp_pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
        
        // Test 3: Check if database exists
        $stmt = $temp_pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$db['name']}'");
        $db_exists = (bool)$stmt->fetch();
        $result['details']['database_exists'] = $db_exists;
        
        // Test 4: Try to connect to the specific database
        if ($db_exists) {
            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $db['host'], $db['port'], $db['name'], $db['charset']);
            $pdo = new PDO($dsn, $db['user'], $db['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5
            ]);
            
            $result['details']['database_connection'] = true;
            
            // Test 5: Check if tables exist
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $result['details']['tables'] = $tables;
            
            $result['status'] = 'success';
            $result['message'] = 'Database connection successful';
        } else {
            $result['status'] = 'partial';
            $result['message'] = 'MySQL server is running but database does not exist';
        }
        
    } catch (PDOException $e) {
        $result['status'] = 'error';
        $result['message'] = 'Database connection failed: ' . $e->getMessage();
        $result['details']['error_code'] = $e->getCode();
        $result['details']['error_message'] = $e->getMessage();
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['message'] = 'General error: ' . $e->getMessage();
    }
    
    return $result;
}

function respond_json($data, int $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    $config = require __DIR__ . '/config.php';
    header('Access-Control-Allow-Origin: ' . $config['cors']['allow_origin']);
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    echo json_encode($data);
    exit;
}

function require_method(array $methods){
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', $methods, true)) {
        respond_json(['error' => 'Method Not Allowed'], 405);
    }
}


