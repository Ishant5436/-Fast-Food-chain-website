<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['message' => 'Method not allowed.'], 405);
}

$user = require_auth();
$input = get_json_input();

$customerName = trim((string)($input['customerName'] ?? ''));
$address = trim((string)($input['address'] ?? ''));
$phone = trim((string)($input['phone'] ?? ''));
$paymentMode = trim((string)($input['paymentMode'] ?? 'Cash on Delivery'));
$couponCode = normalize_coupon_code((string)($input['couponCode'] ?? ''));
$itemsInput = is_array($input['items'] ?? null) ? $input['items'] : [];

if ($customerName === '' || $address === '' || $phone === '') {
    send_json(['message' => 'Customer name, address, and phone are required.'], 400);
}
if (!preg_match('/^\d{10}$/', $phone)) {
    send_json(['message' => 'Phone must be a valid 10-digit number.'], 400);
}
if (count($itemsInput) === 0) {
    send_json(['message' => 'At least one cart item is required.'], 400);
}

$pdo = db();
$menuMap = [];
$ids = [];
foreach ($itemsInput as $rawItem) {
    if (is_string($rawItem) || is_numeric($rawItem)) {
        $rawItem = ['menuItemId' => (string)$rawItem, 'quantity' => 1];
    }
    if (!is_array($rawItem)) {
        continue;
    }
    $id = trim((string)($rawItem['menuItemId'] ?? $rawItem['id'] ?? $rawItem['productId'] ?? ''));
    if ($id !== '') {
        $ids[$id] = true;
    }
}

$menuIds = array_keys($ids);
if (count($menuIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($menuIds), '?'));
    $stmt = $pdo->prepare("
        SELECT id, name, price
        FROM menu_items
        WHERE active = 1 AND id IN ($placeholders)
    ");
    $stmt->execute($menuIds);
    $menuRows = $stmt->fetchAll();

    if (count($menuRows) !== count($menuIds)) {
        send_json(['message' => 'One or more menu items are unavailable.'], 400);
    }

    foreach ($menuRows as $row) {
        $menuMap[$row['id']] = $row;
    }
}

// Accept both the current payload (menuItemId) and the legacy checkout payload
// (name + unitPrice/price) so older pages can still place orders successfully.
$merged = [];
foreach ($itemsInput as $rawItem) {
    if (is_string($rawItem) || is_numeric($rawItem)) {
        $rawItem = ['menuItemId' => (string)$rawItem, 'quantity' => 1];
    }
    if (!is_array($rawItem)) {
        continue;
    }
    $menuItemId = trim((string)($rawItem['menuItemId'] ?? $rawItem['id'] ?? $rawItem['productId'] ?? ''));
    $quantity = (int)($rawItem['quantity'] ?? $rawItem['qty'] ?? 1);
    if ($quantity < 1 || $quantity > 20) {
        send_json(['message' => 'Quantity must be between 1 and 20.'], 400);
    }

    if ($menuItemId !== '') {
        if (!isset($menuMap[$menuItemId])) {
            send_json(['message' => 'Invalid menu item: ' . $menuItemId], 400);
        }

        $mergeKey = 'menu:' . $menuItemId;
        if (!isset($merged[$mergeKey])) {
            $merged[$mergeKey] = [
                'menuItemId' => $menuItemId,
                'name' => $menuMap[$menuItemId]['name'],
                'unitPrice' => (int)$menuMap[$menuItemId]['price'],
                'quantity' => 0,
            ];
        }
        $merged[$mergeKey]['quantity'] += $quantity;
        if ($merged[$mergeKey]['quantity'] > 20) {
            send_json(['message' => 'Combined quantity for an item cannot exceed 20.'], 400);
        }
        continue;
    }

    $legacyName = trim((string)($rawItem['name'] ?? $rawItem['itemName'] ?? $rawItem['title'] ?? $rawItem['productName'] ?? ''));
    $legacyPrice = (int)($rawItem['unitPrice'] ?? $rawItem['price'] ?? 0);
    if ($legacyName === '') {
        continue;
    }
    if ($legacyPrice < 0) {
        send_json(['message' => 'Item price cannot be negative.'], 400);
    }

    $mergeKey = 'legacy:' . strtolower($legacyName) . ':' . $legacyPrice;
    if (!isset($merged[$mergeKey])) {
        $merged[$mergeKey] = [
            'menuItemId' => 'legacy_' . substr(sha1($legacyName . '|' . $legacyPrice), 0, 12),
            'name' => $legacyName,
            'unitPrice' => $legacyPrice,
            'quantity' => 0,
        ];
    }
    $merged[$mergeKey]['quantity'] += $quantity;
    if ($merged[$mergeKey]['quantity'] > 20) {
        send_json(['message' => 'Combined quantity for an item cannot exceed 20.'], 400);
    }
}

$lineItems = [];
$subtotal = 0;
foreach ($merged as $item) {
    $unitPrice = (int)$item['unitPrice'];
    $lineItems[] = [
        'menuItemId' => $item['menuItemId'],
        'name' => $item['name'],
        'unitPrice' => $unitPrice,
        'quantity' => (int)$item['quantity'],
    ];
    $subtotal += $unitPrice * (int)$item['quantity'];
}

if (count($lineItems) === 0) {
    send_json(['message' => 'At least one valid cart item is required.'], 400);
}

$totals = calculate_totals($subtotal, $couponCode);
$orderCode = generate_order_code();

try {
    $pdo->beginTransaction();

    $insertOrder = $pdo->prepare('
        INSERT INTO orders (
            order_code,
            user_id,
            customer_name,
            address,
            phone,
            payment_mode,
            subtotal,
            packaging,
            delivery,
            discount,
            tax,
            total,
            coupon_code,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $insertOrder->execute([
        $orderCode,
        (int)$user['id'],
        $customerName,
        $address,
        $phone,
        $paymentMode,
        $totals['subtotal'],
        $totals['packaging'],
        $totals['delivery'],
        $totals['discount'],
        $totals['tax'],
        $totals['total'],
        $totals['couponCode'],
        ORDER_STATUSES[0],
    ]);

    $orderId = (int)$pdo->lastInsertId();
    $insertItem = $pdo->prepare('
        INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity)
        VALUES (?, ?, ?, ?, ?)
    ');
    foreach ($lineItems as $item) {
        $insertItem->execute([
            $orderId,
            $item['menuItemId'],
            $item['name'],
            $item['unitPrice'],
            $item['quantity'],
        ]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json(['message' => 'Failed to place order.', 'error' => $e->getMessage()], 500);
}

send_json([
    'message' => 'Order placed successfully.',
    'order' => [
        'orderCode' => $orderCode,
        'status' => ORDER_STATUSES[0],
        'etaMinutes' => 28,
        'subtotal' => $totals['subtotal'],
        'packaging' => $totals['packaging'],
        'delivery' => $totals['delivery'],
        'discount' => $totals['discount'],
        'tax' => $totals['tax'],
        'total' => $totals['total'],
        'couponCode' => $totals['couponCode'],
    ],
], 201);
