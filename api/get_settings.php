<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
  $pdo = new PDO(
    "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
    getenv('DB_USER'),
    getenv('DB_PASS'),
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  $stmt = $pdo->query("
  SELECT threshold, mode, telegram_enabled
  FROM system_settings
  WHERE id = 1
  ");
  $data = $stmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode($data ?: [
    "threshold" => 0.5,
    "mode" => "monitoring",
    "telegram_enabled" => 1
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}
