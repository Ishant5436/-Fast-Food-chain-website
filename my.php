<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

$user = require_auth();
$pdo = db();

$ordersStmt = $pdo->prepare('
    SELECT
        id,
        order_code AS orderCode,
        status,
        subtotal,
        packaging,
        delivery,
        discount,
        tax,
        total,
        coupon_code AS couponCode,
        payment_mode AS paymentMode,
        customer_name AS customerName,
        address,
        phone,
        created_at AS createdAt
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
');
$ordersStmt->execute([(int)$user['id']]);
$orders = $ordersStmt->fetchAll();

$itemStmt = $pdo->prepare('
    SELECT
        menu_item_id AS menuItemId,
        item_name AS name,
        unit_price AS unitPrice,
        quantity
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
        'subtotal' => (int)$order['subtotal'],
        'packaging' => (int)$order['packaging'],
        'delivery' => (int)$order['delivery'],
        'discount' => (int)$order['discount'],
        'tax' => (int)$order['tax'],
        'total' => (int)$order['total'],
        'couponCode' => $order['couponCode'],
        'paymentMode' => $order['paymentMode'],
        'customerName' => $order['customerName'],
        'address' => $order['address'],
        'phone' => $order['phone'],
        'createdAt' => $order['createdAt'],
        'etaMinutes' => eta_from_status($order['status']),
        'items' => array_map(function ($item) {
            return [
                'menuItemId' => $item['menuItemId'],
                'name' => $item['name'],
                'unitPrice' => (int)$item['unitPrice'],
                'quantity' => (int)$item['quantity'],
            ];
        }, $items),
    ];
}

send_json(['orders' => $result]);

