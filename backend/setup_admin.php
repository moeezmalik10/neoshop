<?php
require_once __DIR__ . '/db.php';

try {
    $pdo = db_connect();
    
    // Add role column to users table if it doesn't exist
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'admin') DEFAULT 'customer'");
    
    // Check if admin user already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND role = "admin"');
    $stmt->execute(['admin@gmail.com']);
    $adminExists = $stmt->fetch();
    
    if (!$adminExists) {
        // Create admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
        $stmt->execute(['admin@gmail.com', $hashedPassword, 'Administrator', 'admin']);
        
        echo "Admin user created successfully!\n";
        echo "Email: admin@gmail.com\n";
        echo "Password: admin123\n";
    } else {
        echo "Admin user already exists!\n";
    }
    
    echo "Database setup completed successfully!\n";
    
} catch (PDOException $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
}
?>
