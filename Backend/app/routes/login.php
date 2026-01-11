<?php
require_once __DIR__ . '/../controllers/login.php';
$loginController = new LoginController();

if ($method === "POST" && $url === "/api/login") {

    $loginController->login();
    
    echo json_encode([
        'message' => 'hello'
    ]);
    exit;
}
