<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/* 🔧 [PERBAIKAN 1] Tangani preflight CORS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* Struktur tetap, hanya ditambah OPTIONS handler */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "POST only"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

/* 🔧 [PERBAIKAN 2] Validasi JSON & field */
if (
    !$data ||
    !isset($data['threshold'], $data['mode'], $data['telegram_enabled'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON payload"]);
    exit;
}

$threshold = floatval($data['threshold']);
$mode = $data['mode'];
$telegram = intval($data['telegram_enabled']);

$conn = new mysqli("localhost", "user", "password", "database");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$sql = "UPDATE system_settings 
        SET threshold=?, mode=?, telegram_enabled=?, update_at=NOW()
        WHERE id=1";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $conn->error]);
    exit;
}

$stmt->bind_param("dsi", $threshold, $mode, $telegram);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
