<?php
require_once __DIR__ . '/../controllers/report.php';
require_once __DIR__ . '/../utils/auth.php';

$reportController = new ReportController();

if ($method === 'GET' && preg_match('#^/api/reports/student$#', $url)) {
    $auth = requireUser();
    $reportController->getStudentReport();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/reports/subject$#', $url)) {
    $auth = requireUser();
    $reportController->getSubjectReport();
    exit;
}
