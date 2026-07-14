// ========================================
// PENILAIAN DPL
// ========================================

// ---------- ELEMENT ----------

const tablePenilaian = document.getElementById("tablePenilaian");

const searchMahasiswa = document.getElementById("searchMahasiswa");
const filterDivisi = document.getElementById("filterDivisi");
const filterStatus = document.getElementById("filterStatus");
const btnRefresh = document.getElementById("btnRefresh");

const totalMahasiswa = document.getElementById("totalMahasiswa");
const sudahDinilai = document.getElementById("sudahDinilai");
const belumDinilai = document.getElementById("belumDinilai");
const rataNilai = document.getElementById("rataNilai");

const loadingOverlay = document.getElementById("loadingOverlay");

const toastElement = document.getElementById("liveToast");
const toastMessage = document.getElementById("toastMessage");

const btnSimpan = document.getElementById("btnSimpan");
const toast = new bootstrap.Toast(toastElement);

// ========================================
// LOADING
// ========================================

function showLoading() {
  loadingOverlay.style.display = "flex";
}

function hideLoading() {
  loadingOverlay.style.display = "none";
}

// ========================================
// TOAST
// ========================================

function showToast(message, success = true) {
  toastMessage.innerHTML = message;

  toastElement.classList.remove("text-bg-success", "text-bg-danger");

  toastElement.classList.add(success ? "text-bg-success" : "text-bg-danger");

  toast.show();
}

// ========================================
// LOAD STATISTIK
// ========================================

async function loadStatistik() {
  try {
    const data = await getData("/dpl/penilaian/statistik");

    totalMahasiswa.innerHTML = data.total_mahasiswa ?? 0;

    sudahDinilai.innerHTML = data.sudah_dinilai ?? 0;

    belumDinilai.innerHTML = data.belum_dinilai ?? 0;

    rataNilai.innerHTML = data.rata_nilai ?? 0;
  } catch (err) {
    console.log(err);
  }
}

// ========================================
// LOAD DIVISI
// ========================================

async function loadDivisi() {
  try {
    const data = await getData("/divisi");

    filterDivisi.innerHTML = `
            <option value="">
                Semua Divisi
            </option>
        `;

    data.forEach((divisi) => {
      filterDivisi.innerHTML += `
                <option value="${divisi.id}">
                    ${divisi.nama_divisi}
                </option>
            `;
    });
  } catch (err) {
    console.log(err);
  }
}

// ========================================
// LOAD DATA
// ========================================

async function loadPenilaian() {
  showLoading();

  try {
    const search = searchMahasiswa.value;

    const divisi = filterDivisi.value;

    const status = filterStatus.value;

    const data = await getData(`/dpl/penilaian?search=${search}&divisi=${divisi}&status=${status}`);

    renderTable(data);
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil data", false);
  } finally {
    hideLoading();
  }
}
// ========================================
// RENDER TABLE
// ========================================
function badgeStatus(status) {
  if (status === "Sudah Dinilai") {
    return `
        <span class="badge bg-success">

            Sudah Dinilai

        </span>
        `;
  }

  return `
    <span class="badge bg-warning text-dark">

        Belum Dinilai

    </span>
    `;
}

function tampilNilai(nilai) {
  if (nilai === "-" || nilai == null) {
    return `<span class="text-muted">
        Belum Ada
        </span>`;
  }

  return nilai;
}

function tampilGrade(grade) {
  if (grade === "-" || grade == null) {
    return "-";
  }

  return `
    <span class="badge bg-primary">

        ${grade}

    </span>
    `;
}

function renderTable(data) {
  tablePenilaian.innerHTML = "";

  if (data.length === 0) {
    tablePenilaian.innerHTML = `

            <tr>

                <td colspan="10"
                    class="text-center">

                    Belum ada data.

                </td>

            </tr>

        `;

    return;
  }

  data.forEach((item) => {
    tablePenilaian.innerHTML += `

        <tr>

            <td>

                <img
                    src="/uploads/profile/${item.foto || "default.png"}"
                    class="rounded-circle"
                    width="45"
                    height="45">

            </td>

            <td>${item.nim}</td>

            <td>${item.nama}</td>

            <td>${item.nama_divisi}</td>

            <td>

                <span class="badge bg-success">

                    ${item.total_hadir}

                </span>

            </td>

            <td>

                <span class="badge bg-info">

                    ${item.total_aktivitas}

                </span>

            </td>

            <td>

                ${tampilNilai(item.nilai)}

            </td>

            <td>

                 ${tampilGrade(item.grade)}

            </td>

            <td>

                ${badgeStatus(item.status)}

            </td>

            <td>

                <button
                    class="btn btn-success btn-sm"
                    onclick="openPenilaian(${item.id})">

                    <i class="fa-solid fa-star"></i>

                    Nilai

                </button>

            </td>

        </tr>

        `;
  });
}
// ========================================
// EVENT
// ========================================

