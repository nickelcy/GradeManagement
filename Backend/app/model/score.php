<?php
class Score {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
    }

    public function getStudentScoresByYear($studentId, $yearLabel) {
        $stmt = $this->db->prepare(
            "SELECT
                s.score_id,
                s.student_id,
                s.subject_id,
                sub.subject_name,
                s.term_id,
                t.term_number,
                ay.year_label,
                s.teacher_user_id,
                s.score_value,
                s.recorded_at
            FROM score s
            JOIN term t ON t.term_id = s.term_id
            JOIN academic_year ay ON ay.academic_year_id = t.academic_year_id
            JOIN subject sub ON sub.subject_id = s.subject_id
            WHERE s.student_id = ? AND ay.year_label = ?
            ORDER BY t.term_number, sub.subject_name"
        );
        if ($stmt === false) {
            return null;
        }

        $studentId = (int) $studentId;
        $yearLabel = (int) $yearLabel;
        $stmt->bind_param("ii", $studentId, $yearLabel);
        if (!$stmt->execute()) {
            return null;
        }

        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getClassScoresByTerm($classId, $yearLabel, $termNumber) {
        $classId = (int) $classId;
        $yearLabel = (int) $yearLabel;
        $termNumber = (int) $termNumber;

        $stmt = $this->db->prepare(
            "SELECT t.term_id, t.term_number, ay.year_label
             FROM term t
             JOIN academic_year ay ON ay.academic_year_id = t.academic_year_id
             WHERE ay.year_label = ? AND t.term_number = ?"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("ii", $yearLabel, $termNumber);
        if (!$stmt->execute()) {
            return null;
        }
        $termRow = $stmt->get_result()->fetch_assoc();
        if (!$termRow) {
            return null;
        }

        $stmt = $this->db->prepare(
            "SELECT grade_id FROM classroom WHERE class_id = ?"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $classId);
        if (!$stmt->execute()) {
            return null;
        }
        $gradeResult = $stmt->get_result();
        $gradeRow = $gradeResult->fetch_assoc();
        if (!$gradeRow) {
            return [];
        }
        $gradeId = (int) $gradeRow["grade_id"];

        $stmt = $this->db->prepare(
            "SELECT subject_id, subject_name
             FROM subject
             WHERE grade_id = ?
             ORDER BY subject_name"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $gradeId);
        if (!$stmt->execute()) {
            return null;
        }
        $subjects = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $subjectNames = array_map(fn($row) => $row["subject_name"], $subjects);

        $stmt = $this->db->prepare(
            "SELECT student_id, student_number, first_name, last_name
             FROM student
             WHERE class_id = ?
             ORDER BY last_name, first_name"
        );
        if ($stmt === false) {
            return null;
        }
        $stmt->bind_param("i", $classId);
        if (!$stmt->execute()) {
            return null;
        }
        $students = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (!$students) {
            return [
                "term" => [
                    "term_id" => (int) $termRow["term_id"],
                    "term_number" => (int) $termRow["term_number"],
                    "year" => (int) $termRow["year_label"],
                ],
                "subjects" => $subjectNames,
                "students" => [],
            ];
        }

        $stmt = $this->db->prepare(
            "SELECT s.student_id, s.subject_id, s.score_value
             FROM score s
             JOIN student st ON st.student_id = s.student_id
             WHERE st.class_id = ? AND s.term_id = ?"
        );
        if ($stmt === false) {
            return null;
        }
        $termId = (int) $termRow["term_id"];
        $stmt->bind_param("ii", $classId, $termId);
        if (!$stmt->execute()) {
            return null;
        }
        $scoreRows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $scoresByStudent = [];
        foreach ($scoreRows as $row) {
            $studentKey = (int) $row["student_id"];
            $subjectKey = (int) $row["subject_id"];
            $scoresByStudent[$studentKey][$subjectKey] = (float) $row["score_value"];
        }

        $subjectCount = count($subjects);
        $response = [];

        foreach ($students as $student) {
            $studentId = (int) $student["student_id"];
            $scores = [];
            $total = 0.0;

            foreach ($subjects as $subject) {
                $subjectId = (int) $subject["subject_id"];
                $scoreValue = $scoresByStudent[$studentId][$subjectId] ?? 0;
                $scores[$subject["subject_name"]] = $scoreValue;
                $total += $scoreValue;
            }

            $average = $subjectCount > 0 ? $total / $subjectCount : 0;

            $response[] = [
                "student_id" => $studentId,
                "student_number" => $student["student_number"],
                "name" => trim($student["first_name"] . " " . $student["last_name"]),
                "scores" => $scores,
                "overall" => $average,
            ];
        }

        return [
            "term" => [
                "term_id" => (int) $termRow["term_id"],
                "term_number" => (int) $termRow["term_number"],
                "year" => (int) $termRow["year_label"],
            ],
            "subjects" => $subjectNames,
            "students" => $response,
        ];
    }

    public function getTermIdByYearAndNumber($yearLabel, $termNumber) {
        $stmt = $this->db->prepare(
            "SELECT t.term_id
             FROM term t
             JOIN academic_year ay ON ay.academic_year_id = t.academic_year_id
             WHERE ay.year_label = ? AND t.term_number = ?"
        );
        if ($stmt === false) {
            return null;
        }

        $yearLabel = (int) $yearLabel;
        $termNumber = (int) $termNumber;
        $stmt->bind_param("ii", $yearLabel, $termNumber);
        if (!$stmt->execute()) {
            return null;
        }

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row ? (int) $row["term_id"] : null;
    }

    public function upsertStudentScores($studentId, $termId, $teacherUserId, array $scores) {
        if (!$scores) {
            return false;
        }

        $this->db->begin_transaction();
        $stmt = $this->db->prepare(
            "INSERT INTO score (student_id, subject_id, term_id, teacher_user_id, score_value, recorded_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                score_value = VALUES(score_value),
                teacher_user_id = VALUES(teacher_user_id),
                recorded_at = VALUES(recorded_at)"
        );
        if ($stmt === false) {
            $this->db->rollback();
            return false;
        }

        $studentId = (int) $studentId;
        $termId = (int) $termId;
        $teacherUserId = (int) $teacherUserId;
        $recordedAt = date('Y-m-d H:i:s');

        foreach ($scores as $score) {
            if (!isset($score["subject_id"]) || !isset($score["score_value"])) {
                $this->db->rollback();
                return false;
            }
            $subjectId = (int) $score["subject_id"];
            $scoreValue = $score["score_value"];
            $stmt->bind_param("iiiids", $studentId, $subjectId, $termId, $teacherUserId, $scoreValue, $recordedAt);
            if (!$stmt->execute()) {
                $this->db->rollback();
                return false;
            }
        }

        $this->db->commit();
        return true;
    }
}
