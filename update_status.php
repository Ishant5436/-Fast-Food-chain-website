<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['message' => 'Method not allowed.'], 405);
}

require_admin();
$input = get_json_input();

$orderCode = trim((string)($input['orderCode'] ?? ''));
$status = trim((string)($input['status'] ?? ''));

if ($orderCode === '' || $status === '') {
    send_json(['message' => 'orderCode and status are required.'], 400);
}
if (!in_array($status, ORDER_STATUSES, true)) {
    send_json(['message' => 'Invalid status value.'], 400);
}

$pdo = db();
$checkStmt = $pdo->prepare('SELECT id FROM orders WHERE order_code = ? LIMIT 1');
$checkStmt->execute([$orderCode]);
$order = $checkStmt->fetch();
if (!$order) {
    send_json(['message' => 'Order not found.'], 404);
}

$updateStmt = $pdo->prepare('
    UPDATE orders
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE order_code = ?
');
$updateStmt->execute([$status, $orderCode]);

send_json([
    'message' => 'Order status updated.',
    'orderCode' => $orderCode,
    'status' => $status,
]);

