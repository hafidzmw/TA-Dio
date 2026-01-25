<?php
header("Content-Type: application/json");

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
