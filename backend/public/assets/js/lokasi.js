// =====================================
// MASTER LOKASI KKN
// Bagian 3.1
// =====================================

// -----------------------------
// Komponen HTML
// -----------------------------
const txtNama = document.getElementById("nama_lokasi");
const txtRadius = document.getElementById("radius");
const txtLatitude = document.getElementById("latitude");
const txtLongitude = document.getElementById("longitude");

const btnGPS = document.getElementById("btnGPS");
const btnSimpan = document.getElementById("btnSimpan");

const txtSearch = document.getElementById("searchLocation");
const btnCari = document.getElementById("btnCari");

// -----------------------------
// Default Lokasi
// (Monas Jakarta)
// nanti otomatis berubah jika
// lokasi database ditemukan
// -----------------------------
let latitude = -6.175392;

let longitude = 106.827153;

let radius = 100;

// -----------------------------
// Inisialisasi Map
// -----------------------------
const map = L.map("map", {
  zoomControl: true,
}).setView([latitude, longitude], 17);

// -----------------------------
// Tile OpenStreetMap
// -----------------------------
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 22,

  attribution: "&copy; OpenStreetMap Contributors",
}).addTo(map);

// -----------------------------
// Marker Posko
// -----------------------------
let marker = L.marker([latitude, longitude], {
  draggable: true,
}).addTo(map);

// -----------------------------
// Circle Radius
// -----------------------------
let circle = L.circle([latitude, longitude], {
  radius: radius,

  color: "#0d6efd",

  fillColor: "#0d6efd",

  fillOpacity: 0.2,

  weight: 2,
}).addTo(map);

// -----------------------------
// Popup
// -----------------------------
marker.bindPopup("Lokasi Posko KKN").openPopup();

// =====================================
// Sinkron Input
// =====================================
function updateInput() {
  txtLatitude.value = latitude.toFixed(6);

  txtLongitude.value = longitude.toFixed(6);
}

updateInput();

// =====================================
// Update Marker
// =====================================
function updateMarker() {
  marker.setLatLng([latitude, longitude]);

  circle.setLatLng([latitude, longitude]);

  circle.setRadius(Number(radius));

  updateInput();
}

// =====================================
// Klik Pada Map
// =====================================
map.on("click", function (e) {
  latitude = e.latlng.lat;

  longitude = e.latlng.lng;

  updateMarker();
});

// =====================================
// Drag Marker
// =====================================
marker.on("dragend", function (e) {
  const posisi = e.target.getLatLng();

  latitude = posisi.lat;

  longitude = posisi.lng;

  updateMarker();
});

// =====================================
// Radius Berubah
// =====================================
txtRadius.addEventListener("input", () => {
  radius = Number(txtRadius.value);

  if (radius <= 0) {
    radius = 100;
  }

  circle.setRadius(radius);
});

// =====================================
// Double Click Zoom Off
// supaya klik lebih nyaman
// =====================================
map.doubleClickZoom.disable();

// =====================================
// Resize Map
// =====================================
window.addEventListener("resize", () => {
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
});

// =====================================
// Fungsi Center Map
// =====================================
function centerMap() {
  map.flyTo([latitude, longitude], 18, {
    animate: true,

    duration: 1.2,
  });
}

// =====================================
// Tombol Keyboard
// Tekan C = Center
// =====================================
document.addEventListener("keydown", function (e) {
  if (e.key === "c") {
    centerMap();
  }
});

// =====================================
// BAGIAN 3.2
// GPS + SEARCH LOKASI
// =====================================

// -----------------------------
// Ambil Lokasi Saya
// -----------------------------
btnGPS.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung GPS.");

    return;
  }

  btnGPS.disabled = true;

  btnGPS.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengambil Lokasi...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude;

      longitude = position.coords.longitude;

      updateMarker();

      centerMap();

      btnGPS.disabled = false;

      btnGPS.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Ambil Lokasi Saya';
    },

    (err) => {
      console.log(err);

      alert("Tidak dapat mengambil lokasi.");

      btnGPS.disabled = false;

      btnGPS.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Ambil Lokasi Saya';
    },

    {
      enableHighAccuracy: true,

      timeout: 15000,

      maximumAge: 0,
    },
  );
});

// =====================================
// Cari Lokasi
// =====================================
async function cariLokasi() {
  const keyword = txtSearch.value.trim();

  if (keyword === "") {
    alert("Masukkan nama lokasi.");

    return;
  }

  btnCari.disabled = true;

  btnCari.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const response = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(keyword));

    const hasil = await response.json();

    if (hasil.length === 0) {
      alert("Lokasi tidak ditemukan.");

      btnCari.disabled = false;

      btnCari.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cari';

      return;
    }

    latitude = parseFloat(hasil[0].lat);

    longitude = parseFloat(hasil[0].lon);

    updateMarker();

    centerMap();

    marker.openPopup();
  } catch (err) {
    console.log(err);

    alert("Gagal mencari lokasi.");
  }

  btnCari.disabled = false;

  btnCari.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cari';
}

// =====================================
// Klik Tombol Cari
// =====================================
btnCari.addEventListener("click", cariLokasi);

// =====================================
// Tekan ENTER
// =====================================
txtSearch.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    cariLokasi();
  }
});

// =====================================
// Popup Marker Dinamis
// =====================================
marker.bindPopup(`
<b>Lokasi Posko KKN</b>
<br>
Geser marker atau klik peta
`);

// =====================================
// Update Popup Saat Marker Berubah
// =====================================
function refreshPopup() {
  marker.setPopupContent(`
        <b>Lokasi Posko KKN</b>

        <br><br>

        Latitude :
        <br>
        ${latitude.toFixed(6)}

        <br><br>

        Longitude :
        <br>
        ${longitude.toFixed(6)}

        <br><br>

        Radius :
        <b>${radius} meter</b>
    `);
}

setInterval(refreshPopup, 1000);

// =====================================
// BAGIAN 3.3
// LOAD & SIMPAN LOKASI
// =====================================

// -----------------------------
// Load Lokasi dari Database
// -----------------------------
async function loadLokasi() {
  try {
    const data = await getData("/lokasi");

    if (!data || data.message) {
      console.log("Belum ada lokasi tersimpan.");

      return;
    }

    txtNama.value = data.nama_lokasi || "";

    txtRadius.value = data.radius;

    latitude = parseFloat(data.latitude);

    longitude = parseFloat(data.longitude);

    radius = parseFloat(data.radius);

    updateMarker();

    centerMap();

    console.log("Lokasi berhasil dimuat.");
  } catch (err) {
    console.log(err);
  }
}

// -----------------------------
// Simpan Lokasi
// -----------------------------
btnSimpan.addEventListener("click", async () => {
  const nama = txtNama.value.trim();

  if (nama === "") {
    alert("Nama lokasi wajib diisi.");

    return;
  }

  btnSimpan.disabled = true;

  btnSimpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const hasil = await postData("/lokasi", {
      nama_lokasi: nama,

      latitude: latitude,

      longitude: longitude,

      radius: radius,
    });

    alert(hasil.message || "Lokasi berhasil disimpan.");
  } catch (err) {
    console.log(err);

    alert("Gagal menyimpan lokasi.");
  }

  btnSimpan.disabled = false;

  btnSimpan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Lokasi';
});

// -----------------------------
// Jalankan Saat Halaman Dibuka
// -----------------------------
window.addEventListener("load", () => {
  loadLokasi();
});
