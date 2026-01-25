// ================================
// CONFIG
// ================================
const API_URL = "http://192.168.1.60:8080/get_reports.php";

let powerChart, currentChart, voltageChart, anomalyChart;
let reportData = []; // cache data (siap untuk export CSV nanti)

// ================================
// FETCH DATA
// ================================
async function fetchReportData(start = "", end = "") {
    try {
        let url = API_URL;

        if (start && end) {
            url += `?start=${start}&end=${end}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch report data");

        const rows = await response.json();

        if (!Array.isArray(rows) || rows.length === 0) {
            console.warn("Report data empty or invalid", rows);
            return;
        }

        reportData = rows;
        renderCharts(rows);

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// ================================
// CHART RENDERER
// ================================
function renderCharts(rows) {
    const labels  = rows.map(r => r.timestamp.slice(11)); // HH:MM:SS
    const power   = rows.map(r => r.power);
    const current = rows.map(r => r.current);
    const voltage = rows.map(r => r.voltage);
    const anomaly = rows.map(r => r.anomaly_flag);

    // destroy old charts
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
            plugins: {
                legend: { display: true }
            },
            scales: {
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
});

// filter
document.getElementById("applyFilter").addEventListener("click", () => {
    const start = document.getElementById("startDate").value;
    const end   = document.getElementById("endDate").value;

    if (!start || !end) {
        alert("Please select start and end date");
        return;
    }

    if (start > end) {
        alert("Start date cannot be after end date");
        return;
    }

    fetchReportData(start, end);
});

// export
document.getElementById("exportCsv").addEventListener("click", () => {
    const start = document.getElementById("startDate").value;
    const end   = document.getElementById("endDate").value;

    if (!start || !end) {
        alert("Please select date range before export");
        return;
    }

    const url = `${API_URL}?start=${start}&end=${end}&export=csv`;
    window.open(url, "_blank");
});