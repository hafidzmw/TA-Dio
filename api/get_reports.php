<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = new PDO(
    "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME'),
    getenv('DB_USER'),
    getenv('DB_PASS'),
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

$start  = $_GET['start']  ?? null;   // YYYY-MM-DD
$end    = $_GET['end']    ?? null;   // YYYY-MM-DD
$limit  = $_GET['limit']  ?? null;
$export = $_GET['export'] ?? null;

$sql = "
    SELECT timestamp, voltage, current, power, anomaly_flag
    FROM electricity_logs
";

$params = [];

if ($start && $end) {
    $sql .= " WHERE DATE(timestamp) BETWEEN :start AND :end ";
    $params[':start'] = $start;
    $params[':end']   = $end;
}

$sql .= " ORDER BY timestamp ASC LIMIT :limit";

$stmt = $pdo->prepare($sql);

foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);

$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// export csv
if ($export === 'csv') {
    header("Content-Type: text/csv");
    header("Content-Disposition: attachment; filename=electricity_report.csv");

    echo "timestamp,voltage,current,power,anomaly_flag\n";
    foreach ($data as $row) {
        echo "{$row['timestamp']},{$row['voltage']},{$row['current']},{$row['power']},{$row['anomaly_flag']}\n";
    }
    exit;
}

header("Content-Type: application/json");
echo json_encode($data);
