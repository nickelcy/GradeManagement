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
}