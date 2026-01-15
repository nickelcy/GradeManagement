<?php
require_once __DIR__ . "/../controllers/score.php";
require_once __DIR__ . '/../utils/auth.php';
$scoreController = new ScoreController();

if ($method === 'GET' && preg_match('#^/api/students/(\d+)/scores/(\d{4})/?$#', $url, $m)) {
    requireUser();
    $scoreController->getStudentScoresByYear($m[1], $m[2]);
    exit;
}   

if ($method === 'GET' && preg_match('#^/api/classes/(\d+)/terms/(\d+)/scores/?$#', $url, $m)) {
    requireUser();
    $scoreController->getClassScoresByTerm($m[1], $m[2]);
    exit;
}

if ($method === 'POST' && preg_match('#^/api/students/(\d+)/scores/(\d{4})/terms/(\d+)/?$#', $url, $m)) {
    $auth = requireUser();
    $scoreController->addStudentScoresByTermAndYear($m[1], $m[2], $m[3], $auth["user_id"]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/students/(\d+)/scores/(\d{4})/terms/(\d+)/?$#', $url, $m)) {
    $auth = requireUser();
    $scoreController->updateStudentScoresByTermAndYear($m[1], $m[2], $m[3], $auth["user_id"]);
    exit;
}
