<?php
require_once __DIR__ . '/../model/classroom.php';

class ClassroomController {
    private $classroom;

    public function __construct() {
        $this->classroom = new Classroom();
    }

    public function getClassroomById($id) {
        $classroom = $this->classroom->getClassroomById($id);
        if (!$classroom) {
            http_response_code(404);
            echo json_encode(["error" => "Classroom with id $id not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Classroom with id $id retrieved successfully",
            "data" => $classroom
        ]);
        exit;
    }

    public function getClassroomsByTeacherId($teacherId) {
        $classroom = $this->classroom->getClassroomByTeacherId($teacherId);
        if (!$classroom) {
            http_response_code(404);
            echo json_encode(["error" => "Classroom for teacher $teacherId not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Classroom for teacher $teacherId retrieved successfully",
            "data" => $classroom
        ]);
        exit;
    }

    public function getClassroomsByYearAndGrade() {
        $year = $_GET["year"] ?? null;
        $grade = $_GET["grade"] ?? null;

        if ($year === null || $grade === null) {
            http_response_code(400);
            echo json_encode(["error" => "year and grade are required"]);
            exit;
        }

        $classrooms = $this->classroom->getClassroomsByYearAndGrade($year, $grade);
        if ($classrooms === null) {
            http_response_code(404);
            echo json_encode(["error" => "Academic year $year not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Classrooms retrieved successfully",
            "data" => $classrooms
        ]);
        exit;
    }

    public function getStudentsByClassId($id) {
        $students = $this->classroom->getStudentsByClassId($id);

        echo json_encode([
            "message" => "Students in class $id retrieved successfully",
            "data" => $students
        ]);
        exit;
    }

    public function addClassroom() {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($payload["grade_id"]) || empty($payload["class_name"])) {
            http_response_code(400);
            echo json_encode(["error" => "grade_id and class_name are required"]);
            exit;
        }

        $classId = $this->classroom->addClassroom($payload);
        if (!$classId) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create classroom"]);
            exit;
        }

        echo json_encode([
            "message" => "Classroom created successfully",
            "class_id" => $classId
        ]);
        exit;
    }

    public function updateClassroom($id) {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!$payload) {
            http_response_code(400);
            echo json_encode(["error" => "No update data provided"]);
            exit;
        }

        $updated = $this->classroom->updateClassroom($id, $payload);
        if (!$updated) {
            http_response_code(404);
            echo json_encode(["error" => "Classroom with id $id not found or no changes applied"]);
            exit;
        }

        echo json_encode([
            "message" => "Classroom with id $id updated successfully"
        ]);
        exit;
    }
}
