<?php
require_once __DIR__ . "/../controllers/students.php";
require_once __DIR__ . '/../utils/auth.php';
$studentController = new StudentController();

if ($method === 'GET' && ($url === '/api/students')){   
    requireAdmin();
    $studentController->getStudents();
    exit;
}   

if ($method === 'GET' && preg_match('#^/api/students/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $studentController->getStudentById($m[1]);
    exit;
}

if ($method === 'GET' && preg_match('#^/api/students/number/([^/]+)/?$#', $url, $m)) {
    requireAdmin();
    $studentController->getStudentByNumber($m[1]);
    exit;
}

if ($method === 'GET' && preg_match('#^/api/students/class/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $studentController->getStudentsByClassId($m[1]);
    exit;
}

if ($method === 'POST' && $url === '/api/students') {
    requireAdmin();
    $studentController->addStudent();
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/students/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $studentController->deleteStudent($m[1]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/students/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $studentController->updateStudent($m[1]);
    exit;
}
