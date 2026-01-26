<?php
<?php
header("Access-Control-Allow-Origin: http://192.168.1.60:8081");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['state'])) {
  http_response_code(400);
  echo json_encode(["error" => "Missing state"]);
  exit;
}

$state = $data['state'] ? 1 : 0;

$pdo = new PDO(
  "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
  getenv('DB_USER'),
  getenv('DB_PASS'),
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$stmt = $pdo->prepare("
  UPDATE relay_control 
  SET state=?, updated_at=NOW()
  WHERE id=1
");

$ok = $stmt->execute([$state]);

echo json_encode([
  "success" => $ok,
  "state"   => $state
]);
