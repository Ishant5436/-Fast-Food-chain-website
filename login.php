<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['status' => 'error', 'message' => 'Method not allowed.'], 405);
}

$data = get_json_input();
$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    send_json(['status' => 'error', 'message' => 'Email and password are required.'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = ?
    LIMIT 1
');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    send_json(['status' => 'error', 'message' => 'Invalid email or password.'], 401);
}

set_session_user($user);

send_json([
    'status' => 'success',
    'message' => 'Login successful.',
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
