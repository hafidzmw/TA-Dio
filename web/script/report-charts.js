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

        // FIX FORMAT CHECK
        if (!Array.isArray(data)) {
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
    if (!rows.length) {
        console.warn("Report data empty");
        return;
    }

    const labels  = rows.map(r => r.timestamp.slice(11)); // HH:MM:SS
    const power   = rows.map(r => Number(r.power));
    const current = rows.map(r => Number(r.current));
    const voltage = rows.map(r => Number(r.voltage));
    const anomaly = rows.map(r => Number(r.anomaly_flag));

    powerChart?.destroy();
    currentChart?.destroy();
    voltageChart?.destroy();
    anomalyChart?.destroy();

    powerChart = createLineChart("powerChart", labels, power, "Power (W)", "#ff6384");
    currentChart = createLineChart("currentChart", labels, current, "Current (A)", "#36a2eb");
    voltageChart = createLineChart("voltageChart", labels, voltage, "Voltage (V)", "#4bc0c0");
    anomalyChart = createAnomalyChart("anomalyChart", labels, anomaly);
}

// ================================
// GENERIC LINE CHART
// ================================
function createLineChart(canvasId, labels, data, label, color) {
    return new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label,
                data,
                borderColor: color,
                borderWidth: 2,
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
    return new Chart(document.getElementById(canvasId), {
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
document.addEventListener("DOMContentLoaded", fetchReportData);
