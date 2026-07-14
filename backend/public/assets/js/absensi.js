const API = "/api/absensi";
const authToken = localStorage.getItem("token");

// =======================
// LOAD DATA ABSENSI
// =======================
async function loadAbsensi() {
  try {
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

            <td>${new Date(item.tanggal).toLocaleDateString("id-ID")}</td>

            <td>${item.jam_masuk}</td>

            <td>${item.latitude ?? "-"}</td>

            <td>${item.longitude ?? "-"}</td>

            <td>
                ${item.status === "hadir" ? `<span class="badge bg-success">Hadir</span>` : item.status === "terlambat" ? `<span class="badge bg-warning text-dark">Terlambat</span>` : `<span class="badge bg-danger">Tidak Valid</span>`}
            </td>

            <td>

                <div class="btn-action">

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editAbsensi(${item.id})">

                        <i class="fa fa-pen"></i>

                        Edit

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="hapusAbsensi(${item.id})">

                        <i class="fa fa-trash"></i>

                        Hapus

                    </button>

                </div>

            </td>
        </tr>
      `;
    });

    document.getElementById("tableAbsensi").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// =======================
// LOAD MAHASISWA
// =======================
async function loadMahasiswa() {
  try {
    const response = await fetch("/api/mahasiswa", {
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
  } catch (err) {
    console.error(err);
  }
}

// =======================
// SIMPAN
// =======================
async function simpanAbsensi() {
  const id = document.getElementById("idAbsensi").value;

  const body = {
    mahasiswa_id: document.getElementById("mahasiswa_id").value,
    tanggal: document.getElementById("tanggal").value,
    jam_masuk: document.getElementById("jam_masuk").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
    status: document.getElementById("status").value,
  };

  let url = API;
  let method = "POST";

  if (id) {
    url = `${API}/${id}`;
    method = "PUT";
  }

  try {
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

    document.getElementById("idAbsensi").value = "";

    bootstrap.Modal.getInstance(document.getElementById("modalAbsensi")).hide();

    loadAbsensi();
  } catch (err) {
    console.error(err);
  }
}

// =======================
// EDIT
// =======================
async function editAbsensi(id) {
  try {
    const response = await fetch(`${API}/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    document.getElementById("idAbsensi").value = data.id;
    document.getElementById("mahasiswa_id").value = data.mahasiswa_id;
    document.getElementById("tanggal").value = data.tanggal;
    document.getElementById("jam_masuk").value = data.jam_masuk;
    document.getElementById("latitude").value = data.latitude;
    document.getElementById("longitude").value = data.longitude;
    document.getElementById("status").value = data.status;

    new bootstrap.Modal(document.getElementById("modalAbsensi")).show();
  } catch (err) {
    console.error(err);
  }
}

// =======================
// DELETE
// =======================
async function hapusAbsensi(id) {
  if (!confirm("Yakin ingin menghapus data absensi?")) return;

  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const result = await response.json();

    alert(result.message);

    loadAbsensi();
  } catch (err) {
    console.error(err);
  }
}

// =======================
// SEARCH
// =======================
const search = document.getElementById("searchAbsensi");

if (search) {
  search.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    document.querySelectorAll("#tableAbsensi tr").forEach((row) => {
      row.style.display = row.innerText.toLowerCase().includes(keyword) ? "" : "none";
    });
  });
}

// ========================
// AMBIL LOKASI GPS
// ========================

function ambilLokasi() {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung GPS");

    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      document.getElementById("latitude").value = position.coords.latitude;

      document.getElementById("longitude").value = position.coords.longitude;

      document.getElementById("mapsFrame").src = `https://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&z=17&output=embed`;

      alert("Lokasi berhasil diambil.");
    },

    function (error) {
      alert("Gagal mengambil lokasi.");

      console.log(error);
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

// =======================
// INIT
// =======================
loadAbsensi();
loadMahasiswa();
