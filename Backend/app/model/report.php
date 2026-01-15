<?php
class Report {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/database.php';
        $connection = new Database();
        $this->db = $connection->getConnection();
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
        return $row ? (int) $row['term_id'] : null;
    }

    public function getStudentReport($yearLabel, $termNumber, $gradeNumber = null, $classId = null, $studentId = null) {
        $termId = $this->getTermIdByYearAndNumber($yearLabel, $termNumber);
        if (!$termId) {
            return null;
        }

        $sql = "SELECT
                    st.student_id,
                    st.student_number,
                    st.first_name,
                    st.last_name,
                    sub.subject_name,
                    s.score_value
                FROM student st
                JOIN classroom c ON st.class_id = c.class_id
                JOIN grade g ON c.grade_id = g.grade_id
                LEFT JOIN score s ON s.student_id = st.student_id AND s.term_id = ?
                LEFT JOIN subject sub ON sub.subject_id = s.subject_id
                WHERE 1=1";

        $params = [];
        $types = '';
        $params[] = $termId;
        $types .= 'i';

        if (!is_null($gradeNumber) && $gradeNumber !== '') {
            $sql .= " AND g.grade_number = ?";
            $params[] = (int)$gradeNumber;
            $types .= 'i';
        }

        if (!is_null($classId) && $classId !== '') {
            $sql .= " AND c.class_id = ?";
            $params[] = (int)$classId;
            $types .= 'i';
        }

        if (!is_null($studentId) && $studentId !== '') {
            $sql .= " AND st.student_id = ?";
            $params[] = (int)$studentId;
            $types .= 'i';
        }

        $sql .= " ORDER BY st.last_name, st.first_name, sub.subject_name";

        $stmt = $this->db->prepare($sql);
        if ($stmt === false) {
            return null;
        }

        // bind params dynamically
        $bind_names[] = $types;
        for ($i = 0; $i < count($params); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        if (count($params) > 0) {
            call_user_func_array(array($stmt, 'bind_param'), $bind_names);
        }

        if (!$stmt->execute()) {
            return null;
        }

        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        $students = [];
        foreach ($rows as $r) {
            $sid = $r['student_id'];
            if (!isset($students[$sid])) {
                $students[$sid] = [
                    'student_id' => (int)$r['student_id'],
                    'student_number' => $r['student_number'],
                    'first_name' => $r['first_name'],
                    'last_name' => $r['last_name'],
                    'scores' => [],
                ];
            }
            if (!is_null($r['subject_name'])) {
                $students[$sid]['scores'][] = [
                    'subject_name' => $r['subject_name'],
                    'score_value' => is_null($r['score_value']) ? null : (float)$r['score_value']
                ];
            }
        }

        // compute overall averages
        foreach ($students as $sid => &$sdata) {
            $sum = 0.0;
            $count = 0;
            foreach ($sdata['scores'] as $sc) {
                if (!is_null($sc['score_value'])) {
                    $sum += $sc['score_value'];
                    $count++;
                }
            }
            $sdata['overall_average'] = $count > 0 ? round($sum / $count, 2) : null;
        }

        return array_values($students);
    }

    public function getSubjectReportAverage($yearLabel, $termNumber, $gradeNumber, $subjectId) {
        $termId = $this->getTermIdByYearAndNumber($yearLabel, $termNumber);
        if (!$termId) {
            return null;
        }

        $sql = "SELECT AVG(s.score_value) AS average
                FROM score s
                JOIN subject sub ON sub.subject_id = s.subject_id
                JOIN term t ON t.term_id = s.term_id
                JOIN academic_year ay ON ay.academic_year_id = t.academic_year_id
                JOIN student st ON st.student_id = s.student_id
                JOIN classroom c ON c.class_id = st.class_id
                JOIN grade g ON g.grade_id = c.grade_id
                WHERE ay.year_label = ? AND t.term_number = ? AND g.grade_number = ? AND s.subject_id = ?";

        $stmt = $this->db->prepare($sql);
        if ($stmt === false) {
            return null;
        }

        $yearLabel = (int)$yearLabel;
        $termNumber = (int)$termNumber;
        $gradeNumber = (int)$gradeNumber;
        $subjectId = (int)$subjectId;
        $stmt->bind_param('iiii', $yearLabel, $termNumber, $gradeNumber, $subjectId);
        if (!$stmt->execute()) {
            return null;
        }

        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        if (!$row) return null;
        return is_null($row['average']) ? null : round((float)$row['average'], 2);
    }
}

