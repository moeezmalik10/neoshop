<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../security.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respond_json(['status' => 'ok']);
}

/**
 * Check once whether the users table has a `name` column.
 */
function users_has_name_column(): bool {
    static $has = null;
    if ($has !== null) return $has;
    try {
        $pdo = db_connect();
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'name'");
        $has = (bool)$stmt->fetch();
        return $has;
    } catch (Throwable $e) {
        return false;
    }
}

// Handle POST requests for login and registration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        respond_json(['error' => 'Invalid JSON input'], 400);
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'register':
            handleRegistration($input);
            break;
        case 'login':
            handleLogin($input);
            break;
        default:
            respond_json(['error' => 'Invalid action'], 400);
    }
}

function handleRegistration($input) {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $name = trim($input['name'] ?? '');
    
    // Validation
    $requireName = users_has_name_column();
    if (empty($email) || empty($password) || ($requireName && empty($name))) {
        respond_json(['error' => $requireName ? 'Email, password, and name are required' : 'Email and password are required'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond_json(['error' => 'Invalid email format'], 400);
    }
    
    if (strlen($password) < 6) {
        respond_json(['error' => 'Password must be at least 6 characters'], 400);
    }
    
    try {
        $pdo = db_connect();
        
        // Check if user already exists
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            respond_json(['error' => 'Account already exists with this email'], 409);
        }
        
        // Create new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        if (users_has_name_column()) {
            $stmt = $pdo->prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
            $stmt->execute([$email, $hashedPassword, $name]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO users (email, password) VALUES (?, ?)');
            $stmt->execute([$email, $hashedPassword]);
        }
        
        $userId = $pdo->lastInsertId();
        
        // Generate JWT token
        $token = jwt_sign([
            'sub' => $userId,
            'email' => $email,
            'name' => $name ?: 'User',
            'role' => 'customer'
        ]);
        
        respond_json([
            'success' => true,
            'message' => 'Account created successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'name' => $name ?: 'User'
            ]
        ]);
        
    } catch (PDOException $e) {
        respond_json(['error' => 'Database error occurred'], 500);
    }
}

function handleLogin($input) {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validation
    if (empty($email) || empty($password)) {
        respond_json(['error' => 'Email and password are required'], 400);
    }
    
    try {
        $pdo = db_connect();
        
        // Check if user exists
        if (users_has_name_column()) {
            $stmt = $pdo->prepare('SELECT id, email, password, name FROM users WHERE email = ?');
        } else {
            $stmt = $pdo->prepare('SELECT id, email, password FROM users WHERE email = ?');
        }
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            respond_json([
                'error' => 'Account not found',
                'suggestion' => 'Please create an account first'
            ], 404);
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            respond_json(['error' => 'Invalid password'], 401);
        }
        
        // Generate JWT token
        $token = jwt_sign([
            'sub' => $user['id'],
            'email' => $user['email'],
            'name' => ($user['name'] ?? 'User'),
            'role' => 'customer'
        ]);
        
        respond_json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => ($user['name'] ?? 'User')
            ]
        ]);
        
    } catch (PDOException $e) {
        respond_json(['error' => 'Database error occurred'], 500);
    }
}

// Handle other methods
respond_json(['error' => 'Method not allowed'], 405);
