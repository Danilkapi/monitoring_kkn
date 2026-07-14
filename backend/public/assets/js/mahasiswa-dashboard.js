let chart = null;

async function loadDashboard() {
  try {
    const data = await getData("/mahasiswa/dashboard");

    console.log(data);

    document.getElementById("statusHariIni").textContent = data.status || "-";

    document.getElementById("totalAktivitas").textContent = data.aktivitas ?? 0;

    document.getElementById("persentase").textContent = (data.persentase ?? 0) + "%";

    if (document.getElementById("chartKehadiran")) {
      buatGrafik(data.grafik || []);
    }
  } catch (err) {
    console.error(err);
  }
}

function buatGrafik(grafik) {
  const hari = grafik.map((item) => item.hari);

  const jumlah = grafik.map((item) => item.jumlah);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chartKehadiran"), {
    type: "bar",
    data: {
      labels: hari,
      datasets: [
        {
          label: "Kehadiran",
          data: jumlah,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

loadDashboard();
