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

    public function getClassScoresByTerm($classId, $termId) {
        $stmt = $this->db->prepare(
            "SELECT
                st.student_id,
                st.student_number,
                st.first_name,
                st.last_name,
                s.score_id,
                s.subject_id,
                sub.subject_name,
                s.term_id,
                s.teacher_user_id,
                s.score_value,
                s.recorded_at
            FROM student st
            LEFT JOIN score s ON s.student_id = st.student_id AND s.term_id = ?
            LEFT JOIN subject sub ON sub.subject_id = s.subject_id
            WHERE st.class_id = ?
            ORDER BY st.last_name, st.first_name, sub.subject_name"
        );
        if ($stmt === false) {
            return null;
        }

        $classId = (int) $classId;
        $termId = (int) $termId;
        $stmt->bind_param("ii", $termId, $classId);
        if (!$stmt->execute()) {
            return null;
        }

        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
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
