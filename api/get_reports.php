<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight (penting!)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = new PDO(
  "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
  getenv('DB_USER'),
  getenv('DB_PASS')
);

$stmt = $pdo->query("
  SELECT timestamp, voltage, current, power, anomaly_flag
  FROM electricity_logs
  ORDER BY timestamp DESC
  LIMIT 10
");

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(array_reverse($data));
