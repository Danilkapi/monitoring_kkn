let dashboardChart = null;

async function loadDashboard() {
  try {
    const dashboardToken = localStorage.getItem("token");

    const response = await fetch("/api/dashboard", {
      headers: {
        Authorization: `Bearer ${dashboardToken}`,
      },
    });

    const data = await response.json();

    console.log("Dashboard:", data);

    document.getElementById("totalMahasiswa").innerText = data.total_mahasiswa;

    document.getElementById("totalDivisi").innerText = data.total_divisi;

    document.getElementById("totalHadir").innerText = data.total_kehadiran;

    document.getElementById("totalAktivitas").innerText = data.total_aktivitas;

    buatGrafik(data.grafik || []);

    renderAktivitas(data.aktivitas_terbaru || []);
  } catch (error) {
    console.error(error);
  }
}

function buatGrafik(grafik) {
  const ctx = document.getElementById("chartKehadiran");

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

function renderAktivitas(data) {
  const tbody = document.getElementById("aktivitasTerbaru");

  if (!tbody) return;

  if (!data || data.length === 0) {
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

            <td>${item.nama_divisi || "-"}</td>

            <td>${item.judul_kegiatan}</td>

            <td>${item.tanggal}</td>

        </tr>
    `,
    )
    .join("");
}

loadDashboard();
