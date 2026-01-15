<?php
require_once __DIR__ . '/../model/report.php';

class ReportController {
    private $report;

    public function __construct() {
        $this->report = new Report();
    }

    public function getStudentReport() {
        $year = isset($_GET['year']) ? $_GET['year'] : null;
        $term = isset($_GET['term']) ? $_GET['term'] : null;
        $grade = isset($_GET['grade']) ? $_GET['grade'] : null;
        $class = isset($_GET['class']) ? $_GET['class'] : null;
        $student = isset($_GET['student']) ? $_GET['student'] : null;

        if (!$year || !$term) {
            http_response_code(400);
            echo json_encode(['error' => 'year and term are required']);
            exit;
        }

        $data = $this->report->getStudentReport($year, $term, $grade, $class, $student);
        if ($data === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate student report or term not found']);
            exit;
        }

        echo json_encode([
            'message' => 'Student report generated',
            'data' => $data
        ]);
        exit;
    }

    public function getSubjectReport() {
        $year = isset($_GET['year']) ? $_GET['year'] : null;
        $term = isset($_GET['term']) ? $_GET['term'] : null;
        $grade = isset($_GET['grade']) ? $_GET['grade'] : null;
        $subject = isset($_GET['subject']) ? $_GET['subject'] : null;

        if (!$year || !$term || !$grade || !$subject) {
            http_response_code(400);
            echo json_encode(['error' => 'year, term, grade and subject are required']);
            exit;
        }

        $params = [
            'year' => $year,
            'term' => $term,
            'grade' => $grade,
            'subject' => $subject,
        ];

        $data = $this->report->getSubjectReportAverage($year, $term, $grade, $subject);
        if ($data === null) {
            echo json_encode([
                'message' => 'Subject report generated',
                'data' => [
                    'subject_name' => null,
                    'average' => null,
                    'params' => $params,
                ]
            ]);
            exit;
        }

        echo json_encode([
            'message' => 'Subject report generated',
            'data' => array_merge($data, ['params' => $params])
        ]);
        exit;
    }
}
