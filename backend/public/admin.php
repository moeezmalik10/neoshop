<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../security.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respond_json(['status' => 'ok']);
}

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Handle POST requests for admin login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        respond_json(['error' => 'Invalid JSON input'], 400);
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'login':
            handleAdminLogin($input);
            break;
        case 'get_dashboard_data':
            handleGetDashboardData($input);
            break;
        case 'get_products':
            handleGetProducts($input);
            break;
        case 'create_product':
            handleCreateProduct($input);
            break;
        case 'update_product':
            handleUpdateProduct($input);
            break;
        case 'delete_product':
            handleDeleteProduct($input);
            break;
        case 'get_orders':
            handleGetOrders($input);
            break;
        case 'update_order_status':
            handleUpdateOrderStatus($input);
            break;
        case 'get_customers':
            handleGetCustomers($input);
            break;
        case 'toggle_customer_status':
            handleToggleCustomerStatus($input);
            break;
        case 'test':
            handleTest($input);
            break;
        default:
            respond_json(['error' => 'Invalid action'], 400);
    }
}

function handleAdminLogin($input) {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validation
    if (empty($email) || empty($password)) {
        respond_json(['error' => 'Email and password are required'], 400);
    }
    
    // Debug info
    $debug = [
        'received_email' => $email,
        'received_password' => $password,
        'expected_email' => ADMIN_EMAIL,
        'expected_password' => ADMIN_PASSWORD,
        'email_match' => $email === ADMIN_EMAIL,
        'password_match' => $password === ADMIN_PASSWORD
    ];
    
    // Simple hardcoded admin check first
    if ($email === ADMIN_EMAIL && $password === ADMIN_PASSWORD) {
        // Generate JWT token for admin
        $token = jwt_sign([
            'sub' => 'admin',
            'email' => $email,
            'role' => 'admin',
            'name' => 'Administrator'
        ]);
        
        respond_json([
            'success' => true,
            'message' => 'Admin login successful',
            'token' => $token,
            'user' => [
                'id' => 'admin',
                'email' => $email,
                'name' => 'Administrator',
                'role' => 'admin'
            ],
            'debug' => $debug
        ]);
    }
    
    // If not hardcoded admin, try database
    try {
        $pdo = db_connect();
        
        // Check if role column exists, if not add it
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'role'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('customer', 'admin') DEFAULT 'customer'");
        }
        
        // Check if admin user exists in database
        $stmt = $pdo->prepare('SELECT id, email, password, name FROM users WHERE email = ? AND role = "admin"');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        
        if ($admin && password_verify($password, $admin['password'])) {
            // Generate JWT token for admin
            $token = jwt_sign([
                'sub' => $admin['id'],
                'email' => $admin['email'],
                'role' => 'admin',
                'name' => $admin['name'] ?: 'Administrator'
            ]);
            
            respond_json([
                'success' => true,
                'message' => 'Admin login successful',
                'token' => $token,
                'user' => [
                    'id' => $admin['id'],
                    'email' => $admin['email'],
                    'name' => $admin['name'] ?: 'Administrator',
                    'role' => 'admin'
                ]
            ]);
        }
        
    } catch (PDOException $e) {
        // Database error, but we already checked hardcoded credentials above
    }
    
    // If we get here, credentials are invalid
    respond_json(['error' => 'Invalid admin credentials', 'debug' => $debug], 401);
}

function handleGetDashboardData($input) {
    // Verify admin token
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        $pdo = db_connect();
        
        // Get sales overview
        $salesData = getSalesOverview($pdo);
        
        // Get order activity
        $orderData = getOrderActivity($pdo);
        
        // Get customer insights
        $customerData = getCustomerInsights($pdo);
        
        // Get visitor insights (mock data for now)
        $visitorData = getVisitorInsights();
        
        respond_json([
            'success' => true,
            'data' => [
                'sales' => $salesData,
                'orders' => $orderData,
                'customers' => $customerData,
                'visitors' => $visitorData
            ]
        ]);
        
    } catch (PDOException $e) {
        respond_json(['error' => 'Database error occurred'], 500);
    }
}

