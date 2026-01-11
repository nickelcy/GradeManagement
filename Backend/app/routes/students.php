<?php
require_once __DIR__ . "/../controllers/students.php";
require_once __DIR__ . '/../utils/auth.php';
$studentController = new StudentController();

if ($method === 'GET' && ($url === '/api/students')){   
    requireAdmin();
    $studentController->getStudents();
    exit;
}   

// if ($method === 'GET' && preg_match('#^/api/users/(\d+)/?$#', $url, $m)) {
//     requireAdmin();
//     $usersController->getStaffByUid($m[1]);
//     exit;
// }

// if ($method === 'GET' && preg_match('#^/api/staff/([^/]+)/?$#', $url, $m)) {
//     requireAdmin();
//     $usersController->getStaffBySid($m[1]);
//     exit;
// }

// if ($method === 'POST' && ($url === '/api/users' || $url === '/api/staff')) {
//     requireAdmin();
//     $usersController->addStaff();
//     exit;
// }

// if ($method === 'DELETE' && preg_match('#^/api/users/(\d+)/?$#', $url, $m)) {
//     requireAdmin();
//     $usersController->deleteStaff($m[1]);
//     exit;
// }

// if ($method === 'PUT' && preg_match('#^/api/users/(\d+)/?$#', $url, $m)) {
//     requireAdmin();
//     $usersController->updateStaff($m[1]);
//     exit;
// }