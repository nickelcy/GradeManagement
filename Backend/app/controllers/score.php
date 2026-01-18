<?php
require_once __DIR__ . '/../model/score.php';

class ScoreController {
    private $score;

    public function __construct() {
        $this->score = new Score();
    }

    public function getStudentScoresByYear($studentId, $yearLabel, $termNumber = null) {
        $scores = $this->score->getStudentScoresByYear($studentId, $yearLabel, $termNumber);
        if ($scores === null) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve scores"]);
            exit;
        }

        $subjectMap = [];
        $subjects = [];
        $termMap = [];

        foreach ($scores as $row) {
            $subjectId = (int) $row["subject_id"];
            if (!isset($subjectMap[$subjectId])) {
                $subjectMap[$subjectId] = true;
                $subjects[] = [
                    "subject_id" => $subjectId,
                    "name" => $row["subject_name"],
                ];
            }

            $termId = (int) $row["term_id"];
            if (!isset($termMap[$termId])) {
                $termMap[$termId] = [
                    "term_id" => $termId,
                    "term_number" => (int) $row["term_number"],
                    "overall" => 0,
                    "scores" => [],
                ];
            }

            $termMap[$termId]["scores"][(string) $subjectId] = [
                "score_id" => (int) $row["score_id"],
                "value" => (float) $row["score_value"],
            ];
        }

        $subjectIds = array_column($subjects, "subject_id");
        foreach ($termMap as $termId => $termData) {
            $total = 0.0;
            $subjectCount = count($subjectIds);
            foreach ($subjectIds as $subjectId) {
                $key = (string) $subjectId;
                if (!isset($termMap[$termId]["scores"][$key])) {
                    $termMap[$termId]["scores"][$key] = [
                        "score_id" => null,
                        "value" => 0,
                    ];
                }
                $total += (float) $termMap[$termId]["scores"][$key]["value"];
            }
            $termMap[$termId]["overall"] = $subjectCount > 0 ? $total / $subjectCount : 0;
        }

        $terms = array_values($termMap);
        usort($terms, fn($a, $b) => $a["term_number"] <=> $b["term_number"]);
        $overall = 0;
        if ($terms) {
            $overall = array_sum(array_column($terms, "overall")) / count($terms);
        }

        echo json_encode([
            "message" => "Scores retrieved successfully",
            "student_id" => (int) $studentId,
            "year" => (int) $yearLabel,
            "overall" => $overall,
            "subjects" => $subjects,
            "terms" => $terms,
        ]);
        exit;
    }

    public function getClassScoresByTerm($classId, $yearLabel, $termNumber) {
        $scores = $this->score->getClassScoresByTerm($classId, $yearLabel, $termNumber);
        if ($scores === null) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve class scores"]);
            exit;
        }

        echo json_encode(array_merge(
            ["message" => "Class scores retrieved successfully"],
            $scores
        ));
        exit;
    }

    public function addStudentScoresByTermAndYear($studentId, $yearLabel, $termNumber, $teacherUserId) {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        $scores = $payload["scores"] ?? null;

        if (!$scores || !is_array($scores)) {
            http_response_code(400);
            echo json_encode(["error" => "scores array is required"]);
            exit;
        }

        $termId = $this->score->getTermIdByYearAndNumber($yearLabel, $termNumber);
        if (!$termId) {
            http_response_code(404);
            echo json_encode(["error" => "Term not found for year $yearLabel and term $termNumber"]);
            exit;
        }

        $ok = $this->score->upsertStudentScores($studentId, $termId, $teacherUserId, $scores);
        if (!$ok) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add student scores"]);
            exit;
        }

        echo json_encode([
            "message" => "Student scores added successfully"
        ]);
        exit;
    }

    public function updateStudentScoresByTermAndYear($studentId, $yearLabel, $termNumber, $teacherUserId) {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        $scores = $payload["scores"] ?? null;

        if (!$scores || !is_array($scores)) {
            http_response_code(400);
            echo json_encode(["error" => "scores array is required"]);
            exit;
        }

        $termId = $this->score->getTermIdByYearAndNumber($yearLabel, $termNumber);
        if (!$termId) {
            http_response_code(404);
            echo json_encode(["error" => "Term not found for year $yearLabel and term $termNumber"]);
            exit;
        }

        $mappedScores = [];
        foreach ($scores as $entry) {
            if (!is_array($entry) || count($entry) !== 1) {
                http_response_code(400);
                echo json_encode(["error" => "Each score entry must include a single subject name."]);
                exit;
            }
            $subjectName = array_key_first($entry);
            $scoreValue = $entry[$subjectName];
            if ($subjectName === null) {
                http_response_code(400);
                echo json_encode(["error" => "Subject name is required."]);
                exit;
            }
            $subjectId = $this->score->getSubjectIdByStudentGradeAndName(
                $studentId,
                $subjectName
            );
            if (!$subjectId) {
                http_response_code(400);
                echo json_encode(["error" => "Unknown subject name: $subjectName"]);
                exit;
            }
            $mappedScores[] = [
                "subject_id" => $subjectId,
                "score_value" => $scoreValue,
            ];
        }

        $ok = $this->score->upsertStudentScores($studentId, $termId, $teacherUserId, $mappedScores);
        if (!$ok) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update student scores"]);
            exit;
        }

        echo json_encode([
            "message" => "Student scores updated successfully"
        ]);
        exit;
    }
}
