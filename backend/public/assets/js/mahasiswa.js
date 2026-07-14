// ==========================================================
// GLOBAL
// ==========================================================

let daftarMahasiswa = [];

let daftarDivisi = [];

const modalMahasiswa = new bootstrap.Modal(document.getElementById("modalMahasiswa"));

// ==========================================================
// INIT
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  loadDivisi();

  loadMahasiswa();
});

// ==========================================================
// LOADING
// ==========================================================

function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("d-none");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("d-none");
}

// ==========================================================
// LOAD DIVISI
// ==========================================================

async function loadDivisi() {
  try {
    daftarDivisi = await getData("/divisi");

    const select = document.getElementById("divisi_id");

    select.innerHTML = "";

    daftarDivisi.forEach((divisi) => {
      select.innerHTML += `
                <option value="${divisi.id}">
                    ${divisi.nama_divisi}
                </option>
            `;
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================================
// LOAD MAHASISWA
// ==========================================================

async function loadMahasiswa() {
  try {
    showLoading();

    daftarMahasiswa = await getData("/mahasiswa");

    renderMahasiswa(daftarMahasiswa);
  } catch (err) {
    console.error(err);

    showToast("Gagal memuat data mahasiswa");
  } finally {
    hideLoading();
  }
}

// ==========================================================
// RENDER TABLE
// ==========================================================

function renderMahasiswa(data) {
  const tbody = document.getElementById("tableMahasiswa");

  tbody.innerHTML = "";

  document.getElementById("jumlahMahasiswa").innerHTML = `${data.length} Mahasiswa`;

  if (data.length === 0) {
    tbody.innerHTML = `
            <tr>

                <td colspan="7" class="text-center p-5">

                    <i class="fa-solid fa-inbox fa-3x text-secondary mb-3"></i>

                    <br>

                    Belum ada data mahasiswa.

                </td>

            </tr>
        `;

    return;
  }

  data.forEach((item, index) => {
    tbody.innerHTML += `
            <tr>

                <td>${item.nim}</td>

                <td>

                    <strong>${item.nama}</strong>

                </td>

                <td>${item.prodi}</td>

                <td>${item.nama_divisi}</td>

                <td>

                    ${badgeJabatan(item.jabatan)}

                </td>

                <td>${item.no_hp}</td>

                <td>

                    <div class="action-btn">

                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editMahasiswa(${item.id})"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="hapusMahasiswa(${item.id})"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>
        `;
  });
}

// ==========================================================
// BADGE JABATAN
// ==========================================================

function badgeJabatan(jabatan) {
  switch (jabatan) {
    case "ketua":
      return `<span class="badge bg-danger">Ketua</span>`;

    case "sekretaris":
      return `<span class="badge bg-primary">Sekretaris</span>`;

    case "bendahara":
      return `<span class="badge bg-success">Bendahara</span>`;

    default:
      return `<span class="badge bg-secondary">Anggota</span>`;
  }
}

// ==========================================================
// RESET FORM
// ==========================================================

function resetForm() {
  document.getElementById("idMahasiswa").value = "";

  document.getElementById("nim").value = "";

  document.getElementById("nama").value = "";

  document.getElementById("prodi").value = "";

  document.getElementById("no_hp").value = "";

  document.getElementById("jabatan").value = "anggota";

  if (daftarDivisi.length > 0) {
    document.getElementById("divisi_id").value = daftarDivisi[0].id;
  }
}

// ==========================================================
// BUKA MODAL TAMBAH
// ==========================================================

document.getElementById("modalMahasiswa").addEventListener("show.bs.modal", function (event) {
  const tombol = event.relatedTarget;

  if (tombol) {
    resetForm();
  }
});

// ==========================================================
// EDIT MAHASISWA
// ==========================================================

function editMahasiswa(id) {
  const mahasiswa = daftarMahasiswa.find((item) => item.id == id);

  if (!mahasiswa) return;

  document.getElementById("idMahasiswa").value = mahasiswa.id;

  document.getElementById("nim").value = mahasiswa.nim;

  document.getElementById("nama").value = mahasiswa.nama;

  document.getElementById("prodi").value = mahasiswa.prodi;

  document.getElementById("no_hp").value = mahasiswa.no_hp;

  document.getElementById("jabatan").value = mahasiswa.jabatan;

  document.getElementById("divisi_id").value = mahasiswa.divisi_id;

  modalMahasiswa.show();
}

// ==========================================================
// SIMPAN
// ==========================================================

async function simpanMahasiswa() {
  const id = document.getElementById("idMahasiswa").value;

  const data = {
    nim: document.getElementById("nim").value.trim(),

    nama: document.getElementById("nama").value.trim(),

    prodi: document.getElementById("prodi").value.trim(),

    no_hp: document.getElementById("no_hp").value.trim(),

    jabatan: document.getElementById("jabatan").value,

    divisi_id: document.getElementById("divisi_id").value,
  };

  // ================= VALIDASI =================

  if (!data.nim) {
    return showToast("NIM wajib diisi");
  }

  if (!data.nama) {
    return showToast("Nama wajib diisi");
  }

  if (!data.prodi) {
    return showToast("Program Studi wajib diisi");
  }

  if (!data.no_hp) {
    return showToast("Nomor HP wajib diisi");
  }

  try {
    showLoading();

    if (id == "") {
      await postData("/mahasiswa", data);

      showToast("Mahasiswa berhasil ditambahkan");
    } else {
      await putData(`/mahasiswa/${id}`, data);

      showToast("Mahasiswa berhasil diperbarui");
    }

    modalMahasiswa.hide();

    loadMahasiswa();
  } catch (err) {
    console.error(err);

    showToast("Gagal menyimpan data");
  } finally {
    hideLoading();
  }
}

// ==========================================================
// HAPUS MAHASISWA
// ==========================================================

async function hapusMahasiswa(id) {
  const mahasiswa = daftarMahasiswa.find((item) => item.id == id);

  if (!mahasiswa) return;

  const konfirmasi = confirm(`Yakin ingin menghapus mahasiswa\n\n${mahasiswa.nama} ?`);

  if (!konfirmasi) return;

  try {
    showLoading();

    await deleteData(`/mahasiswa/${id}`);

    showToast("Data mahasiswa berhasil dihapus");

    loadMahasiswa();
  } catch (err) {
    console.error(err);

    showToast("Gagal menghapus data");
  } finally {
    hideLoading();
  }
}

// ==========================================================
// SEARCH REALTIME
// ==========================================================

document.getElementById("searchMahasiswa").addEventListener("keyup", function () {
  const keyword = this.value.toLowerCase();

  const hasil = daftarMahasiswa.filter((item) => {
    return item.nama.toLowerCase().includes(keyword) || item.nim.toLowerCase().includes(keyword) || item.prodi.toLowerCase().includes(keyword) || item.nama_divisi.toLowerCase().includes(keyword);
  });

  renderMahasiswa(hasil);
});

// ==========================================================
// REFRESH
// ==========================================================

function refreshMahasiswa() {
  document.getElementById("searchMahasiswa").value = "";

  loadMahasiswa();
}

// ==========================================================
// EMPTY SEARCH
// ==========================================================

function renderMahasiswa(data) {
  const tbody = document.getElementById("tableMahasiswa");

  tbody.innerHTML = "";

  document.getElementById("jumlahMahasiswa").innerHTML = `${data.length} Mahasiswa`;

  if (data.length === 0) {
    tbody.innerHTML = `

        <tr>

            <td colspan="7" class="text-center p-5">

                <i
                    class="fa-solid fa-magnifying-glass fa-3x
                    text-secondary mb-3"
                ></i>

                <h5>

                    Data tidak ditemukan

                </h5>

                <p class="text-muted">

                    Coba gunakan kata kunci lain.

                </p>

            </td>

        </tr>

        `;

    return;
  }

  data.forEach((item) => {
    tbody.innerHTML += `

        <tr>

            <td>${item.nim}</td>

            <td>

                <strong>${item.nama}</strong>

            </td>

            <td>${item.prodi}</td>

            <td>${item.nama_divisi}</td>

            <td>

                ${badgeJabatan(item.jabatan)}

            </td>

            <td>${item.no_hp}</td>

            <td>

                <div class="action-btn">

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editMahasiswa(${item.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="hapusMahasiswa(${item.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

        `;
  });
}

// ==========================================================
// TOAST
// ==========================================================

function showToast(message, type = "success") {
  const toastEl = document.getElementById("liveToast");

  const toastBody = document.getElementById("toastMessage");

  toastBody.innerHTML = message;

  const headerIcon = toastEl.querySelector(".toast-header i");

  headerIcon.className = "";

  switch (type) {
    case "success":
      headerIcon.className = "fa-solid fa-circle-check text-success me-2";

      break;

    case "error":
      headerIcon.className = "fa-solid fa-circle-xmark text-danger me-2";

      break;

    case "warning":
      headerIcon.className = "fa-solid fa-triangle-exclamation text-warning me-2";

      break;

    default:
      headerIcon.className = "fa-solid fa-circle-info text-primary me-2";
  }

  const toast = new bootstrap.Toast(toastEl);

  toast.show();
}

// ==========================================================
// ENTER UNTUK SEARCH
// ==========================================================

document.getElementById("searchMahasiswa").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

// ==========================================================
// ESC UNTUK RESET SEARCH
// ==========================================================

document.getElementById("searchMahasiswa").addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    this.value = "";

    renderMahasiswa(daftarMahasiswa);
  }
});

// ==========================================================
// AUTO FOCUS
// ==========================================================

document.getElementById("modalMahasiswa").addEventListener("shown.bs.modal", () => {
  document.getElementById("nim").focus();
});

// ==========================================================
// RESET SETELAH MODAL DITUTUP
// ==========================================================

document.getElementById("modalMahasiswa").addEventListener("hidden.bs.modal", () => {
  resetForm();
});

// ==========================================================
// FORMAT NOMOR HP
// ==========================================================

document.getElementById("no_hp").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

// ==========================================================
// FORMAT NIM
// ==========================================================

document.getElementById("nim").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

// ==========================================================
// REFRESH DATA SETIAP 60 DETIK
// ==========================================================

setInterval(() => {
  if (document.visibilityState === "visible") {
    loadMahasiswa();
  }
}, 60000);

// ==========================================================
// END
// ==========================================================

console.log("Mahasiswa.js Loaded");
