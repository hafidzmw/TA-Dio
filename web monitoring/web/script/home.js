/* ================================
   CONFIG
================================ */
const API_BASE = "http://localhost:8081/api"; 
const REFRESH_INTERVAL = 5000; // 5 detik
const CHART_LIMIT = 20;

/* ================================
   ELEMENT REFERENCES
================================ */
const elVoltage = document.getElementById("voltage");
const elCurrent = document.getElementById("current");
const elPower   = document.getElementById("power");
const elBalance = document.getElementById("balance");

/* ================================
   LOAD LATEST DATA (CARD)
================================ */
async function loadLatestData() {
  try {
    const res = await fetch(`${API_BASE}/get_latest.php`);
    const data = await res.json();

    elVoltage.innerHTML = `${data.voltage} <span class="unit">V</span>`;
    elCurrent.innerHTML = `${data.current} <span class="unit">A</span>`;
    elPower.innerHTML   = `${data.power} <span class="unit">W</span>`;

    if (data.anomaly_flag == 1) {
      elBalance.innerText = "DETECTED";
      elBalance.style.color = "red";
    } else {
      elBalance.innerText = "NORMAL";
      elBalance.style.color = "green";
    }

  } catch (err) {
    console.error("Failed to load latest data:", err);
  }
}

/* ================================
   CHART SECTION
================================ */
let allParamsChart;

async function loadChartData() {
  try {
    const res = await fetch(`${API_BASE}/get_history.php?limit=${CHART_LIMIT}`);
    const rows = await res.json();

    const labels   = rows.map(r => r.timestamp);
    const power    = rows.map(r => r.power);
    const current  = rows.map(r => r.current);
    const voltage  = rows.map(r => r.voltage);

    if (allParamsChart) {
      allParamsChart.data.labels = labels;
      allParamsChart.data.datasets[0].data = power;
      allParamsChart.data.datasets[1].data = current;
      allParamsChart.data.datasets[2].data = voltage;
      allParamsChart.update();
      return;
    }

    const ctx = document.getElementById("allParamsChart");

    allParamsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Power (W)",
            data: power,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.3,
            yAxisID: "yPower"
          },
          {
            label: "Current (A)",
            data: current,
            borderColor: "rgb(54, 162, 235)",
            tension: 0.3,
            yAxisID: "yCurrent"
          },
          {
            label: "Voltage (V)",
            data: voltage,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.3,
            yAxisID: "yVoltage"
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false
        },
        scales: {
          yPower: {
            type: "linear",
            position: "left",
            title: { display: true, text: "Power (W)" }
          },
          yCurrent: {
            type: "linear",
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Current (A)" }
          },
          yVoltage: {
            type: "linear",
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Voltage (V)" }
          }
        }
      }
    });

  } catch (err) {
    console.error("Failed to load chart data:", err);
  }
}

/* ================================
   RELAY CONTROL (OPTIONAL)
================================ */
async function setRelay(state) {
  try {
    await fetch(`${API_BASE}/set_relay.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });

    alert(state === 1 ? "Power ON" : "Power OFF");

  } catch (err) {
    console.error("Relay control failed:", err);
  }
}

/* ================================
   INIT
================================ */
loadLatestData();
loadChartData();

setInterval(() => {
  loadLatestData();
  loadChartData();
}, REFRESH_INTERVAL);