function getSalesOverview($pdo) {
    try {
        // Get total revenue from all completed orders
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM orders WHERE status = 'completed'");
        $stmt->execute();
        $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];
        
        // Get monthly revenue (current month)
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_price), 0) as monthly_revenue FROM orders WHERE status = 'completed' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
        $stmt->execute();
        $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['monthly_revenue'];
        
        // Get daily revenue (today)
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_price), 0) as daily_revenue FROM orders WHERE status = 'completed' AND DATE(created_at) = CURDATE()");
        $stmt->execute();
        $dailyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['daily_revenue'];
        
        // Get top products by sales
        $stmt = $pdo->prepare("
            SELECT p.name, SUM(oi.quantity) as sales, SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY p.id, p.name
            ORDER BY sales DESC
            LIMIT 3
        ");
        $stmt->execute();
        $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate revenue growth (compare this month to last month)
        $stmt = $pdo->prepare("
            SELECT 
                COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN total_price ELSE 0 END), 0) as current_month,
                COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN total_price ELSE 0 END), 0) as last_month
            FROM orders 
            WHERE status = 'completed'
        ");
        $stmt->execute();
        $growthData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $revenueGrowth = 0;
        if ($growthData['last_month'] > 0) {
            $revenueGrowth = (($growthData['current_month'] - $growthData['last_month']) / $growthData['last_month']) * 100;
        }
        
        return [
            'total_revenue' => floatval($totalRevenue),
            'monthly_revenue' => floatval($monthlyRevenue),
            'daily_revenue' => floatval($dailyRevenue),
            'top_products' => $topProducts,
            'revenue_growth' => round($revenueGrowth, 2)
        ];
        
    } catch (Exception $e) {
        // Return zero values if database query fails
        return [
            'total_revenue' => 0,
            'monthly_revenue' => 0,
            'daily_revenue' => 0,
            'top_products' => [],
            'revenue_growth' => 0
        ];
    }
}

