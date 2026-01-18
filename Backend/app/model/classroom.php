<?php
class Classroom {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
    }

    public function getClassroomById($id) {
        $stmt = $this->db->prepare(
            "SELECT c.*, g.grade_number, COUNT(st.student_id) AS student_count
             FROM classroom c
             JOIN grade g ON g.grade_id = c.grade_id
             LEFT JOIN student st ON st.class_id = c.class_id
             WHERE c.class_id = ?
             GROUP BY c.class_id"
        );
        if ($stmt === false) {
            return null;
        }
        $id = (int) $id;
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function getClassroomByTeacherId($teacherId) {
        $stmt = $this->db->prepare(
            "SELECT c.*, g.grade_number, COUNT(st.student_id) AS student_count
             FROM `user` u
             JOIN classroom c ON c.class_id = u.assigned_class_id
             JOIN grade g ON g.grade_id = c.grade_id
             LEFT JOIN student st ON st.class_id = c.class_id
             WHERE u.user_id = ?
             GROUP BY c.class_id"
        );
        if ($stmt === false) {
            return null;
        }

        $teacherId = (int) $teacherId;
        $stmt->bind_param("i", $teacherId);
        if (!$stmt->execute()) {
            return null;
        }

        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function getClassroomsByYearAndGrade($yearLabel, $gradeNumber) {
        $yearLabel = (int) $yearLabel;
        $gradeNumber = (int) $gradeNumber;

        $stmt = $this->db->prepare(
            "SELECT 1 FROM academic_year WHERE year_label = ? LIMIT 1"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $yearLabel);
        if (!$stmt->execute()) {
            return null;
        }
        $yearRes = $stmt->get_result();
        if ($yearRes->num_rows === 0) {
            return null;
        }

        $stmt = $this->db->prepare(
            "SELECT c.*, g.grade_number, COUNT(st.student_id) AS student_count
             FROM classroom c
             JOIN grade g ON g.grade_id = c.grade_id
             LEFT JOIN student st ON st.class_id = c.class_id
             WHERE g.grade_number = ?
             GROUP BY c.class_id
             ORDER BY c.class_name"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $gradeNumber);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getStudentsByClassId($classId) {
        $stmt = $this->db->prepare(
            "SELECT st.*
             FROM student st
             WHERE st.class_id = ?
             ORDER BY st.last_name, st.first_name"
        );
        if ($stmt === false) {
            return [];
        }
        $classId = (int) $classId;
        $stmt->bind_param("i", $classId);
        if (!$stmt->execute()) {
            return [];
        }
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function addClassroom(array $parameters) {
        $gradeId = $parameters["grade_id"] ?? null;
        $className = $parameters["class_name"] ?? null;

        if (!$gradeId || !$className) {
            return null;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO classroom (grade_id, class_name) VALUES (?, ?)"
        );
        if ($stmt === false) {
            return null;
        }

        $gradeId = (int) $gradeId;
        $stmt->bind_param("is", $gradeId, $className);
        if (!$stmt->execute()) {
            return null;
        }

        return $this->db->insert_id;
    }

    public function updateClassroom($id, array $parameters) {
        $fields = [];
        $types = "";
        $values = [];

        if (array_key_exists("grade_id", $parameters)) {
            $fields[] = "grade_id = ?";
            $types .= "i";
            $values[] = (int) $parameters["grade_id"];
        }
        if (array_key_exists("class_name", $parameters)) {
            $fields[] = "class_name = ?";
            $types .= "s";
            $values[] = $parameters["class_name"];
        }

        if (!$fields) {
            return false;
        }

        $sql = "UPDATE classroom SET " . implode(", ", $fields) . " WHERE class_id = ?";
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
