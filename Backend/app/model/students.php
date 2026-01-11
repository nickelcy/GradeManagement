<?php
class Students {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
    }
    public function getStudents() {
        $sql = "SELECT * FROM `student`";
        $result = $this->db->query($sql);
        if ($result === false) {
            return [];
        }
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getStudentById($id) {
        $stmt = $this->db->prepare("SELECT * FROM `student` WHERE student_id = ?");
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function getStudentByNumber($studentNumber) {
        $stmt = $this->db->prepare("SELECT * FROM `student` WHERE student_number = ?");
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("s", $studentNumber);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function getStudentsByClassId($classId) {
        $stmt = $this->db->prepare("SELECT * FROM `student` WHERE class_id = ?");
        if ($stmt === false) {
            return [];
        }
        $stmt->bind_param("i", $classId);
        if (!$stmt->execute()) {
            return [];
        }
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function addStudent(array $parameters) {
        $studentNumber = $parameters["student_number"] ?? null;
        $firstName = $parameters["first_name"] ?? null;
        $lastName = $parameters["last_name"] ?? null;
        $classId = $parameters["class_id"] ?? null;
        $isActive = $parameters["is_active"] ?? 1;

        if (!$studentNumber || !$firstName || !$lastName || !$classId) {
            return null;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO `student` (student_number, first_name, last_name, class_id, is_active)
             VALUES (?, ?, ?, ?, ?)"
        );
        if ($stmt === false) {
            return null;
        }

        $classId = (int) $classId;
        $isActive = (int) (bool) $isActive;
        $stmt->bind_param("sssii", $studentNumber, $firstName, $lastName, $classId, $isActive);
        if (!$stmt->execute()) {
            return null;
        }

        return $this->db->insert_id;
    }

    public function deleteStudent($id) {
        $stmt = $this->db->prepare("UPDATE `student` SET is_active = 0 WHERE student_id = ?");
        if ($stmt === false) {
            return false;
        }
        $id = (int) $id;
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            return false;
        }
        return $stmt->affected_rows > 0;
    }

    public function updateStudent($id, array $parameters) {
        $fields = [];
        $types = "";
        $values = [];

        if (array_key_exists("student_number", $parameters)) {
            $fields[] = "student_number = ?";
            $types .= "s";
            $values[] = $parameters["student_number"];
        }
        if (array_key_exists("first_name", $parameters)) {
            $fields[] = "first_name = ?";
            $types .= "s";
            $values[] = $parameters["first_name"];
        }
        if (array_key_exists("last_name", $parameters)) {
            $fields[] = "last_name = ?";
            $types .= "s";
            $values[] = $parameters["last_name"];
        }
        if (array_key_exists("class_id", $parameters)) {
            $fields[] = "class_id = ?";
            $types .= "i";
            $values[] = (int) $parameters["class_id"];
        }
        if (array_key_exists("is_active", $parameters)) {
            $fields[] = "is_active = ?";
            $types .= "i";
            $values[] = (int) (bool) $parameters["is_active"];
        }

        if (!$fields) {
            return false;
        }

        $sql = "UPDATE `student` SET " . implode(", ", $fields) . " WHERE student_id = ?";
        $stmt = $this->db->prepare($sql);
        if ($stmt === false) {
            return false;
        }

        $types .= "i";
        $values[] = (int) $id;
        $stmt->bind_param($types, ...$values);
        if (!$stmt->execute()) {
            return false;
        }

        return $stmt->affected_rows > 0;
    }
}
