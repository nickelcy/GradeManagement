<?php
class Year {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
    }

    public function getYearById($id) {
        $stmt = $this->db->prepare("SELECT * FROM academic_year WHERE academic_year_id = ?");
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

    public function addYear(array $parameters) {
        $yearLabel = $parameters["year_label"] ?? null;
        $startDate = $parameters["start_date"] ?? null;
        $endDate = $parameters["end_date"] ?? null;
        $isActive = $parameters["is_active"] ?? 0;

        if ($yearLabel === null || $startDate === null || $endDate === null) {
            return null;
        }

        $this->db->begin_transaction();

        $stmt = $this->db->prepare(
            "INSERT INTO academic_year (year_label, start_date, end_date, is_active)
             VALUES (?, ?, ?, ?)"
        );
        if ($stmt === false) {
            $this->db->rollback();
            return null;
        }

        $yearLabel = (int) $yearLabel;
        $isActive = (int) (bool) $isActive;
        $stmt->bind_param("issi", $yearLabel, $startDate, $endDate, $isActive);
        if (!$stmt->execute()) {
            $this->db->rollback();
            return null;
        }

        $yearId = $this->db->insert_id;

        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $totalDays = (int) $start->diff($end)->days + 1;
        if ($totalDays < 3) {
            $this->db->rollback();
            return null;
        }

        $baseLength = intdiv($totalDays, 3);
        $remainder = $totalDays % 3;
        $lengths = [
            $baseLength + ($remainder > 0 ? 1 : 0),
            $baseLength + ($remainder > 1 ? 1 : 0),
            $totalDays - ($baseLength + ($remainder > 0 ? 1 : 0)) - ($baseLength + ($remainder > 1 ? 1 : 0)),
        ];

        $termStmt = $this->db->prepare(
            "INSERT INTO term (academic_year_id, term_number, start_date, end_date)
             VALUES (?, ?, ?, ?)"
        );
        if ($termStmt === false) {
            $this->db->rollback();
            return null;
        }

        $currentStart = clone $start;
        for ($termNumber = 1; $termNumber <= 3; $termNumber++) {
            $length = $lengths[$termNumber - 1];
            $currentEnd = (clone $currentStart)->modify('+' . ($length - 1) . ' days');
            $startValue = $currentStart->format('Y-m-d');
            $endValue = $currentEnd->format('Y-m-d');
            $termStmt->bind_param("iiss", $yearId, $termNumber, $startValue, $endValue);
            if (!$termStmt->execute()) {
                $this->db->rollback();
                return null;
            }
            $currentStart = (clone $currentEnd)->modify('+1 day');
        }

        $this->db->commit();
        return $yearId;
    }

    public function getYears() {
        $stmt = $this->db->prepare(
            "SELECT * FROM academic_year ORDER BY start_date DESC"
        );
        if ($stmt === false) {
            return null;
        }
        if (!$stmt->execute()) {
            return null;
        }
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function updateYear($id, array $parameters) {
        $fields = [];
        $types = "";
        $values = [];

        if (array_key_exists("year_label", $parameters)) {
            $fields[] = "year_label = ?";
            $types .= "i";
            $values[] = (int) $parameters["year_label"];
        }
        if (array_key_exists("start_date", $parameters)) {
            $fields[] = "start_date = ?";
            $types .= "s";
            $values[] = $parameters["start_date"];
        }
        if (array_key_exists("end_date", $parameters)) {
            $fields[] = "end_date = ?";
            $types .= "s";
            $values[] = $parameters["end_date"];
        }
        if (array_key_exists("is_active", $parameters)) {
            $fields[] = "is_active = ?";
            $types .= "i";
            $values[] = (int) (bool) $parameters["is_active"];
        }

        if (!$fields) {
            return false;
        }

        $sql = "UPDATE academic_year SET " . implode(", ", $fields) . " WHERE academic_year_id = ?";
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
