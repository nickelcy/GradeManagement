<?php
require_once __DIR__ . "/../controllers/score.php";
require_once __DIR__ . '/../utils/auth.php';
$scoreController = new ScoreController();

if ($method === 'GET' && preg_match('#^/api/students/scores/?$#', $url)) {
    requireUser();
    $studentId = $_GET["student"] ?? null;
    $year = $_GET["year"] ?? null;
    if ($studentId === null || $year === null) {
        http_response_code(400);
        echo json_encode(["error" => "student and year are required"]);
        exit;
    }
    $scoreController->getStudentScoresByYear($studentId, $year);
    exit;
}

if ($method === 'GET' && preg_match('#^/api/classes/scores/?$#', $url)) {
    requireUser();
    $classId = $_GET["class"] ?? null;
    $year = $_GET["year"] ?? null;
    $termNumber = $_GET["term"] ?? null;
    if ($classId === null || $year === null || $termNumber === null) {
        http_response_code(400);
        echo json_encode(["error" => "class, year, and term are required"]);
        exit;
    }
    $scoreController->getClassScoresByTerm($classId, $year, $termNumber);
    exit;
}

if ($method === 'POST' && preg_match('#^/api/students/(\d+)/scores/(\d{4})/terms/(\d+)/?$#', $url, $m)) {
    $auth = requireUser();
    $scoreController->addStudentScoresByTermAndYear($m[1], $m[2], $m[3], $auth["user_id"]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/students/scores/?$#', $url)) {
    $auth = requireUser();
    $studentId = $_GET["student"] ?? null;
    $year = $_GET["year"] ?? null;
    $term = $_GET["term"] ?? null;
    if ($studentId === null || $year === null || $term === null) {
        http_response_code(400);
        echo json_encode(["error" => "student, year, and term are required"]);
        exit;
    }
    $scoreController->updateStudentScoresByTermAndYear($studentId, $year, $term, $auth["user_id"]);
    exit;
}
