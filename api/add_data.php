<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "POST only"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$required = [
    'timestamp','voltage','current','power',
    'pf','energy_kwh','ai_score','anomaly_flag'
];

foreach ($required as $r) {
    if (!isset($data[$r])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing field: $r"]);
        exit;
    }
}

try {
    $pdo = new PDO(
        "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
        getenv('DB_USER'),
        getenv('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $pdo->prepare("
        INSERT INTO electricity_logs
        (timestamp, voltage, current, power, pf, energy_kwh, ai_score, anomaly_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['timestamp'],
        $data['voltage'],
        $data['current'],
        $data['power'],
        $data['pf'],
        $data['energy_kwh'],
        $data['ai_score'],
        $data['anomaly_flag']
    ]);

    echo json_encode([
        "status" => "ok",
        "message" => "Data stored"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}