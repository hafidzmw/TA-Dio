<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON"]);
  exit;
}

try {
  $pdo = new PDO(
    "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
    getenv('DB_USER'),
    getenv('DB_PASS'),
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  $stmt = $pdo->prepare("
    UPDATE system_settings
    SET threshold = ?, 
        mode = ?, 
        telegram_enabled = ?, 
        updated_at = NOW()
    WHERE id = 1
  ");

  $ok = $stmt->execute([
    $data['threshold'],
    $data['mode'],
    $data['telegram_enabled']
  ]);

  echo json_encode(["success" => $ok]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}