btnRefresh.addEventListener("click", () => {
  loadPenilaian();

  loadStatistik();
});

searchMahasiswa.addEventListener("keyup", loadPenilaian);

filterDivisi.addEventListener("change", loadPenilaian);

filterStatus.addEventListener("change", loadPenilaian);

// ========================================
// INIT
// ========================================

loadStatistik();

loadDivisi();

loadPenilaian();

// ========================================
// MODAL PENILAIAN
// ========================================

const modalPenilaian = new bootstrap.Modal(document.getElementById("modalPenilaian"));

const mahasiswaId = document.getElementById("mahasiswaId");

const namaMahasiswa = document.getElementById("namaMahasiswa");

const nimMahasiswa = document.getElementById("nimMahasiswa");

const prodiMahasiswa = document.getElementById("prodiMahasiswa");

const divisiMahasiswa = document.getElementById("divisiMahasiswa");

const totalHadir = document.getElementById("totalHadir");

const totalAktivitas = document.getElementById("totalAktivitas");

const nilai = document.getElementById("nilai");

const grade = document.getElementById("grade");

const catatan = document.getElementById("catatan");

// ========================================
// BUKA MODAL
// ========================================

async function openPenilaian(id) {
  showLoading();

  try {
    const data = await getData(`/dpl/penilaian/${id}`);

    mahasiswaId.value = data.id;

    namaMahasiswa.value = data.nama;

    nimMahasiswa.value = data.nim;

    prodiMahasiswa.value = data.prodi;

    divisiMahasiswa.value = data.nama_divisi;

    totalHadir.innerHTML = data.total_hadir;

    totalAktivitas.innerHTML = data.total_aktivitas;

    nilai.value = data.nilai;

    grade.value = data.grade;

    catatan.value = data.catatan;

    modalPenilaian.show();
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil detail mahasiswa", false);
  } finally {
    hideLoading();
  }
}
// ========================================
// HITUNG GRADE
// ========================================

function hitungGrade(nilaiAngka) {
  nilaiAngka = parseFloat(nilaiAngka);

  if (isNaN(nilaiAngka)) return "";

  if (nilaiAngka >= 85) return "A";

  if (nilaiAngka >= 70) return "B";

  if (nilaiAngka >= 55) return "C";

  if (nilaiAngka >= 40) return "D";

  return "E";
}

nilai.addEventListener("input", () => {
  grade.value = hitungGrade(nilai.value);
});

// ========================================
// VALIDASI
// ========================================

function validasiForm() {
  if (nilai.value === "") {
    showToast("Nilai belum diisi", false);

    nilai.focus();

    return false;
  }

  if (nilai.value < 0 || nilai.value > 100) {
    showToast("Nilai harus antara 0 - 100", false);

    nilai.focus();

    return false;
  }

  return true;
}

// ========================================
// RESET FORM
// ========================================

function resetForm() {
  mahasiswaId.value = "";

  namaMahasiswa.value = "";

  nimMahasiswa.value = "";

  prodiMahasiswa.value = "";

  divisiMahasiswa.value = "";

  totalHadir.innerHTML = "0";

  totalAktivitas.innerHTML = "0";

  nilai.value = "";

  grade.value = "";

  catatan.value = "";
}

document.getElementById("modalPenilaian").addEventListener("hidden.bs.modal", () => {
  resetForm();
});

// ========================================
// SIMPAN PENILAIAN
// ========================================

btnSimpan.addEventListener("click", simpanPenilaian);

async function simpanPenilaian() {
  if (!validasiForm()) return;

  btnSimpan.disabled = true;

  btnSimpan.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Menyimpan...
    `;

  try {
    const response = await postData("/dpl/penilaian", {
      mahasiswa_id: mahasiswaId.value,
      nilai: nilai.value,
      catatan: catatan.value,
    });

    if (response.success) {
      modalPenilaian.hide();

      showToast(response.message, true);

      loadPenilaian();

      loadStatistik();
    } else {
      showToast(response.message, false);
    }
  } catch (err) {
    console.log(err);

    showToast("Terjadi kesalahan server", false);
  } finally {
    btnSimpan.disabled = false;

    btnSimpan.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Simpan Penilaian
        `;
  }
}
catatan.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    simpanPenilaian();
  }
});
