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
  } catch (error) {
    console.error(error);
  }
}

loadDashboard();
