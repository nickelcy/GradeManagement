<?php
require_once __DIR__ . '/../model/score.php';

class ScoreController {
    private $score;

    public function __construct() {
        $this->score = new Score();
    }

    public function getStudentScoresByYear($studentId, $yearLabel) {
        $scores = $this->score->getStudentScoresByYear($studentId, $yearLabel);
        if ($scores === null) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve scores"]);
            exit;
        }

        echo json_encode([
            "message" => "Scores retrieved successfully",
            "data" => $scores
        ]);
        exit;
    }

    public function getClassScoresByTerm($classId, $termId) {
        $scores = $this->score->getClassScoresByTerm($classId, $termId);
        if ($scores === null) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve class scores"]);
            exit;
        }

        echo json_encode([
            "message" => "Class scores retrieved successfully",
            "data" => $scores
        ]);
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

        $ok = $this->score->upsertStudentScores($studentId, $termId, $teacherUserId, $scores);
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
