<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 1;

try {
    $pdo = new PDO(
        "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
        getenv('DB_USER'),
        getenv('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    if ($limit === 1) {
        // Hitung selisih detik di sisi MySQL (server-side), bukan di browser
        // sehingga timezone mismatch tidak jadi masalah
        $stmt = $pdo->query("
            SELECT voltage, current, power, anomaly_flag,
                   TIMESTAMPDIFF(SECOND, timestamp, NOW()) AS seconds_ago
            FROM electricity_logs
            ORDER BY timestamp DESC
            LIMIT 1
        ");
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: []);
    } else {
        $stmt = $pdo->prepare("
            SELECT timestamp, voltage, current, power
            FROM electricity_logs
            ORDER BY timestamp DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC)));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
