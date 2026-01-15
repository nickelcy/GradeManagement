<?php
require_once __DIR__ . '/../controllers/year.php';
require_once __DIR__ . '/../utils/auth.php';

$yearController = new YearController();

if ($method === 'GET' && preg_match('#^/api/years/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $yearController->getYearById($m[1]);
    exit;
}

if ($method === 'POST' && $url === '/api/years') {
    requireAdmin();
    $yearController->addYear();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/years/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $yearController->updateYear($m[1]);
    exit;
}
