<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

$pdo = db();
$stmt = $pdo->query('
    SELECT
        id,
        name,
        category,
        cafe,
        rating,
        eta_minutes AS etaMinutes,
        price,
        badge
    FROM menu_items
    WHERE active = 1
    ORDER BY category ASC, name ASC
');

send_json(['items' => $stmt->fetchAll()]);

