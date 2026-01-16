<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$frontendUrl = $_ENV['FRONTEND_URL'] ?? '*';
header("Access-Control-Allow-Origin: {$frontendUrl}");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
$url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

require_once __DIR__ . '/../app/routes/main.php';
require_once __DIR__ . '/../app/routes/users.php';
require_once __DIR__ . '/../app/routes/login.php';
require_once __DIR__ . '/../app/routes/students.php';
require_once __DIR__ . '/../app/routes/score.php';
require_once __DIR__ . '/../app/routes/report.php';
require_once __DIR__ . '/../app/routes/year.php';
require_once __DIR__ . '/../app/routes/classroom.php';

http_response_code(404);
echo json_encode([
    'error' => '404 Not Found'
]);
