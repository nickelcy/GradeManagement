<?php
require_once __DIR__ . '/../controllers/main.php';
require_once __DIR__ . '/../controllers/login.php';
require_once __DIR__ . '/../model/database.php';
require_once __DIR__ . '/../utils/auth.php';
$mainController = new MainController();
$db = new Database();

if ($method === 'GET' && $url === '/api') {
    try {
        $db->initialize();
    } catch (Exception $e) {
        error_log("Database initialization error: " . $e->getMessage());
    }
    echo json_encode([
        "message" => "Welcome to the Grade Management System API.",
        "note" => "Connection initialized! Login & check status.",
        "status" => "https://localhost:8001/api/status.",
      ]);
    exit;
}
if ($method === 'GET' && $url === '/api/status') {
    requireAdmin();
    echo json_encode([
        "message" => "Welcome to the Grade Management System API",
        "api_version" => "1.0.0",
        "Server" => "ok",
        "timestamp" => date('M d, Y h:i A', time()),
        "database" => $mainController->getDatabaseStatus(),
        "database_type" => $mainController->getDatabaseType(),
        "database_version" => $mainController->getDatabaseVersion(),
        "database_host" => $mainController->getDatabaseHost()
      ]);
    exit;
}      
if ($method === 'POST' && $url === '/api/reset-database') {
    requireAdmin();
    $mainController->resetDatabase();
    echo json_encode([
        "message" => "Database reset successfully",
    ]);
    exit;
}
if ($method === 'POST' && $url === '/api/update-database-schema') {
    requireAdmin();
    $mainController->updateDatabaseSchema();
    echo json_encode([
        "message" => "Database schema updated successfully",
    ]);
    exit;
}
if ($method === 'POST' && $url === '/api/seed-database') {
    requireAdmin();
    $mainController->seedDatabase();
    echo json_encode([
        "message" => "Database seeded successfully",
    ]);
    exit;
}
