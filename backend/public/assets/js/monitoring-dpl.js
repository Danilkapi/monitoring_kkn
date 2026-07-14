// ======================================================
// MONITORING DPL
// ======================================================

let map;
let markers = [];

// ======================================================
// INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  initMap();
  loadDivisi();
  loadMonitoring();

  document.getElementById("btnRefresh").addEventListener("click", loadMonitoring);

  document.getElementById("searchMahasiswa").addEventListener("keyup", loadMonitoring);

  document.getElementById("filterDivisi").addEventListener("change", loadMonitoring);

  document.getElementById("filterStatus").addEventListener("change", loadMonitoring);
});

// ======================================================
// USER
// ======================================================

function loadUser() {
  document.getElementById("namaUser").textContent = localStorage.getItem("nama") || "DPL";
}

// ======================================================
// LOADING
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

  body.textContent = message;

  toast.classList.remove("text-bg-success");
  toast.classList.remove("text-bg-danger");

  toast.classList.add(success ? "text-bg-success" : "text-bg-danger");

  bootstrap.Toast.getOrCreateInstance(toast).show();
}

// ======================================================
// LOAD DIVISI
// ======================================================

async function loadDivisi() {
  try {
    const data = await getData("/divisi");

    const select = document.getElementById("filterDivisi");

    select.innerHTML = `<option value="">Semua Divisi</option>`;

    data.forEach((item) => {
      select.innerHTML += `
        <option value="${item.id}">
            ${item.nama_divisi}
        </option>
      `;
    });
  } catch (err) {
    console.log(err);
  }
}

// ======================================================
// MAP
// ======================================================

function initMap() {
  map = L.map("map").setView([-6.055, 106.41], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);
}

// ======================================================
// LOAD DATA
// ======================================================

async function loadMonitoring() {
  try {
    showLoading(true);

    const search = document.getElementById("searchMahasiswa").value;

    const divisi = document.getElementById("filterDivisi").value;

    const status = document.getElementById("filterStatus").value;

    const data = await getData(`/dpl/monitoring?search=${encodeURIComponent(search)}&divisi=${divisi}&status=${status}`);

    renderTable(data);

    tampilkanMarker(data);
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil data.", false);
  } finally {
    showLoading(false);
  }
}

// ======================================================
// TABLE
// ======================================================

function renderTable(data) {
  const tbody = document.getElementById("tableMonitoring");

  if (!data.length) {
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                Tidak ada data.
            </td>
        </tr>
        `;

    return;
  }

  tbody.innerHTML = data
    .map((item) => {
      let badge = "bg-secondary";
      let text = "Belum Hadir";

      if (item.status === "hadir") {
        badge = "bg-success";
        text = "Hadir";
      }

      if (item.status === "terlambat") {
        badge = "bg-warning";
        text = "Terlambat";
      }

      if (item.status === "tidak_valid") {
        badge = "bg-danger";
        text = "Tidak Valid";
      }

      const foto = item.foto ? `/uploads/profile/${item.foto}` : "../assets/image/user.png";

      return `
<tr>

<td>
<img
src="${foto}"
width="45"
height="45"
class="rounded-circle"
style="object-fit:cover"
onerror="this.src='../assets/image/user.png'">
</td>

<td>${item.nim}</td>

<td>${item.nama}</td>

<td>${item.nama_divisi ?? "-"}</td>

<td>
<span class="badge ${badge}">
${text}
</span>
</td>

<td>${item.jam_masuk ?? "-"}</td>

<td>${item.aktivitas ?? "-"}</td>

<td>

<button
class="btn btn-info btn-sm me-1"
onclick="lihatDetail(${item.id})">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="btn btn-success btn-sm"
onclick="lihatLokasi(${item.latitude},${item.longitude})">

<i class="fa-solid fa-location-dot"></i>

</button>

</td>

</tr>
`;
    })
    .join("");
}

// ======================================================
// MARKER
// ======================================================

function clearMarker() {
  markers.forEach((m) => map.removeLayer(m));

  markers = [];
}

function tampilkanMarker(data) {
  clearMarker();

  data.forEach((item) => {
    if (!item.latitude || !item.longitude) return;

    let color = "blue";

    if (item.status === "hadir") color = "green";

    if (item.status === "terlambat") color = "orange";

    if (item.status === "tidak_valid") color = "red";

    const icon = L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const marker = L.marker([item.latitude, item.longitude], {
      icon,
    }).addTo(map);

    marker.bindPopup(`
        <b>${item.nama}</b><br>
        ${item.nim}<br>
        ${item.nama_divisi ?? "-"}<br>
        ${item.status ?? "Belum Hadir"}
    `);

    markers.push(marker);
  });

  if (markers.length > 0) {
    const group = new L.featureGroup(markers);

    map.fitBounds(group.getBounds().pad(0.2));
  }
}

// ======================================================
// LIHAT LOKASI
// ======================================================

function lihatLokasi(lat, lng) {
  if (!lat || !lng) {
    showToast("Lokasi mahasiswa belum tersedia.", false);

    return;
  }

  map.setView([lat, lng], 18);

  L.popup().setLatLng([lat, lng]).setContent("Lokasi Mahasiswa").openOn(map);
}

// ======================================================
//  DETAIL MAHASASISWA
// ======================================================

async function lihatDetail(id) {
  const data = await getData("/dpl/monitoring/" + id);

  alert(
    `Nama : ${data.nama}

NIM : ${data.nim}

Prodi : ${data.prodi}

Divisi : ${data.nama_divisi}

Status : ${data.status || "Belum Hadir"}

Aktivitas : ${data.aktivitas || "-"}`,
  );
}
