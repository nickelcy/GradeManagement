<?php
require_once __DIR__ . '/../controllers/login.php';

function requireUser() {
    return LoginController::verifyToken();
}

function requireAdmin() {
    $auth = requireUser();
    if ((int) $auth["role_id"] !== 1) {
        http_response_code(403);
        echo json_encode([
            "message" => "forbidden: Not an admin user",
            "auth" => $auth
        ]);
        exit;
    }
    return $auth;
}
