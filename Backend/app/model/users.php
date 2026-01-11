<?php
class Users {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
    }
    public function getStaff() {
        $sql = "SELECT * FROM `user`";
        $result = $this->db->query($sql);
        if ($result === false) {
            return [];
        }
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    public function getStaffByUid($id) {
        $stmt = $this->db->prepare("SELECT * FROM `user` WHERE user_id = ?");
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
    public function getStaffBySid($id) {
        $stmt = $this->db->prepare("SELECT * FROM `user` WHERE staff_id = ?");
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("s", $id);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    public function addStaff(array $parameters) {
        $staffId = $parameters["staff_id"] ?? null;
        $password = $parameters["password"] ?? null;
        $firstName = $parameters["first_name"] ?? null;
        $lastName = $parameters["last_name"] ?? null;
        $roleId = $parameters["role_id"] ?? null;
        $assignedClassId = $parameters["assigned_class_id"] ?? null;
        $isActive = $parameters["is_active"] ?? 1;

        if (!$staffId || !$password || !$roleId) {
            return null;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare(
            "INSERT INTO `user` (staff_id, password_hash, first_name, last_name, role_id, assigned_class_id, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        if ($stmt === false) {
            return null;
        }

        $roleId = (int) $roleId;
        $assignedClassId = $assignedClassId !== null ? (int) $assignedClassId : null;
        $isActive = (int) (bool) $isActive;
        $stmt->bind_param(
            "ssssiii",
            $staffId,
            $passwordHash,
            $firstName,
            $lastName,
            $roleId,
            $assignedClassId,
            $isActive
        );
        if (!$stmt->execute()) {
            return null;
        }

        return $this->db->insert_id;
    }    
    public function deleteStaff($id) {
        $stmt = $this->db->prepare("DELETE FROM `user` WHERE user_id = ?");
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

    public function updateStaff($id, array $parameters) {
        $fields = [];
        $types = "";
        $values = [];

        if (array_key_exists("staff_id", $parameters)) {
            $fields[] = "staff_id = ?";
            $types .= "s";
            $values[] = $parameters["staff_id"];
        }
        if (array_key_exists("password", $parameters)) {
            $fields[] = "password_hash = ?";
            $types .= "s";
            $values[] = password_hash($parameters["password"], PASSWORD_BCRYPT);
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
        if (array_key_exists("role_id", $parameters)) {
            $fields[] = "role_id = ?";
            $types .= "i";
            $values[] = (int) $parameters["role_id"];
        }
        if (array_key_exists("assigned_class_id", $parameters)) {
            $fields[] = "assigned_class_id = ?";
            $types .= "i";
            $values[] = $parameters["assigned_class_id"] === null ? null : (int) $parameters["assigned_class_id"];
        }
        if (array_key_exists("is_active", $parameters)) {
            $fields[] = "is_active = ?";
            $types .= "i";
            $values[] = (int) (bool) $parameters["is_active"];
        }

        if (!$fields) {
            return false;
        }

        // Check if new staffid is available

        $sql = "UPDATE `user` SET " . implode(", ", $fields) . " WHERE user_id = ?";
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
