<?php 
require_once __DIR__ . '/../model/students.php';

class StudentController {
    private $students;

    public function __construct() {
        $this->students = new Students();
    }

    public function getStudents() {
        $students = $this->students->getStudents();
        
        echo json_encode([
            "message" => "Students retrieved successfully",
            "data" => $students
        ]);
        exit;
    }

    public function getStudentById($id) {
        $student = $this->students->getStudentById($id);

        if (!$student) {
            http_response_code(404);
            echo json_encode(["error" => "Student with id $id not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Student with id $id retrieved successfully",
            "data" => $student
        ]);
        exit;
    }

    public function getStudentByNumber($studentNumber) {
        $student = $this->students->getStudentByNumber($studentNumber);

        if (!$student) {
            http_response_code(404);
            echo json_encode(["error" => "Student with number $studentNumber not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Student with number $studentNumber retrieved successfully",
            "data" => $student
        ]);
        exit;
    }

    public function getStudentsByClassId($classId) {
        $students = $this->students->getStudentsByClassId($classId);

        echo json_encode([
            "message" => "Students in class $classId retrieved successfully",
            "data" => $students
        ]);
        exit;
    }

    public function addStudent() {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($payload["student_number"]) || empty($payload["first_name"]) || empty($payload["last_name"]) || empty($payload["class_id"])) {
            http_response_code(400);
            echo json_encode(["error" => "student_number, first_name, last_name, and class_id are required"]);
            exit;
        }

        $studentId = $this->students->addStudent($payload);
        if (!$studentId) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create student"]);
            exit;
        }

        echo json_encode([
            "message" => "Student created successfully",
            "student_id" => $studentId
        ]);
        exit;
    }

    public function deleteStudent($id) {
        $deleted = $this->students->deleteStudent($id);
        if (!$deleted) {
            http_response_code(404);
            echo json_encode(["error" => "Student with id $id not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Student with id $id deleted successfully"
        ]);
        exit;
    }

    public function updateStudent($id) {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!$payload) {
            http_response_code(400);
            echo json_encode(["error" => "No update data provided"]);
            exit;
        }

        $updated = $this->students->updateStudent($id, $payload);
        if (!$updated) {
            http_response_code(404);
            echo json_encode(["error" => "Student with id $id not found or no changes applied"]);
            exit;
        }

        echo json_encode([
            "message" => "Student with id $id updated successfully"
        ]);
        exit;
    }
}
