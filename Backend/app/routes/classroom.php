<?php
require_once __DIR__ . '/../controllers/classroom.php';
require_once __DIR__ . '/../utils/auth.php';

$classroomController = new ClassroomController();

if ($method === 'GET' && preg_match('#^/api/classrooms/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $classroomController->getClassroomById($m[1]);
    exit;
}

if ($method === 'GET' && $url === '/api/classrooms/year-grade') {
    requireAdmin();
    $classroomController->getClassroomsByYearAndGrade();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/classrooms/teacher/(\d+)/?$#', $url, $m)) {
    requireUser();
    $classroomController->getClassroomsByTeacherId($m[1]);
    exit;
}

if ($method === 'GET' && preg_match('#^/api/classrooms/(\d+)/students/?$#', $url, $m)) {
    requireAdmin();
    $classroomController->getStudentsByClassId($m[1]);
    exit;
}

if ($method === 'POST' && $url === '/api/classrooms') {
    requireAdmin();
    $classroomController->addClassroom();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/classrooms/(\d+)/?$#', $url, $m)) {
    requireAdmin();
    $classroomController->updateClassroom($m[1]);
    exit;
}
