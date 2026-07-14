/* ======================================================
   LAPORAN.JS
====================================================== */

// ==========================================
// ELEMENT
// ==========================================

const jenisLaporan = document.getElementById("jenisLaporan");
const divisiFilter = document.getElementById("divisiFilter");
const mahasiswaFilter = document.getElementById("mahasiswaFilter");

const tanggalAwal = document.getElementById("tanggalAwal");
const tanggalAkhir = document.getElementById("tanggalAkhir");

const laporanHead = document.getElementById("laporanHead");
const laporanBody = document.getElementById("laporanBody");

// ==========================================
// INIT
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadDivisi();

  await loadMahasiswa();
});

// ==========================================
// LOAD DIVISI
// ==========================================

async function loadDivisi() {
  try {
    const result = await getData("/divisi");

    divisiFilter.innerHTML = `<option value="">Semua Divisi</option>`;

    if (!result.success) return;

    result.data.forEach((divisi) => {
      divisiFilter.innerHTML += `
                <option value="${divisi.id}">
                    ${divisi.nama_divisi}
                </option>
            `;
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// LOAD MAHASISWA
// ==========================================

async function loadMahasiswa() {
  try {
    const result = await getData("/mahasiswa");

    mahasiswaFilter.innerHTML = `<option value="">Semua Mahasiswa</option>`;

    if (!result.success) return;

    result.data.forEach((mhs) => {
      mahasiswaFilter.innerHTML += `
                <option value="${mhs.id}">
                    ${mhs.nama}
                </option>
            `;
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// FILTER DIVISI
// ==========================================

divisiFilter.addEventListener("change", async () => {
  try {
    const divisi = divisiFilter.value;

    const result = await getData("/mahasiswa");

    mahasiswaFilter.innerHTML = `<option value="">Semua Mahasiswa</option>`;

    if (!result.success) return;

    let data = result.data;

    if (divisi !== "") {
      data = data.filter((item) => item.divisi_id == divisi);
    }

    data.forEach((mhs) => {
      mahasiswaFilter.innerHTML += `
                <option value="${mhs.id}">
                    ${mhs.nama}
                </option>
            `;
    });
  } catch (err) {
    console.error(err);
  }
});

/* ======================================================
   PREVIEW LAPORAN
====================================================== */

async function previewLaporan() {
  try {
    laporanBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center">
                    Memuat data...
                </td>
            </tr>
        `;

    const jenis = jenisLaporan.value;

    const params = new URLSearchParams({
      divisi: divisiFilter.value,

      mahasiswa: mahasiswaFilter.value,

      tanggal_awal: tanggalAwal.value,

      tanggal_akhir: tanggalAkhir.value,
    });

    let endpoint = "";

    switch (jenis) {
      case "absensi":
        endpoint = "/laporan/absensi";
        break;

      case "aktivitas":
        endpoint = "/laporan/aktivitas";
        break;

      case "mahasiswa":
        endpoint = "/laporan/mahasiswa";
        break;

      case "divisi":
        endpoint = "/laporan/divisi";
        break;

      default:
        endpoint = "/laporan/absensi";
    }

    const result = await getData(`${endpoint}?${params.toString()}`);

    if (!result.success) {
      laporanBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;color:red">
                        ${result.message}
                    </td>
                </tr>
            `;

      return;
    }

    ubahHeader(jenis);

    renderData(jenis, result.data);
  } catch (err) {
    console.error(err);

    laporanBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;color:red">
                    Terjadi kesalahan saat mengambil data.
                </td>
            </tr>
        `;
  }
}

/* ======================================================
   HEADER DINAMIS
====================================================== */

function ubahHeader(jenis) {
  switch (jenis) {
    case "absensi":
      laporanHead.innerHTML = `
                <tr>

                    <th>No</th>

                    <th>Mahasiswa</th>

                    <th>Divisi</th>

                    <th>Tanggal</th>

                    <th>Jam Masuk</th>

                    <th>Status</th>

                </tr>
            `;

      break;

    case "aktivitas":
      laporanHead.innerHTML = `
                <tr>

                    <th>No</th>

                    <th>Mahasiswa</th>

                    <th>Judul</th>

                    <th>Tanggal</th>

                    <th>Deskripsi</th>

                </tr>
            `;

      break;

    case "mahasiswa":
      laporanHead.innerHTML = `
                <tr>

                    <th>No</th>

                    <th>Nama</th>

                    <th>NIM</th>

                    <th>Divisi</th>

                    <th>No HP</th>

                </tr>
            `;

      break;

    case "divisi":
      laporanHead.innerHTML = `
                <tr>

                    <th>No</th>

                    <th>Nama Divisi</th>

                    <th>Deskripsi</th>

                    <th>Jumlah Mahasiswa</th>

                </tr>
            `;

      break;
  }
}

/* ======================================================
   ROUTER RENDER
====================================================== */

function renderData(jenis, data) {
  switch (jenis) {
    case "absensi":
      renderAbsensi(data);

      break;

    case "aktivitas":
      renderAktivitas(data);

      break;

    case "mahasiswa":
      renderMahasiswa(data);

      break;

    case "divisi":
      renderDivisi(data);

      break;
  }
}
/* ======================================================
   RENDER ABSENSI
====================================================== */

function renderAbsensi(data) {
  if (!data || data.length === 0) {
    laporanBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center">
                    Tidak ada data.
                </td>
            </tr>
        `;

    return;
  }

  laporanBody.innerHTML = "";

  data.forEach((item, index) => {
    laporanBody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.nama_mahasiswa}</td>

                <td>${item.nama_divisi}</td>

                <td>${formatTanggal(item.tanggal)}</td>

                <td>${item.jam_masuk}</td>

                <td>

                    <span class="badge ${badgeStatus(item.status)}">

                        ${item.status}

                    </span>

                </td>

            </tr>
        `;
  });
}

/* ======================================================
   RENDER AKTIVITAS
====================================================== */

function renderAktivitas(data) {
  if (!data || data.length === 0) {
    laporanBody.innerHTML = `
            <tr>

                <td colspan="5" style="text-align:center">

                    Tidak ada data.

                </td>

            </tr>
        `;

    return;
  }

  laporanBody.innerHTML = "";

  data.forEach((item, index) => {
    laporanBody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.nama_mahasiswa}</td>

                <td>${item.judul_kegiatan}</td>

                <td>${formatTanggal(item.tanggal)}</td>

                <td>${item.deskripsi}</td>

            </tr>
        `;
  });
}

/* ======================================================
   RENDER MAHASISWA
====================================================== */

function renderMahasiswa(data) {
  if (!data || data.length === 0) {
    laporanBody.innerHTML = `
            <tr>

                <td colspan="5" style="text-align:center">

                    Tidak ada data.

                </td>

            </tr>
        `;

    return;
  }

  laporanBody.innerHTML = "";

  data.forEach((item, index) => {
    laporanBody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.nama}</td>

                <td>${item.nim}</td>

                <td>${item.nama_divisi}</td>

                <td>${item.no_hp}</td>

            </tr>
        `;
  });
}

/* ======================================================
   RENDER DIVISI
====================================================== */

function renderDivisi(data) {
  if (!data || data.length === 0) {
    laporanBody.innerHTML = `
            <tr>

                <td colspan="4" style="text-align:center">

                    Tidak ada data.

                </td>

            </tr>
        `;

    return;
  }

  laporanBody.innerHTML = "";

  data.forEach((item, index) => {
    laporanBody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.nama_divisi}</td>

                <td>${item.deskripsi}</td>

                <td>${item.total_mahasiswa}</td>

            </tr>
        `;
  });
}

/* ======================================================
   BADGE STATUS
====================================================== */

function badgeStatus(status) {
  switch ((status || "").toLowerCase()) {
    case "hadir":
      return "bg-success";

    case "terlambat":
      return "bg-warning text-dark";

    case "tidak_valid":
      return "bg-danger";

    default:
      return "bg-secondary";
  }
}

/* ======================================================
   FORMAT TANGGAL
====================================================== */

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const tgl = new Date(tanggal);

  return tgl.toLocaleDateString("id-ID", {
    day: "2-digit",

    month: "long",

    year: "numeric",
  });
}

/* ======================================================
   DOWNLOAD PDF
====================================================== */

function downloadPDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF("l", "mm", "a4");

  doc.setFontSize(18);

  doc.text("Laporan Monitoring KKN", 14, 18);

  doc.setFontSize(11);

  doc.text(`Tanggal Cetak : ${new Date().toLocaleDateString("id-ID")}`, 14, 26);

  const headers = [];

  document.querySelectorAll("#laporanHead th").forEach((th) => {
    headers.push(th.innerText);
  });

  const rows = [];

  document.querySelectorAll("#laporanBody tr").forEach((tr) => {
    const row = [];

    tr.querySelectorAll("td").forEach((td) => {
      row.push(td.innerText);
    });

    if (row.length > 0) {
      rows.push(row);
    }
  });

  doc.autoTable({
    head: [headers],

    body: rows,

    startY: 35,

    styles: {
      fontSize: 9,
    },

    headStyles: {
      fillColor: [13, 110, 253],
    },
  });

  const jenis = jenisLaporan.value;

  doc.save(`Laporan_${jenis}_${Date.now()}.pdf`);
}

/* ======================================================
   DOWNLOAD EXCEL
====================================================== */

function downloadExcel() {
  const table = document.querySelector(".table-dashboard");

  const workbook = XLSX.utils.table_to_book(table, {
    sheet: "Laporan",
  });

  const jenis = jenisLaporan.value;

  XLSX.writeFile(
    workbook,

    `Laporan_${jenis}_${Date.now()}.xlsx`,
  );
}

/* ======================================================
   HELPER
====================================================== */

function resetPreview() {
  laporanHead.innerHTML = `
        <tr>

            <th>No</th>

            <th>Data</th>

        </tr>
    `;

  laporanBody.innerHTML = `
        <tr>

            <td colspan="2" style="text-align:center">

                Silakan klik Preview

            </td>

        </tr>
    `;
}

/* ======================================================
   AUTO RESET SAAT FILTER BERUBAH
====================================================== */

[jenisLaporan, divisiFilter, mahasiswaFilter, tanggalAwal, tanggalAkhir].forEach((item) => {
  item.addEventListener("change", resetPreview);
});
