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
            "message" => "Users retrieved successfully",
            "data" => $students
        ]);
        exit;
    }
    // public function getStaffByUid($id) {
    //     $staff = $this->users->getStaffByUid($id);

    //     if (!$staff) {
    //         http_response_code(404);
    //         echo json_encode(["error" => "User with id $id not found"]);
    //         exit;
    //     }
        
    //     echo json_encode([
    //         "message" => "User with id $id retrieved successfully",
    //         "data" => $staff
    //     ]);
    //     exit;
    // }    
    // public function getStaffBySid($id) {
    //     $staff = $this->users->getStaffBySid($id);

    //     if (!$staff) {
    //         http_response_code(404);
    //         echo json_encode(["error" => "User with staff-id $id not found"]);
    //         exit;
    //     }
        
    //     echo json_encode([
    //         "message" => "User with Staff-id $id retrieved successfully",
    //         "data" => $staff
    //     ]);
    //     exit;
    // }
    // public function addStaff() {
    //     $payload = json_decode(file_get_contents('php://input'), true) ?? [];

    //     if (empty($payload["staff_id"]) || empty($payload["role_id"]) || empty($payload["password"])) {
    //         http_response_code(400);
    //         echo json_encode(["error" => "staff_id, role_id, and password are required"]);
    //         exit;
    //     }

    //     $userId = $this->users->addStaff($payload);
    //     if (!$userId) {
    //         http_response_code(500);
    //         echo json_encode(["error" => "Failed to create user"]);
    //         exit;
    //     }

    //     echo json_encode([
    //         "message" => "User created successfully",
    //         "user_id" => $userId
    //     ]);
    //     exit;
    // }

    // public function deleteStaff($id) {
    //     $deleted = $this->users->deleteStaff($id);
    //     if (!$deleted) {
    //         http_response_code(404);
    //         echo json_encode(["error" => "User with id $id not found"]);
    //         exit;
    //     }

    //     echo json_encode([
    //         "message" => "User with id $id deleted successfully"
    //     ]);
    //     exit;
    // }

    // public function updateStaff($id) {
    //     $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    //     if (!$payload) {
    //         http_response_code(400);
    //         echo json_encode(["error" => "No update data provided"]);
    //         exit;
    //     }

    //     $updated = $this->users->updateStaff($id, $payload);
    //     if (!$updated) {
    //         http_response_code(404);
    //         echo json_encode(["error" => "User with id $id not found or no changes applied"]);
    //         exit;
    //     }

    //     echo json_encode([
    //         "message" => "User with id $id updated successfully"
    //     ]);
    //     exit;
    // }
}
