const API = "http://192.168.1.60:8080";
const REFRESH = 1000;

// ELEMENTS
const elV = document.getElementById("voltage");
const elI = document.getElementById("current");
const elP = document.getElementById("power");
const elA = document.getElementById("balance");

const btnOn  = document.getElementById("power-on-btn");
const btnOff = document.getElementById("power-off-btn");
const relayAlert = document.getElementById("power-control-alert");

let chart;

// ======================
// LOAD LATEST SENSOR
// ======================
async function loadLatest() {
  const r = await fetch(`${API}/get_latest.php`);
  const d = await r.json();

  elV.innerText = `${d.voltage} V`;
  elI.innerText = `${d.current} A`;
  elP.innerText = `${d.power} W`;

  if (d.anomaly_flag == 1) {
    elA.innerText = "DETECTED";
    elA.style.color = "red";
  } else {
    elA.innerText = "NORMAL";
    elA.style.color = "green";
  }
}

// ======================
// LOAD SETTINGS
// ======================
async function loadSettings() {
  const r = await fetch(`${API}/get_settings.php`);
  const s = await r.json();

  if (s.mode === "auto_cutoff") {
    btnOn.disabled = true;
    btnOff.disabled = true;
    relayAlert.innerText = "Auto Cut-Off ACTIVE";
    relayAlert.style.display = "block";
  } else {
    btnOn.disabled = false;
    btnOff.disabled = false;
    relayAlert.style.display = "none";
  }
}

// ======================
// RELAY CONTROL
// ======================
async function setRelay(state) {
  await fetch(`${API}/set_relay.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });

  alert(state ? "Power ON" : "Power OFF");
}

// ======================
// CHART
// ======================
async function loadChart() {
  const r = await fetch(`${API}/get_reports.php?limit=20`);
  const rows = await r.json();

  const labels = rows.map(x => x.timestamp.slice(11));
  const data   = rows.map(x => x.power);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return;
  }

  chart = new Chart(document.getElementById("allParamsChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Power (W)",
        data,
        borderColor: "red",
        tension: 0.3
      }]
    }
  });
}

// ======================
// INIT
// ======================
async function init() {
  await loadLatest();
  await loadSettings();
  await loadChart();

  setInterval(() => {
    loadLatest();
    loadSettings();
    loadChart();
  }, REFRESH);
}

init();
