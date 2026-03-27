<?php

$cfg = require __DIR__ . '/config.php';

$menuItems = [
    ['m1', 'Cheese Burst Burger', 'Burgers', 'Grill Garage', 4.6, 22, 149, 'BG'],
    ['m2', 'Crispy Paneer Wrap', 'Wraps', 'Roll Republic', 4.4, 19, 129, 'WR'],
    ['m3', 'Masala Maggi Bowl', 'Snacks', 'Night Canteen', 4.7, 15, 89, 'MG'],
    ['m4', 'Farmhouse Pizza Slice', 'Pizza', 'Stone Oven Hub', 4.3, 25, 179, 'PZ'],
    ['m5', 'Loaded Veg Momos', 'Snacks', 'Steam Street', 4.5, 17, 109, 'MM'],
    ['m6', 'Peri Peri Fries', 'Sides', 'Crunch Point', 4.2, 16, 99, 'FR'],
    ['m7', 'Cold Coffee Blast', 'Beverages', 'Bean Bunker', 4.8, 12, 119, 'CF'],
    ['m8', 'Chocolate Shake', 'Beverages', 'Sip Stop', 4.1, 13, 109, 'SH'],
    ['m9', 'Veg Loaded Sandwich', 'Sandwich', 'Bread Box', 4.5, 18, 139, 'SW'],
    ['m10', 'Tandoori Paneer Bowl', 'Meals', 'Campus Curry', 4.6, 24, 199, 'ML'],
    ['m11', 'Chole Rice Combo', 'Meals', 'North Mess', 4.4, 20, 149, 'CR'],
    ['m12', 'Smoky Pasta Alfredo', 'Pasta', 'Pasta Patch', 4.3, 23, 189, 'PA'],
];

try {
    $rootDsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $cfg['db_host'], $cfg['db_port']);
    $rootPdo = new PDO($rootDsn, $cfg['db_user'], $cfg['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $dbName = preg_replace('/[^a-zA-Z0-9_]/', '', $cfg['db_name']);
    $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $rootPdo->exec("USE `$dbName`");

    $rootPdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS menu_items (
            id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(140) NOT NULL,
            category VARCHAR(80) NOT NULL,
            cafe VARCHAR(120) NOT NULL,
            rating DECIMAL(2,1) NOT NULL,
            eta_minutes INT NOT NULL,
            price INT NOT NULL,
            badge VARCHAR(10) NOT NULL,
            active TINYINT(1) NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_code VARCHAR(40) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            customer_name VARCHAR(120) NOT NULL,
            address VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            payment_mode VARCHAR(40) NOT NULL,
            subtotal INT NOT NULL,
            packaging INT NOT NULL,
            delivery INT NOT NULL,
            discount INT NOT NULL,
            tax INT NOT NULL,
            total INT NOT NULL,
            coupon_code VARCHAR(30) NULL,
            status VARCHAR(60) NOT NULL DEFAULT 'Order Confirmed',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            menu_item_id VARCHAR(20) NOT NULL,
            item_name VARCHAR(140) NOT NULL,
            unit_price INT NOT NULL,
            quantity INT NOT NULL,
            CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $countStmt = $rootPdo->query('SELECT COUNT(*) FROM menu_items');
    $menuCount = (int) $countStmt->fetchColumn();
    if ($menuCount === 0) {
        $insertMenu = $rootPdo->prepare('
            INSERT INTO menu_items (id, name, category, cafe, rating, eta_minutes, price, badge, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ');
        foreach ($menuItems as $row) {
            $insertMenu->execute($row);
        }
    }

    $adminEmail = strtolower(trim($cfg['admin_email']));
    $adminPassword = $cfg['admin_password'];
    $adminStmt = $rootPdo->prepare('SELECT id FROM users WHERE email = ?');
    $adminStmt->execute([$adminEmail]);
    $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
    if (!$admin) {
        $insertAdmin = $rootPdo->prepare('
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, "admin")
        ');
        $insertAdmin->execute([
            'Campus Admin',
            $adminEmail,
            password_hash($adminPassword, PASSWORD_DEFAULT),
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    ?>
    <!doctype html>
    <html lang="en">
    <head><meta charset="utf-8"><title>CampusCrave Setup Failed</title></head>
    <body>
      <h2>Setup failed</h2>
      <pre><?php echo htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8'); ?></pre>
    </body>
    </html>
    <?php
    exit;
}

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CampusCrave Setup</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    .box { max-width: 680px; border: 1px solid #ddd; border-radius: 10px; padding: 1rem 1.2rem; }
    code { background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>CampusCrave PHP Setup Complete</h2>
    <p>Database and seed data are ready.</p>
    <ul>
      <li>App: <a href="index.php">index.php</a></li>
      <li>Admin: <a href="admin.php">admin.php</a></li>
      <li>Admin email: <code><?php echo htmlspecialchars($cfg['admin_email'], ENT_QUOTES, 'UTF-8'); ?></code></li>
      <li>Admin password: <code><?php echo htmlspecialchars($cfg['admin_password'], ENT_QUOTES, 'UTF-8'); ?></code></li>
    </ul>
  </div>
</body>
</html>