function getOrderActivity($pdo) {
    try {
        // Get total orders
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_orders FROM orders");
        $stmt->execute();
        $totalOrders = $stmt->fetch(PDO::FETCH_ASSOC)['total_orders'];
        
        // Get orders by status
        $stmt = $pdo->prepare("
            SELECT 
                status,
                COUNT(*) as count
            FROM orders 
            GROUP BY status
        ");
        $stmt->execute();
        $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $completedOrders = 0;
        $pendingOrders = 0;
        $processingOrders = 0;
        $cancelledOrders = 0;
        
        foreach ($statusCounts as $status) {
            switch ($status['status']) {
                case 'completed':
                    $completedOrders = $status['count'];
                    break;
                case 'pending':
                    $pendingOrders = $status['count'];
                    break;
                case 'processing':
                    $processingOrders = $status['count'];
                    break;
                case 'cancelled':
                    $cancelledOrders = $status['count'];
                    break;
            }
        }
        
        // Calculate conversion rate (completed orders / total orders)
        $conversionRate = $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0;
        
        // For abandoned carts, we'll use a simple estimate based on pending orders
        $abandonedCarts = $pendingOrders;
        
        return [
            'total_orders' => intval($totalOrders),
            'completed_orders' => intval($completedOrders),
            'pending_orders' => intval($pendingOrders),
            'processing_orders' => intval($processingOrders),
            'cancelled_orders' => intval($cancelledOrders),
            'abandoned_carts' => intval($abandonedCarts),
            'conversion_rate' => $conversionRate
        ];
        
    } catch (Exception $e) {
        return [
            'total_orders' => 0,
            'completed_orders' => 0,
            'pending_orders' => 0,
            'processing_orders' => 0,
            'cancelled_orders' => 0,
            'abandoned_carts' => 0,
            'conversion_rate' => 0
        ];
    }
}

function getCustomerInsights($pdo) {
    try {
        // Get total customers
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'");
        $stmt->execute();
        $totalCustomers = $stmt->fetch(PDO::FETCH_ASSOC)['total_customers'];
        
        // Get new customers (registered in last 30 days)
        $stmt = $pdo->prepare("SELECT COUNT(*) as new_customers FROM users WHERE role = 'customer' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stmt->execute();
        $newCustomers = $stmt->fetch(PDO::FETCH_ASSOC)['new_customers'];
        
        // Get top customers by order count and total spent
        $stmt = $pdo->prepare("
            SELECT 
                u.name,
                u.email,
                COUNT(o.id) as orders,
                COALESCE(SUM(o.total_price), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
            WHERE u.role = 'customer'
            GROUP BY u.id, u.name, u.email
            HAVING orders > 0
            ORDER BY total_spent DESC
            LIMIT 5
        ");
        $stmt->execute();
        $topCustomers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'total_customers' => intval($totalCustomers),
            'new_customers' => intval($newCustomers),
            'top_customers' => $topCustomers,
            'demographics' => [
                'locations' => [] // We don't have location data in the current schema
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'total_customers' => 0,
            'new_customers' => 0,
            'top_customers' => [],
            'demographics' => [
                'locations' => []
            ]
        ];
    }
}

function getVisitorInsights() {
    // Since we don't have analytics tracking implemented yet, return empty data
    // In a real implementation, this would connect to Google Analytics or similar
    return [
        'total_visitors' => 0,
        'page_views' => 0,
        'conversion_rate' => 0,
        'bounce_rate' => 0,
        'avg_session_duration' => '0m 0s',
        'top_pages' => []
    ];
}

function handleGetProducts($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        $pdo = getDB();
        
        // Get products from database
        $stmt = $pdo->prepare("SELECT * FROM products ORDER BY created_at DESC");
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no products in database, load from JSON file as fallback
        if (empty($products)) {
            $productsJson = file_get_contents(__DIR__ . '/../../data/products.json');
            $products = json_decode($productsJson, true) ?: [];
        }
        
        respond_json([
            'success' => true,
            'products' => $products
        ]);
        
    } catch (Exception $e) {
        // Fallback to JSON file if database fails
        try {
            $productsJson = file_get_contents(__DIR__ . '/../../data/products.json');
            $products = json_decode($productsJson, true) ?: [];
            
            respond_json([
                'success' => true,
                'products' => $products
            ]);
        } catch (Exception $e2) {
            respond_json(['error' => 'Failed to fetch products: ' . $e2->getMessage()], 500);
        }
    }
}

function handleCreateProduct($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $stock = $input['stock'] ?? 0;
    $image = $input['image'] ?? '';
    
    if (empty($name) || empty($price)) {
        respond_json(['error' => 'Name and price are required'], 400);
    }
    
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("
            INSERT INTO products (name, description, price, category, stock, image, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        $result = $stmt->execute([$name, $description, $price, $category, $stock, $image]);
        
        if ($result) {
            $productId = $pdo->lastInsertId();
            respond_json([
                'success' => true, 
                'message' => 'Product created successfully',
                'product_id' => $productId
            ]);
        } else {
            respond_json(['error' => 'Failed to create product'], 500);
        }
        
    } catch (Exception $e) {
        respond_json(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleUpdateProduct($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    $id = $input['id'] ?? null;
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $stock = $input['stock'] ?? 0;
    $image = $input['image'] ?? '';
    
    if (!$id || empty($name) || empty($price)) {
        respond_json(['error' => 'ID, name and price are required'], 400);
    }
    
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("
            UPDATE products 
            SET name = ?, description = ?, price = ?, category = ?, stock = ?, image = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $result = $stmt->execute([$name, $description, $price, $category, $stock, $image, $id]);
        
        if ($result) {
            respond_json(['success' => true, 'message' => 'Product updated successfully']);
        } else {
            respond_json(['error' => 'Failed to update product'], 500);
        }
        
    } catch (Exception $e) {
        respond_json(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleDeleteProduct($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    $id = $input['id'] ?? null;
    
    if (!$id) {
        respond_json(['error' => 'Product ID is required'], 400);
    }
    
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($result) {
            respond_json(['success' => true, 'message' => 'Product deleted successfully']);
        } else {
            respond_json(['error' => 'Failed to delete product'], 500);
        }
        
    } catch (Exception $e) {
        respond_json(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleGetOrders($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        $pdo = getDB();
        
        // Get orders with customer information
        $stmt = $pdo->prepare("
            SELECT 
                o.id,
                o.total_price as total,
                o.status,
                o.created_at as date,
                u.name as customer,
                u.email,
                COUNT(oi.id) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, o.total_price, o.status, o.created_at, u.name, u.email
            ORDER BY o.created_at DESC
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the orders data
        $formattedOrders = array_map(function($order) {
            return [
                'id' => 'ORD-' . str_pad($order['id'], 3, '0', STR_PAD_LEFT),
                'customer' => $order['customer'] ?: 'Guest',
                'email' => $order['email'] ?: 'N/A',
                'total' => floatval($order['total']),
                'status' => $order['status'],
                'date' => date('Y-m-d', strtotime($order['date'])),
                'items' => intval($order['items'])
            ];
        }, $orders);
        
        // If no orders in database, return mock data
        if (empty($formattedOrders)) {
            $formattedOrders = [
                [
                    'id' => 'ORD-001',
                    'customer' => 'John Doe',
                    'email' => 'john@example.com',
                    'total' => 125.50,
                    'status' => 'completed',
                    'date' => '2024-01-20',
                    'items' => 3
                ],
                [
                    'id' => 'ORD-002',
                    'customer' => 'Jane Smith',
                    'email' => 'jane@example.com',
                    'total' => 89.99,
                    'status' => 'processing',
                    'date' => '2024-01-19',
                    'items' => 2
                ]
            ];
        }
        
        respond_json([
            'success' => true,
            'orders' => $formattedOrders
        ]);
        
    } catch (Exception $e) {
        // Fallback to mock data if database fails
        $orders = [
            [
                'id' => 'ORD-001',
                'customer' => 'John Doe',
                'email' => 'john@example.com',
                'total' => 125.50,
                'status' => 'completed',
                'date' => '2024-01-20',
                'items' => 3
            ],
            [
                'id' => 'ORD-002',
                'customer' => 'Jane Smith',
                'email' => 'jane@example.com',
                'total' => 89.99,
                'status' => 'processing',
                'date' => '2024-01-19',
                'items' => 2
            ]
        ];
        
        respond_json([
            'success' => true,
            'orders' => $orders
        ]);
    }
}

function handleUpdateOrderStatus($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    $orderId = $input['order_id'] ?? null;
    $status = $input['status'] ?? null;
    
    if (!$orderId || !$status) {
        respond_json(['error' => 'Order ID and status are required'], 400);
    }
    
    // Validate status
    $validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        respond_json(['error' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)], 400);
    }
    
    try {
        $pdo = getDB();
        
        // Extract numeric ID from order ID (e.g., "ORD-001" -> "1")
        $numericId = intval(str_replace('ORD-', '', $orderId));
        
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $result = $stmt->execute([$status, $numericId]);
        
        if ($result) {
            respond_json(['success' => true, 'message' => 'Order status updated successfully']);
        } else {
            respond_json(['error' => 'Failed to update order status'], 500);
        }
        
    } catch (Exception $e) {
        respond_json(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleGetCustomers($input) {
    if (!verifyAdminToken()) {
        respond_json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        $pdo = getDB();
        
        // Get customers with their order statistics
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                COUNT(o.id) as orders,
                COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_price ELSE 0 END), 0) as total_spent,
                MAX(o.created_at) as last_order,
                CASE WHEN u.is_active IS NULL OR u.is_active = 1 THEN 'active' ELSE 'inactive' END as status
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.role = 'customer'
            GROUP BY u.id, u.name, u.email, u.created_at, u.is_active
            ORDER BY total_spent DESC
        ");
        $stmt->execute();
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the data
        $formattedCustomers = array_map(function($customer) {
            return [
                'id' => intval($customer['id']),
                'name' => $customer['name'],
                'email' => $customer['email'],
                'orders' => intval($customer['orders']),
                'total_spent' => floatval($customer['total_spent']),
                'last_order' => $customer['last_order'] ? date('Y-m-d', strtotime($customer['last_order'])) : 'Never',
                'status' => $customer['status'],
                'created_at' => date('Y-m-d', strtotime($customer['created_at']))
            ];
        }, $customers);
        
        respond_json([
            'success' => true,
            'customers' => $formattedCustomers
        ]);
        
    } catch (Exception $e) {
        respond_json(['error' => 'Failed to fetch customers: ' . $e->getMessage()], 500);
    }
}

function handleToggleCustomerStatus($input) {
    $customerId = $input['customer_id'] ?? null;
    $isActive = $input['is_active'] ?? false;
    
    if (!$customerId) {
        respond_json(['error' => 'Customer ID is required'], 400);
    }
    
    try {
        $pdo = getDB();
        
        // Update customer status
        $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ?");
        $result = $stmt->execute([$isActive ? 1 : 0, $customerId]);
        
        if ($result) {
            respond_json([
                'success' => true,
                'message' => 'Customer status updated successfully'
            ]);
        } else {
            respond_json(['error' => 'Failed to update customer status'], 500);
        }
    } catch (Exception $e) {
        respond_json(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleTest($input) {
    respond_json([
        'success' => true,
        'message' => 'Admin API is working',
        'admin_email' => ADMIN_EMAIL,
        'admin_password' => ADMIN_PASSWORD,
        'input_received' => $input
    ]);
}

function verifyAdminToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return false;
    }
    
    $token = substr($authHeader, 7);
    
    try {
        $payload = jwt_verify($token);
        return $payload && $payload['role'] === 'admin';
    } catch (Exception $e) {
        return false;
    }
}

// Handle other methods
respond_json(['error' => 'Method not allowed'], 405);
?>
