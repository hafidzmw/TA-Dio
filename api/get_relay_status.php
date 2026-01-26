<?php
header("Access-Control-Allow-Origin: http://192.168.1.60:8081");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = new PDO(
  "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
  getenv('DB_USER'),
  getenv('DB_PASS'),
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$stmt = $pdo->query("
  SELECT state, updated_at 
  FROM relay_control 
  WHERE id=1
");

$data = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($data ?: [
  "state" => 1,
  "updated_at" => null
]);
