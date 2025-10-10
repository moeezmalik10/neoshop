<?php
/**
 * NeoShop Setup Script
 * Run this script to set up the database and initial configuration
 */

// Check if we're running from command line or web
$is_cli = php_sapi_name() === 'cli';

if (!$is_cli) {
    // Web interface
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NeoShop Setup</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .success { color: green; }
            .error { color: red; }
            .info { color: blue; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>NeoShop Setup</h1>
        <?php
}

try {
    echo $is_cli ? "NeoShop Setup Script\n" : "<h2>Setup Progress</h2>\n";
    echo $is_cli ? "==================\n\n" : "<div class='info'>Starting setup process...</div>\n";
    
    // Check PHP version
    if (version_compare(PHP_VERSION, '7.4.0', '<')) {
        throw new Exception("PHP 7.4 or higher is required. Current version: " . PHP_VERSION);
    }
    echo $is_cli ? "✓ PHP version: " . PHP_VERSION . "\n" : "<div class='success'>✓ PHP version: " . PHP_VERSION . "</div>\n";
    
    // Check required extensions
    $required_extensions = ['pdo', 'pdo_mysql', 'json', 'openssl'];
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            throw new Exception("Required PHP extension '$ext' is not loaded");
        }
    }
    echo $is_cli ? "✓ Required PHP extensions loaded\n" : "<div class='success'>✓ Required PHP extensions loaded</div>\n";
    
    // Load configuration
    $config_file = __DIR__ . '/backend/config.php';
    if (!file_exists($config_file)) {
        throw new Exception("Configuration file not found: $config_file");
    }
    
    $config = require $config_file;
    echo $is_cli ? "✓ Configuration loaded\n" : "<div class='success'>✓ Configuration loaded</div>\n";
    
    // Test database connection
    require_once __DIR__ . '/backend/db.php';
    $db_test = test_db_connection();
    
    if ($db_test['status'] === 'error') {
        throw new Exception("Database connection failed: " . $db_test['message']);
    }
    
    echo $is_cli ? "✓ Database connection successful\n" : "<div class='success'>✓ Database connection successful</div>\n";
    
    // Run migrations
    $pdo = db_connect();
    echo $is_cli ? "✓ Database connected\n" : "<div class='success'>✓ Database connected</div>\n";
    
    // Check if tables exist
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo $is_cli ? "Running database migrations...\n" : "<div class='info'>Running database migrations...</div>\n";
        run_migrations($pdo);
        echo $is_cli ? "✓ Database migrations completed\n" : "<div class='success'>✓ Database migrations completed</div>\n";
    } else {
        echo $is_cli ? "✓ Database tables already exist\n" : "<div class='success'>✓ Database tables already exist</div>\n";
    }
    
    // Check if admin user exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $admin_count = $stmt->fetchColumn();
    
    if ($admin_count == 0) {
        echo $is_cli ? "No admin user found. Please run: php backend/setup_admin.php\n" : "<div class='info'>No admin user found. <a href='backend/setup_admin.php'>Create admin user</a></div>\n";
    } else {
        echo $is_cli ? "✓ Admin user exists\n" : "<div class='success'>✓ Admin user exists</div>\n";
    }
    
    // Check if products exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    $product_count = $stmt->fetchColumn();
    
    if ($product_count == 0) {
        echo $is_cli ? "No products found. Loading sample data...\n" : "<div class='info'>No products found. Loading sample data...</div>\n";
        
        // Load sample products from JSON
        $products_file = __DIR__ . '/data/products.json';
        if (file_exists($products_file)) {
            $products_data = json_decode(file_get_contents($products_file), true);
            if ($products_data && isset($products_data['products'])) {
                foreach ($products_data['products'] as $product) {
                    $stmt = $pdo->prepare("
                        INSERT INTO products (name, description, price, image, category, stock_quantity, created_at) 
                        VALUES (?, ?, ?, ?, ?, ?, NOW())
                    ");
                    $stmt->execute([
                        $product['name'],
                        $product['description'],
                        $product['price'],
                        $product['image'],
                        $product['category'],
                        $product['stock'] ?? 10
                    ]);
                }
                echo $is_cli ? "✓ Sample products loaded\n" : "<div class='success'>✓ Sample products loaded</div>\n";
            }
        }
    } else {
        echo $is_cli ? "✓ Products exist ($product_count found)\n" : "<div class='success'>✓ Products exist ($product_count found)</div>\n";
    }
    
    echo $is_cli ? "\nSetup completed successfully!\n" : "<div class='success'><h2>Setup completed successfully!</h2></div>\n";
    echo $is_cli ? "You can now access your NeoShop at: http://localhost/neoshop/\n" : "<div class='info'>You can now access your NeoShop at: <a href='index.html'>index.html</a></div>\n";
    
} catch (Exception $e) {
    $error_msg = "Setup failed: " . $e->getMessage();
    echo $is_cli ? $error_msg . "\n" : "<div class='error'><h2>Setup Failed</h2><p>$error_msg</p></div>\n";
    exit(1);
}

if (!$is_cli) {
    ?>
    </body>
    </html>
    <?php
}
?>
