<?php 
require_once __DIR__ . '/../model/users.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class LoginController {
    private $users;
    private $user;

    public function __construct() {
        $this->users = new Users();
    }

    public function login() {
        $credentials = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($credentials["staff_id"]) || empty($credentials["password"])) {
            http_response_code(400);
            echo json_encode(["message" => "Please provide required credentials"]);
            exit;
        }

        $this->user = $this->users->getStaffBySid($credentials["staff_id"]);

        if (!$this->user) {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: User not found"]);
            exit;
        }

        if (!password_verify($credentials["password"], $this->user["password_hash"])) {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Incorrect password"]);
            exit;
        }

        if (empty($this->user["is_active"])) {
            http_response_code(401);
            echo json_encode([
                "message" => "unauthorized: User account disabled",
                "is_active" => $this->user["is_active"],
            ]);
            exit;
        }

        echo json_encode([
            "token" => $this->generateToken($this->user)
        ]);

        exit;
    }

    private function generateToken(array $user) {
        $payload = [
            "iss" => "GRMS",
            "sub" => $user["user_id"],
            "role" => $user["role_id"],
            "iat" => time(),
            "exp" => time() + 3600
        ];
        $secret = $_ENV['JWT_SECRET'];
        $token = JWT::encode($payload, $secret, 'HS256');
        return $token;
    }

    public static function verifyToken() {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $normalized = [];
        foreach ($headers as $key => $value) {
            $normalized[strtolower($key)] = $value;
        }
        $authHeader = $normalized['authorization'] ?? null;
        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Missing or invalid Authorization header"]);
            exit;
        }
        $token = trim(substr($authHeader, 7));
        if ($token === '') {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Missing token"]);
            exit;
        }

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Invalid token"]);
            exit;
        }

        if (($decoded->iss ?? null) !== 'GRMS') {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Invalid token issuer"]);
            exit;
        }

        if (empty($decoded->sub) || empty($decoded->role)) {
            http_response_code(401);
            echo json_encode(["message" => "unauthorized: Invalid token claims"]);
            exit;
        }

        return [
            "user_id" => $decoded->sub,
            "role_id" => $decoded->role,
        ];
    }
    public static function verifyAdmin() {
        $auth = self::verifyToken();
        if ((int) $auth["role_id"] === 1) {
            return true;
        } else {
            return false;
        }
    }


}
