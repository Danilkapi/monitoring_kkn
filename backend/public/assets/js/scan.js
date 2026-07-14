const authToken = localStorage.getItem("token");

let html5QrCode = null;

const loading = document.getElementById("loadingCamera");

const uploadQR = document.getElementById("uploadQR");

const btnStartCamera = document.getElementById("btnStartCamera");

const btnUploadQR = document.getElementById("btnUploadQR");

// ======================================
// UPDATE STATUS
// ======================================

function updateStatus(icon, color, text) {
  const iconEl = document.getElementById("statusIcon");

  const textEl = document.getElementById("statusText");

  const card = document.getElementById("statusCard");

  iconEl.className = icon;

  iconEl.style.color = color;

  textEl.innerHTML = text;

  card.classList.remove("status-success", "status-error", "status-waiting");

  if (color === "green") {
    card.classList.add("status-success");
  } else if (color === "red") {
    card.classList.add("status-error");
  } else {
    card.classList.add("status-waiting");
  }

  card.classList.remove("success-animation");

  void card.offsetWidth;

  card.classList.add("success-animation");
}

// ======================================
// START CAMERA
// ======================================

btnStartCamera.addEventListener("click", startCamera);

async function startCamera() {
  try {
    loading.style.display = "block";

    html5QrCode = new Html5Qrcode("reader");

    const cameras = await Html5Qrcode.getCameras();

    if (!cameras.length) {
      loading.style.display = "none";

      updateStatus("fa-solid fa-circle-xmark", "red", "Kamera tidak ditemukan.");

      return;
    }

    await html5QrCode.start(
      cameras[0].id,
      {
        fps: 10,
        qrbox: 250,
      },
      onScanSuccess,
    );

    loading.style.display = "none";

    updateStatus("fa-solid fa-camera", "#0d6efd", "Kamera aktif. Silakan scan QR Code.");
  } catch (err) {
    loading.style.display = "none";

    updateStatus("fa-solid fa-circle-xmark", "red", "Tidak dapat mengakses kamera.");
  }
}

// ======================================
// PILIH GAMBAR
// ======================================

btnUploadQR.addEventListener("click", () => {
  uploadQR.click();
});

uploadQR.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader");
    }

    updateStatus("fa-solid fa-image", "#0d6efd", "Membaca QR dari gambar...");

    const decodedText = await html5QrCode.scanFile(file, true);

    onScanSuccess(decodedText);
  } catch (err) {
    updateStatus("fa-solid fa-circle-xmark", "red", "QR Code pada gambar tidak dapat dibaca.");
  }
});

// ======================================
// QR BERHASIL
// ======================================

async function onScanSuccess(decodedText) {
  try {
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop();
    }
  } catch (e) {}

  updateStatus("fa-solid fa-qrcode", "#0d6efd", "QR berhasil dipindai.");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      kirimAbsensi(decodedText, position.coords.latitude, position.coords.longitude);
    },

    gpsError,

    {
      enableHighAccuracy: true,

      timeout: 10000,
    },
  );
}

// ======================================
// KIRIM ABSENSI
// ======================================

async function kirimAbsensi(kode, latitude, longitude) {
  updateStatus("fa-solid fa-cloud-arrow-up", "#0d6efd", "Mengirim data absensi...");

  try {
    const response = await fetch("/api/qr/scan", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${authToken}`,
      },

      body: JSON.stringify({
        kode,

        latitude,

        longitude,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      updateStatus(
        "fa-solid fa-circle-check",

        "green",

        result.message,
      );
    } else {
      updateStatus(
        "fa-solid fa-circle-xmark",

        "red",

        result.message,
      );
    }
  } catch (err) {
    updateStatus(
      "fa-solid fa-circle-xmark",

      "red",

      "Server tidak dapat dihubungi.",
    );
  }
}

// ======================================
// GPS ERROR
// ======================================

function gpsError() {
  updateStatus(
    "fa-solid fa-location-crosshairs",

    "red",

    "GPS tidak aktif. Aktifkan lokasi terlebih dahulu.",
  );
}
