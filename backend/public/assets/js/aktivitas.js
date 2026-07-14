const API = "/api/activity";

const authToken = localStorage.getItem("token");

// LOAD AKTIVITAS
async function loadAktivitas() {
  const response = await fetch(API, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  let html = "";

  data.forEach((item) => {
    html += `
      <tr>
        <td>${item.nama}</td>
        <td>${item.judul_kegiatan}</td>
        <td>${new Date(item.tanggal).toLocaleDateString("id-ID")}</td>

    
        <td>
          ${
            item.foto
              ? `<img
                    src="http://localhost:3000/uploads/${item.foto}"
                    class="foto-aktivitas"
                    alt="foto aktivitas">`
              : `<span class="no-foto">Tidak ada</span>`
          }
        </td>

       <td>
          <div class="btn-action">

            <button
              onclick="editAktivitas(${item.id})"
              class="btn btn-warning btn-sm">

              <i class="fa fa-pen"></i>
              Edit

            </button>

            <button
              onclick="hapusAktivitas(${item.id})"
              class="btn btn-danger btn-sm">

              <i class="fa fa-trash"></i>
              Hapus

            </button>

          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById("tableAktivitas").innerHTML = html;
}

// LOAD MAHASISWA
async function loadMahasiswa() {
  const response = await fetch("http://localhost:3000/api/mahasiswa", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  let option = `<option value="">Pilih Mahasiswa</option>`;

  data.forEach((item) => {
    option += `
      <option value="${item.id}">
        ${item.nama}
      </option>
    `;
  });

  document.getElementById("mahasiswa_id").innerHTML = option;
}

// SIMPAN
async function simpanAktivitas() {
  const id = document.getElementById("idAktivitas").value;

  let namaFile = "";

  const fotoInput = document.getElementById("foto");

  let file = null;

  if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
    file = fotoInput.files[0];
  }

  if (file) {
    const formData = new FormData();

    formData.append("foto", file);

    const uploadResponse = await fetch("http://localhost:3000/api/activity/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    namaFile = uploadResult.filename;
  }

  const body = {
    mahasiswa_id: document.getElementById("mahasiswa_id").value,

    judul_kegiatan: document.getElementById("judul_kegiatan").value,

    deskripsi: document.getElementById("deskripsi").value,

    tanggal: document.getElementById("tanggal").value,

    foto: namaFile,
  };

  let url = API;
  let method = "POST";

  if (id) {
    url = `${API}/${id}`;
    method = "PUT";
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  alert(result.message);

  loadAktivitas();

  bootstrap.Modal.getInstance(document.getElementById("modalAktivitas")).hide();
}

// EDIT
async function editAktivitas(id) {
  const response = await fetch(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  document.getElementById("idAktivitas").value = data.id;
  document.getElementById("mahasiswa_id").value = data.mahasiswa_id;
  document.getElementById("judul_kegiatan").value = data.judul_kegiatan;
  document.getElementById("deskripsi").value = data.deskripsi;
  document.getElementById("tanggal").value = data.tanggal;

  new bootstrap.Modal(document.getElementById("modalAktivitas")).show();
}

// DELETE
async function hapusAktivitas(id) {
  if (!confirm("Yakin ingin menghapus aktivitas ini?")) return;

  const response = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const result = await response.json();

  alert(result.message);

  loadAktivitas();
}

// UPLOAD FOTO
async function uploadFoto() {
  const file = document.getElementById("foto").files[0];

  const formData = new FormData();

  formData.append("foto", file);

  const response = await fetch("http://localhost:3000/api/activity/upload/1", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  const result = await response.json();

  alert(result.message);
}

loadAktivitas();
loadMahasiswa();
