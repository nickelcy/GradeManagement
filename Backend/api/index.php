<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();


// require_once __DIR__ . '/../app/model/database.php';

// try {
//     $db = new Database();
//     $db->ensureInitialized();
// } catch (Exception $e) {
//     error_log("Database initialization error: " . $e->getMessage());
// }

$method = $_SERVER['REQUEST_METHOD'];
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
