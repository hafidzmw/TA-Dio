const API_GET = "http://192.168.1.60:8080/get_settings.php";
const API_SAVE = "http://192.168.1.60:8080/save_settings.php";

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    document.getElementById("save-btn").addEventListener("click", saveSettings);
});

// fungsi load setting
async function loadSettings() {
    try {
        const res = await fetch(API_GET);
        if (!res.ok) throw new Error("Failed to fetch settings");

        const data = await res.json();

        document.getElementById("threshold").value = data.threshold;
        document.getElementById("thresholdValue").innerText = data.threshold;

        /* 🔧 [PERBAIKAN 1] Cek radio exists */
        const modeRadio = document.querySelector(
            `input[name="mode"][value="${data.mode}"]`
        );
        if (modeRadio) {
            modeRadio.checked = true;
        }

        /* 🔧 [PERBAIKAN 2] Cek checkbox exists */
        const telegramToggle = document.getElementById("telegramToggle");
        if (telegramToggle) {
            telegramToggle.checked = data.telegram_enabled == 1;
        }

    } catch (err) {
        console.error("Failed to load settings", err);
    }
}

// simpan konfigurasi
async function saveSettings() {
    const threshold = document.getElementById("threshold").value;
    const mode = document.querySelector('input[name="mode"]:checked')?.value;
    const telegram = document.getElementById("telegramToggle").checked ? 1 : 0;

    try {
        const res = await fetch(API_SAVE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                threshold,
                mode,
                telegram_enabled: telegram
            })
        });

        if (!res.ok) throw new Error("Save failed");

        const result = await res.json();

        if (result.success) {
            alert("Settings saved successfully ✅");
        } else {
            alert("Failed to save settings ❌");
        }

    } catch (err) {
        console.error("Save settings failed", err);
    }
}
