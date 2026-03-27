<?php

const ORDER_STATUSES = [
    'Order Confirmed',
    'Cooking in Kitchen',
    'Rider Picked Up',
    'Rider Near Your Location',
    'Delivered',
];

function normalize_coupon_code($code): string
{
    return strtoupper(trim((string)$code));
}

function calculate_totals(int $subtotal, string $couponCode): array
{
    $packaging = $subtotal > 0 ? 20 : 0;
    $delivery = $subtotal > 0 ? ($subtotal >= 500 ? 0 : 45) : 0;
    $discount = 0;
    $normalizedCode = normalize_coupon_code($couponCode);

    if ($normalizedCode === 'SAVE10') {
        $discount = min((int) round($subtotal * 0.10), 120);
    }
    if ($normalizedCode === 'FREESHIP') {
        $delivery = 0;
    }

    $taxable = max(0, $subtotal - $discount);
    $tax = (int) round($taxable * 0.05);
    $total = $taxable + $packaging + $delivery + $tax;

    return [
        'subtotal' => $subtotal,
        'packaging' => $packaging,
        'delivery' => $delivery,
        'discount' => $discount,
        'tax' => $tax,
        'total' => $total,
        'couponCode' => $normalizedCode !== '' ? $normalizedCode : null,
    ];
}

function eta_from_status(string $status): int
{
    $index = array_search($status, ORDER_STATUSES, true);
    if ($index === false || $index <= 0) {
        return 28;
    }
    if ($index === 1) {
        return 20;
    }
    if ($index === 2) {
        return 12;
    }
    if ($index === 3) {
        return 5;
    }
    return 0;
}

function generate_order_code(): string
{
    return 'CC' . date('ymdHis') . random_int(10, 99);
}

