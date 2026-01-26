<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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
