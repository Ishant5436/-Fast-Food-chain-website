<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

require_admin();
$pdo = db();

$orders = $pdo->query('
    SELECT
        o.id,
        o.order_code AS orderCode,
        o.status,
        o.total,
        o.created_at AS createdAt,
        o.customer_name AS customerName,
        o.address,
        o.phone,
        o.payment_mode AS paymentMode,
        o.coupon_code AS couponCode,
        u.name AS userName,
        u.email AS userEmail
    FROM orders o
    JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC, o.id DESC
')->fetchAll();

$itemStmt = $pdo->prepare('
    SELECT item_name AS name, quantity, unit_price AS unitPrice
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
');

$result = [];
foreach ($orders as $order) {
    $itemStmt->execute([(int)$order['id']]);
    $items = $itemStmt->fetchAll();

    $result[] = [
        'orderCode' => $order['orderCode'],
        'status' => $order['status'],
        'total' => (int)$order['total'],
        'createdAt' => $order['createdAt'],
        'customerName' => $order['customerName'],
        'address' => $order['address'],
        'phone' => $order['phone'],
        'paymentMode' => $order['paymentMode'],
        'couponCode' => $order['couponCode'],
        'userName' => $order['userName'],
        'userEmail' => $order['userEmail'],
        'items' => array_map(function ($item) {
            return [
                'name' => $item['name'],
                'quantity' => (int)$item['quantity'],
                'unitPrice' => (int)$item['unitPrice'],
            ];
        }, $items),
    ];
}

send_json([
    'orders' => $result,
    'statuses' => ORDER_STATUSES,
]);

