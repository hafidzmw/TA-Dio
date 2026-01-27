<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- PEMBACA .ENV UNTUK getenv() ---
function loadEnvToSystem($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        // Memasukkan ke environment variabel sistem
        putenv(trim($line)); 
    }
}
loadEnvToSystem(__DIR__ . '/.env');

// --- KONEKSI PDO ---
try {
    $dsn = "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME') . ";charset=utf8mb4";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // --- PROSES DATA ---
    $inputJSON = file_get_contents("php://input");
    $data = json_decode($inputJSON, true);

    if (!$data || !isset($data['threshold'], $data['mode'], $data['telegram_enabled'])) {
        throw new Exception("Data tidak lengkap");
    }

    $sql = "UPDATE system_settings SET threshold = ?, mode = ?, telegram_enabled = ? WHERE id = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        floatval($data['threshold']),
        $data['mode'],
        intval($data['telegram_enabled'])
    ]);

    echo json_encode(["success" => true, "message" => "Update Berhasil"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

ob_end_flush();