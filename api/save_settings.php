<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/* =========================
   CORS HEADERS
========================= */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/* =========================
   HANDLE PREFLIGHT
========================= */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

/* =========================
   ONLY POST ALLOWED
========================= */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST only"]);
    exit;
}

/* =========================
   READ JSON BODY
========================= */
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

/* =========================
   VALIDATE INPUT
========================= */
$threshold = $data['threshold'] ?? null;
$mode = $data['mode'] ?? null;
$telegram = $data['telegram_enabled'] ?? null;

if ($threshold === null || $mode === null || $telegram === null) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

/* =========================
   DB CONNECTION
========================= */
try {
    $pdo = new PDO(
        "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
        getenv('DB_USER'),
        getenv('DB_PASS'),
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );

    $stmt = $pdo->prepare("
        UPDATE system_settings
        SET threshold = :threshold,
            mode = :mode,
            telegram_enabled = :telegram,
            updated_at = NOW()
        LIMIT 1
    ");

    $stmt->execute([
        ':threshold' => $threshold,
        ':mode' => $mode,
        ':telegram' => $telegram
    ]);

    echo json_encode([
        "success" => true
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database error",
        "detail" => $e->getMessage()
    ]);
}
