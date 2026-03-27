<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

$user = current_user();
send_json([
    'authenticated' => $user !== null,
    'user' => $user,
]);

