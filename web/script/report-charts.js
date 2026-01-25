// ================================
// CONFIG
// ================================
const API_URL = "http://192.168.1.60:8080/get_reports.php";

let powerChart, currentChart, voltageChart, anomalyChart;

// ================================
// FETCH DATA
// ================================
async function fetchReportData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch report data");

        const data = await response.json();

        if (!data || !Array.isArray(data.timestamps)) {
            console.warn("Invalid report data format", data);
            return;
        }

        renderCharts(data);

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// ================================
// CHART RENDERER
// ================================
function renderCharts(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        console.warn("Report data empty");
        return;
    }

    const labels   = rows.map(r => r.timestamp.slice(11));
    const power    = rows.map(r => r.power);
    const current  = rows.map(r => r.current);
    const voltage  = rows.map(r => r.voltage);
    const anomaly  = rows.map(r => r.anomaly_flag);

    if (powerChart) powerChart.destroy();
    if (currentChart) currentChart.destroy();
    if (voltageChart) voltageChart.destroy();
    if (anomalyChart) anomalyChart.destroy();

    powerChart = createLineChart(
        "powerChart",
        labels,
        power,
        "Power (W)",
        "#ff6384"
    );

    currentChart = createLineChart(
        "currentChart",
        labels,
        current,
        "Current (A)",
        "#36a2eb"
    );

    voltageChart = createLineChart(
        "voltageChart",
        labels,
        voltage,
        "Voltage (V)",
        "#4bc0c0"
    );

    anomalyChart = createAnomalyChart(
        "anomalyChart",
        labels,
        anomaly
    );
}

// ================================
// GENERIC LINE CHART
// ================================
function createLineChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    return new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label,
                data,
                borderColor: color,
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ================================
// ANOMALY CHART
// ================================
function createAnomalyChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    return new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Anomaly (1 = detected)",
                data,
                stepped: true,
                borderColor: "#e74c3c",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", () => {
    fetchReportData();
    // setInterval(fetchReportData, 10000); // optional
});
