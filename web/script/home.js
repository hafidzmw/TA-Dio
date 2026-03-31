const API = "http://192.168.1.60:8080";
const REFRESH = 1000;

// Data dianggap stale jika lebih dari X detik (dihitung server-side)
const STALE_THRESHOLD_SEC = 10;

// ELEMENTS
const elV = document.getElementById("voltage");
const elI = document.getElementById("current");
const elP = document.getElementById("power");
const elA = document.getElementById("balance");

const btnOn      = document.getElementById("power-on-btn");
const btnOff     = document.getElementById("power-off-btn");
const relayAlert = document.getElementById("power-control-alert");

let chart;
let isOffline = false;

// ======================
// OFFLINE STATE MANAGER
// ======================
function setOffline(offline) {
  if (offline === isOffline) return;
  isOffline = offline;

  const banner    = document.getElementById("offline-banner");
  const badge     = document.getElementById("status-badge");
  const statusDot = document.getElementById("status-dot-sidebar");
  const badgeText = document.getElementById("badge-text");

  if (offline) {
    banner.style.display  = "flex";
    badgeText.textContent = "OFFLINE";
    badge.className       = "live-badge live-badge--offline";
    statusDot.className   = "status-dot status-dot--offline";

    elV.innerText   = "--";
    elI.innerText   = "--";
    elP.innerText   = "--";
    elA.innerText   = "--";
    elA.style.color = "";

    btnOn.disabled  = true;
    btnOff.disabled = true;
  } else {
    banner.style.display  = "none";
    badgeText.textContent = "LIVE";
    badge.className       = "live-badge";
    statusDot.className   = "status-dot";
  }
}

// ======================
// LOAD LATEST SENSOR
// ======================
async function loadLatest() {
  try {
    const r = await fetch(`${API}/get_latest.php`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();

    // seconds_ago dihitung oleh MySQL (TIMESTAMPDIFF server-side)
    // sehingga tidak terpengaruh timezone browser vs server
    const secondsAgo = parseInt(d.seconds_ago ?? 9999);
    if (!d || secondsAgo > STALE_THRESHOLD_SEC) {
      setOffline(true);
      return;
    }

    setOffline(false);

    elV.innerText = `${d.voltage} V`;
    elI.innerText = `${d.current} A`;
    elP.innerText = `${d.power} W`;

    if (d.anomaly_flag == 1) {
      elA.innerText   = "DETECTED";
      elA.style.color = "var(--danger)";
    } else {
      elA.innerText   = "NORMAL";
      elA.style.color = "var(--accent2)";
    }
  } catch (e) {
    // fetch benar-benar gagal (backend juga mati)
    setOffline(true);
  }
}

// ======================
// LOAD SETTINGS
// ======================
async function loadSettings() {
  try {
    const r = await fetch(`${API}/get_settings.php`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const s = await r.json();

    if (!isOffline) {
      if (s.mode === "auto_cutoff") {
        btnOn.disabled           = true;
        btnOff.disabled          = true;
        relayAlert.innerText     = "Auto Cut-Off ACTIVE";
        relayAlert.style.display = "block";
      } else {
        btnOn.disabled           = false;
        btnOff.disabled          = false;
        relayAlert.style.display = "none";
      }
    }
  } catch (e) {
    // relay buttons sudah di-disable oleh setOffline()
  }
}

// ======================
// RELAY CONTROL
// ======================
async function setRelay(state) {
  if (isOffline) return;
  try {
    await fetch(`${API}/set_relay.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });
    alert(state ? "Power ON" : "Power OFF");
  } catch (e) {
    alert("Failed to send command. Device may be offline.");
  }
}

// ======================
// CHART
// ======================
async function loadChart() {
  try {
    const r = await fetch(`${API}/get_reports.php?limit=20`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const rows = await r.json();

    const labels = rows.map(x => x.timestamp.slice(11));
    const data   = rows.map(x => x.power);

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
      return;
    }

    Chart.defaults.color       = '#7a8aaa';
    Chart.defaults.borderColor = 'rgba(0,200,255,0.08)';

    chart = new Chart(document.getElementById("allParamsChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Power (W)",
          data,
          borderColor: "#00ff99",
          backgroundColor: "rgba(0,255,153,0.05)",
          pointBackgroundColor: "#00ff99",
          pointRadius: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#7a8aaa', font: { family: 'Share Tech Mono', size: 11 } } }
        },
        scales: {
          x: { ticks: { color: '#7a8aaa', maxTicksLimit: 8 }, grid: { color: 'rgba(0,200,255,0.06)' } },
          y: { ticks: { color: '#7a8aaa' }, grid: { color: 'rgba(0,200,255,0.06)' } }
        }
      }
    });
  } catch (e) {
    // chart fetch failed silently
  }
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
