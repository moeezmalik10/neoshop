<?php
// Simple front controller routing to endpoints

declare(strict_types=1);

require __DIR__ . '/../db.php';
require __DIR__ . '/../security.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// CORS preflight
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    respond_json(['ok' => true]);
}

if ($path === '/api/health') {
    respond_json(['ok' => true, 'time' => time()]);
}

if ($path === '/api/products') {
    require_method(['GET']);
    $pdo = db_connect();
    // Filters: q (search), min, max, category_id
    $q = trim($_GET['q'] ?? '');
    $min = $_GET['min'] ?? null;
    $max = $_GET['max'] ?? null;
    $cat = $_GET['category_id'] ?? null;
    $sql = 'SELECT p.id, p.name, p.price, p.description, p.image, p.stock FROM products p';
    $where = [];
    $params = [];
    if ($cat) { $sql .= ' JOIN product_categories pc ON pc.product_id = p.id AND pc.category_id = ?'; $params[] = (int)$cat; }
    if ($q !== '') { $where[] = 'p.name LIKE ?'; $params[] = "%$q%"; }
    if ($min !== null) { $where[] = 'p.price >= ?'; $params[] = (float)$min; }
    if ($max !== null) { $where[] = 'p.price <= ?'; $params[] = (float)$max; }
    if ($where) { $sql .= ' WHERE ' . implode(' AND ', $where); }
    $sql .= ' ORDER BY p.id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    respond_json($stmt->fetchAll());
}

if ($path === '/api/auth/register') {
    require_method(['POST']);
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = trim($input['email'] ?? '');
    $pass = $input['password'] ?? '';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 6) {
        respond_json(['error' => 'Invalid email or password too short'], 422);
    }
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $pdo = db_connect();
    $stmt = $pdo->prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    try { $stmt->execute([$email, $hash]); } catch (Throwable $e) { respond_json(['error' => 'Email already used'], 409); }
    respond_json(['ok' => true]);
}

if ($path === '/api/auth/login') {
    require_method(['POST']);
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = trim($input['email'] ?? '');
    $pass = $input['password'] ?? '';
    $pdo = db_connect();
    $stmt = $pdo->prepare('SELECT id, password FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($pass, $user['password'])) {
        respond_json(['error' => 'Invalid credentials'], 401);
    }
    $token = jwt_sign(['sub' => (int)$user['id'], 'role' => 'customer']);
    respond_json(['ok' => true, 'token' => $token]);
}

// Example protected admin route
if ($path === '/api/admin/products') {
    require_method(['POST', 'PUT', 'DELETE']);
    $claims = require_jwt_role(['admin']); // only admin
    respond_json(['ok' => true, 'msg' => 'Admin route placeholder']);
}

if ($path === '/api/orders') {
    require_method(['POST']);
    $claims = require_jwt_role(['customer','admin']);
    $uid = (int)$claims['sub'];
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $items = $input['items'] ?? [];
    if (empty($items)) respond_json(['error' => 'No items'], 400);
    $pdo = db_connect();
    $pdo->beginTransaction();
    try {
        $total = 0.0;
        // Stock check and lock rows
        $lock = $pdo->prepare('SELECT id, stock, price FROM products WHERE id = ? FOR UPDATE');
        foreach ($items as $it) {
            $pid = (int)$it['product_id']; $qty = (int)$it['quantity'];
            $lock->execute([$pid]);
            $p = $lock->fetch();
            if (!$p || (int)$p['stock'] < $qty) { throw new Exception('Out of stock'); }
            $total += ((float)$p['price']) * $qty;
        }
        $stmt = $pdo->prepare('INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, "pending")');
        $stmt->execute([$uid, $total]);
        $orderId = (int)$pdo->lastInsertId();
        $oi = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        $dec = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        foreach ($items as $it) {
            $oi->execute([$orderId, (int)$it['product_id'], (int)$it['quantity'], (float)$it['price']]);
            $dec->execute([(int)$it['quantity'], (int)$it['product_id']]);
        }
        $pdo->commit();
        respond_json(['ok' => true, 'order_id' => $orderId]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        respond_json(['error' => 'Failed to create order', 'detail' => $e->getMessage()], 500);
    }
}

respond_json(['error' => 'Not Found'], 404);


