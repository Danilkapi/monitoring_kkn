// ======================================================
// DASHBOARD DPL
// ======================================================

let dashboardChart = null;

// ======================================================
// INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  loadUser();

  loadDashboard();
});

// ======================================================
// LOAD USER
// ======================================================

function loadUser() {
  const nama = localStorage.getItem("nama");

  const el = document.getElementById("namaUser");

  if (el) {
    el.textContent = nama || "DPL";
  }
}

// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {
  try {
    showLoading(true);

    const data = await getData("/dpl/dashboard");

    setStatistic({
      mahasiswa: data.total_mahasiswa,

      hadir: data.hadir_hari_ini,

      aktivitas: data.aktivitas_hari_ini,

      program: data.total_divisi,
    });

    createChart();
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil dashboard.", false);
  } finally {
    showLoading(false);
  }
}

// ======================================================
// SET STATISTIC
// ======================================================

function setStatistic(data) {
  document.getElementById("totalMahasiswa").textContent = data.mahasiswa;

  document.getElementById("hadirHariIni").textContent = data.hadir;

  document.getElementById("aktivitasHariIni").textContent = data.aktivitas;

  document.getElementById("totalProgram").textContent = data.program;
}

// ======================================================
// CHART
// ======================================================

function createChart() {
  const ctx = document.getElementById("chartMonitoring");

  if (!ctx) return;

  if (dashboardChart) {
    dashboardChart.destroy();
  }

  dashboardChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],

      datasets: [
        {
          label: "Kehadiran",

          data: [0, 0, 0, 0, 0, 0, 0],

          tension: 0.4,

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

// ======================================================
// SHOW LOADING
// ======================================================

function showLoading(show = true) {
  const loading = document.getElementById("loadingOverlay");

  if (!loading) return;

  loading.style.display = show ? "flex" : "none";
}

// ======================================================
// TOAST
// ======================================================

function showToast(message, success = true) {
  const toast = document.getElementById("liveToast");

  const body = document.getElementById("toastMessage");

  if (!toast || !body) return;

  body.textContent = message;

  toast.classList.remove("text-bg-success", "text-bg-danger");

  toast.classList.add(success ? "text-bg-success" : "text-bg-danger");

  bootstrap.Toast.getOrCreateInstance(toast).show();
}

// ======================================================
// REFRESH SETIAP 5 MENIT
// ======================================================

setInterval(() => {
  loadDashboard();
}, 300000);

// ======================================================
// LOG
// ======================================================

console.log("====================================");

console.log("Dashboard DPL Loaded");

console.log("====================================");

// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {
  try {
    showLoading(true);

    const data = await getData("/dpl/dashboard");

    // Card Statistik
    setStatistic({
      mahasiswa: data.total_mahasiswa,
      hadir: data.hadir_hari_ini,
      aktivitas: data.aktivitas_hari_ini,
      program: data.total_divisi,
    });

    // Ringkasan
    document.getElementById("summaryMahasiswa").textContent = data.total_mahasiswa;

    document.getElementById("summaryHadir").textContent = data.hadir_hari_ini;

    document.getElementById("summaryBelum").textContent = data.total_mahasiswa - data.hadir_hari_ini;

    document.getElementById("summaryAktivitas").textContent = data.aktivitas_hari_ini;

    // Grafik
    createChart(data.grafik);

    // Aktivitas
    loadAktivitas(data.aktivitas_terbaru);

    // Belum Absen
    loadBelumAbsen(data.belum_absen);
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil dashboard.", false);
  } finally {
    showLoading(false);
  }
}

function createChart(grafik) {
  const ctx = document.getElementById("chartMonitoring");

  if (!ctx) return;

  if (dashboardChart) {
    dashboardChart.destroy();
  }

  dashboardChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: grafik.map((item) => item.tanggal),

      datasets: [
        {
          label: "Kehadiran",

          data: grafik.map((item) => item.total),

          borderWidth: 3,

          tension: 0.4,

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,
    },
  });
}

// ======================================================
// AKTIVITAS TERBARU
// ======================================================

function loadAktivitas(data) {
  const tbody = document.getElementById("aktivitasTerbaru");

  if (data.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                Tidak ada aktivitas.
            </td>
        </tr>
        `;

    return;
  }

  tbody.innerHTML = data
    .map(
      (item) => `

        <tr>

            <td>${item.nama}</td>

            <td>${item.judul_kegiatan}</td>

            <td>${item.tanggal}</td>

            <td>
                <span class="badge bg-success">
                    Selesai
                </span>
            </td>

        </tr>

    `,
    )
    .join("");
}

// ======================================================
// BELUM ABSEN
// ======================================================

function loadBelumAbsen(data) {
  const tbody = document.getElementById("belumAbsen");

  if (data.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                Semua mahasiswa sudah hadir.
            </td>
        </tr>
        `;

    return;
  }

  tbody.innerHTML = data
    .map(
      (item) => `

        <tr>

            <td>${item.nim}</td>

            <td>${item.nama}</td>

            <td>${item.prodi}</td>

            <td>${item.nama_divisi}</td>

        </tr>

    `,
    )
    .join("");
}
