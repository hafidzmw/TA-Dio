// ================================
// CONFIG
// ================================
const API_URL = "http://192.168.1.60:8080/get_reports.php"; // sesuaikan

let powerChart, currentChart, voltageChart, anomalyChart;

// ================================
// FETCH DATA
// ================================
async function fetchReportData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch report data");

        const data = await response.json();
        renderCharts(data);
    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// ================================
// CHART RENDERER
// ================================
function renderCharts(data) {
    const labels = data.timestamps;

    powerChart = createLineChart(
        "powerChart",
        labels,
        data.power,
        "Power (W)"
    );

    currentChart = createLineChart(
        "currentChart",
        labels,
        data.current,
        "Current (A)"
    );

    voltageChart = createLineChart(
        "voltageChart",
        labels,
        data.voltage,
        "Voltage (V)"
    );

    anomalyChart = createAnomalyChart(
        "anomalyChart",
        labels,
        data.anomaly
    );
}

// ================================
// GENERIC LINE CHART
// ================================
function createLineChart(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    return new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { display: true },
                y: { beginAtZero: true }
            }
        }
    });
}

// ================================
// ANOMALY CHART (STEP STYLE)
// ================================
function createAnomalyChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    return new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Anomaly (1 = detected)",
                data: data,
                stepped: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        stepSize: 1
                    }
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
});
