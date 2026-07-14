// ======================================================
// MAHASISWA AKTIVITAS
// ======================================================

let daftarAktivitas = [];

let idHapus = null;

let modalDetail = null;

let modalDelete = null;

// ======================================================
// INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  modalDetail = new bootstrap.Modal(document.getElementById("modalDetail"));

  modalDelete = new bootstrap.Modal(document.getElementById("modalDelete"));

  loadAktivitas();

  initPreviewFoto();
});

// ======================================================
// PREVIEW FOTO
// ======================================================

function initPreviewFoto() {
  const input = document.getElementById("foto");

  const preview = document.getElementById("previewFoto");

  input.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
      preview.src = "../assets/image/no-image.png";

      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// ======================================================
// LOAD DATA
// ======================================================

async function loadAktivitas() {
  try {
    daftarAktivitas = await getData("/mahasiswa/activity");

    renderTable();
  } catch (err) {
    console.log(err);

    document.getElementById("tableAktivitas").innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">
          Gagal mengambil data aktivitas.
        </td>
      </tr>
    `;
  }
}

// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",

    month: "long",

    year: "numeric",
  });
}

// ======================================================
// RENDER TABLE
// ======================================================

function renderTable() {
  const tbody = document.getElementById("tableAktivitas");

  if (!daftarAktivitas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">
          Belum ada aktivitas.
        </td>
      </tr>
    `;

    return;
  }

  let html = "";

  daftarAktivitas.forEach((item) => {
    const foto = item.foto ? `/uploads/${item.foto}` : "../assets/image/no-image.png";

    html += `

    <tr>

      <td>

        <img
          src="${foto}"
          class="table-foto">

      </td>

      <td>

        ${item.judul_kegiatan}

      </td>

      <td>

        ${formatTanggal(item.tanggal)}

      </td>

      <td>

        <span class="badge-upload">

          Sudah Upload

        </span>

      </td>

      <td>

        <div class="action-buttons">

          <button
            class="btn btn-info btn-sm"
            onclick="lihatDetail(${item.id})">

            <i class="fa fa-eye"></i>

          </button>

          <button
            class="btn btn-warning btn-sm"
            onclick="editAktivitas(${item.id})">

            <i class="fa fa-pen"></i>

          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="hapusAktivitas(${item.id})">

            <i class="fa fa-trash"></i>

          </button>

        </div>

      </td>

    </tr>

    `;
  });

  tbody.innerHTML = html;
}

// ======================================================
// SIMPAN AKTIVITAS
// ======================================================

async function simpanAktivitas() {
  const id = document.getElementById("idAktivitas").value;

  const judul = document.getElementById("judul_kegiatan").value.trim();

  const deskripsi = document.getElementById("deskripsi").value.trim();

  const tanggal = document.getElementById("tanggal").value;

  const fotoInput = document.getElementById("foto");

  if (!judul || !deskripsi || !tanggal) {
    alert("Semua data wajib diisi.");

    return;
  }

  let namaFoto = "";

  // ===============================
  // Upload Foto
  // ===============================

  if (fotoInput.files.length > 0) {
    const formData = new FormData();

    formData.append("foto", fotoInput.files[0]);

    try {
      const response = await fetch("/api/mahasiswa/activity/upload", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        namaFoto = hasil.filename;
      }
    } catch (err) {
      console.log(err);

      alert("Upload foto gagal.");

      return;
    }
  }

  const data = {
    judul_kegiatan: judul,

    deskripsi,

    tanggal,

    foto: namaFoto,
  };

  try {
    if (id) {
      await putData(`/mahasiswa/activity/${id}`, data);

      alert("Aktivitas berhasil diupdate.");
    } else {
      await postData("/mahasiswa/activity", data);

      alert("Aktivitas berhasil ditambahkan.");
    }

    resetForm();

    loadAktivitas();
  } catch (err) {
    console.log(err);

    alert("Gagal menyimpan data.");
  }
}

// ======================================================
// RESET FORM
// ======================================================

function resetForm() {
  document.getElementById("idAktivitas").value = "";

  document.getElementById("judul_kegiatan").value = "";

  document.getElementById("deskripsi").value = "";

  document.getElementById("tanggal").value = "";

  document.getElementById("foto").value = "";

  document.getElementById("previewFoto").src = "../assets/image/no-image.png";
}

// ======================================================
// DETAIL
// ======================================================

function lihatDetail(id) {
  const data = daftarAktivitas.find((item) => item.id == id);

  if (!data) return;

  document.getElementById("detailJudul").innerHTML = data.judul_kegiatan;

  document.getElementById("detailTanggal").innerHTML = formatTanggal(data.tanggal);

  document.getElementById("detailDeskripsi").innerHTML = data.deskripsi;

  document.getElementById("detailFoto").src = data.foto ? `/uploads/${data.foto}` : "../assets/image/no-image.png";

  modalDetail.show();
}

// ======================================================
// EDIT
// ======================================================

function editAktivitas(id) {
  const data = daftarAktivitas.find((item) => item.id == id);

  if (!data) return;

  document.getElementById("idAktivitas").value = data.id;

  document.getElementById("judul_kegiatan").value = data.judul_kegiatan;

  document.getElementById("deskripsi").value = data.deskripsi;

  document.getElementById("tanggal").value = data.tanggal;

  document.getElementById("previewFoto").src = data.foto ? `/uploads/${data.foto}` : "../assets/image/no-image.png";

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
}

// ======================================================
// HAPUS
// ======================================================

function hapusAktivitas(id) {
  idHapus = id;

  modalDelete.show();
}

document.getElementById("btnDelete").addEventListener("click", async () => {
  if (!idHapus) return;

  try {
    await deleteData(`/mahasiswa/activity/${idHapus}`);

    modalDelete.hide();

    loadAktivitas();

    alert("Aktivitas berhasil dihapus.");
  } catch (err) {
    console.log(err);

    alert("Gagal menghapus aktivitas.");
  }
});
