<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['status' => 'error', 'message' => 'Method not allowed.'], 405);
}

$data = get_json_input();
$name = trim((string)($data['name'] ?? ''));
$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    send_json(['status' => 'error', 'message' => 'Name, email, and password are required.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['status' => 'error', 'message' => 'Please enter a valid email address.'], 400);
}

$pdo = db();
$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch()) {
    send_json(['status' => 'error', 'message' => 'User already exists.'], 409);
}

$insert = $pdo->prepare('
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, "user")
');
$insert->execute([
    $name,
    $email,
    password_hash($password, PASSWORD_DEFAULT),
]);

send_json([
    'status' => 'success',
    'message' => 'Registration successful.',
], 201);
