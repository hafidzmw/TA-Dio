<?php
// ================== CORS HEADERS ==================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ================== HANDLE PREFLIGHT ==================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ================== ONLY POST ALLOWED ==================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST only"]);
    exit;
}

// ================== READ JSON ==================
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['state'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid payload"]);
    exit;
}

$state = (int)$data['state']; // 1 = ON, 0 = OFF

// ================== DATABASE ==================
$pdo = new PDO(
  "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
  getenv('DB_USER'),
  getenv('DB_PASS'),
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// ================== SAVE RELAY STATE ==================
$stmt = $pdo->prepare("
  UPDATE relay_control
  SET state = ?, updated_at = NOW()
  WHERE id = 1
");
$ok = $stmt->execute([$state]);

echo json_encode([
  "success" => $ok,
  "state" => $state
]);
