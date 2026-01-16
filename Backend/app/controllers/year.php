<?php
require_once __DIR__ . '/../model/year.php';

class YearController {
    private $year;

    public function __construct() {
        $this->year = new Year();
    }

    public function getYearById($id) {
        $year = $this->year->getYearById($id);

        if (!$year) {
            http_response_code(404);
            echo json_encode(["error" => "Academic year with id $id not found"]);
            exit;
        }

        echo json_encode([
            "message" => "Academic year with id $id retrieved successfully",
            "data" => $year
        ]);
        exit;
    }

    public function getYears() {
        $years = $this->year->getYears();
        if ($years === null) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve academic years"]);
            exit;
        }

        echo json_encode([
            "message" => "Academic years retrieved successfully",
            "data" => $years
        ]);
        exit;
    }

    public function addYear() {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($payload["year_label"], $payload["start_date"], $payload["end_date"])) {
            http_response_code(400);
            echo json_encode(["error" => "year_label, start_date, and end_date are required"]);
            exit;
        }

        $yearId = $this->year->addYear($payload);
        if (!$yearId) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create academic year"]);
            exit;
        }

        echo json_encode([
            "message" => "Academic year created successfully",
            "academic_year_id" => $yearId
        ]);
        exit;
    }

    public function updateYear($id) {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!$payload) {
            http_response_code(400);
            echo json_encode(["error" => "No update data provided"]);
            exit;
        }

        $updated = $this->year->updateYear($id, $payload);
        if (!$updated) {
            http_response_code(404);
            echo json_encode(["error" => "Academic year with id $id not found or no changes applied"]);
            exit;
        }

        echo json_encode([
            "message" => "Academic year with id $id updated successfully"
        ]);
        exit;
    }
}
