// ===============================
// SAMPLE DATA (SIMULASI PENGUJIAN)
// ===============================

const timeLabels = [
  "10:00", "10:01", "10:02", "10:03", "10:04",
  "10:05", "10:06", "10:07", "10:08", "10:09"
];

const powerData = [120, 125, 130, 410, 135, 140, 138, 145, 150, 148];
const currentData = [0.52, 0.54, 0.56, 1.80, 0.58, 0.60, 0.59, 0.62, 0.65, 0.64];
const voltageData = [220, 221, 219, 220, 221, 220, 222, 221, 220, 219];

// Output TinyML (0 = normal, 1 = anomaly)
const anomalyData = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0];

// ==========================================
// ALL PARAMETERS CHARTS FOR HOME REPORT PAGE
// ==========================================
new Chart(document.getElementById('allParamsChart'),{
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [
        {
        label: 'Power (W)',
        data: powerData,
        yAxisID: 'yPower',
        borderWidth: 2,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.3,
        fill: false
        },{
        label: 'Current (A)',
        data: currentData,
        yAxisID: 'yCurrent',
        borderWidth: 2,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        fill: false
        },{
        label: 'Voltage (V)',
        data: voltageData,
        yAxisID: 'yVoltage',
        borderWidth: 2,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
        fill: false}]
    },
        options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        },
        yPower: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Power (W)'
          }
        },
        yCurrent: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Current (A)'
          }
        },
        yVoltage: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Voltage (V)'
          }
        }
      }
    } 
});

// ==========================================
// POWER CHART
// ==========================================

new Chart(document.getElementById('powerChart'), {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Power (W)',
      data: powerData,
      borderWidth: 2,
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Watt' }
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    }
  }
});

// ==========================================
// CURRENT CHART
// ==========================================

new Chart(document.getElementById('currentChart'), {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Current (A)',
      data: currentData,
      borderWidth: 2,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Ampere' }
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    }
  }
});

// ==========================================
// VOLTAGE CHART
// ==========================================

new Chart(document.getElementById('voltageChart'), {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Voltage (V)',
      data: voltageData,
      borderWidth: 2,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        min: 210,
        max: 240,
        title: { display: true, text: 'Volt' }
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    }
  }
});

// ==========================================
// ANOMALY DETECTION CHART
// ==========================================

new Chart(document.getElementById('anomalyChart'), {
  type: 'bar',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Anomaly Flag',
      data: anomalyData
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: value => value === 1 ? 'Anomaly' : 'Normal'
        },
        title: {
          display: true,
          text: 'Detection Result'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  }
});


