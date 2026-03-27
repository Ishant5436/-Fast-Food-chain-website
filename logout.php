<?php

require_once __DIR__ . '/../../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['message' => 'Method not allowed.'], 405);
}

clear_session_user();
send_json(['message' => 'Logged out.']);

