// ======================================================
// PROFIL MAHASISWA
// ======================================================

let dataProfil = {};
let fotoProfilBaru = "";
let formChanged = false;

// ======================================================
// INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  loadProfil();

  initUploadFoto();
});

// ======================================================
// LOAD PROFIL
// ======================================================

async function loadProfil() {
  try {
    showLoading(true);

    const result = await getData("/mahasiswa/profile");

    dataProfil = result;

    tampilkanProfil(result);
  } catch (err) {
    console.error(err);

    showToast("Gagal mengambil data profil.", false);
  } finally {
    showLoading(false);
  }
}

// ======================================================
// INIT UPLOAD FOTO
// ======================================================

function initUploadFoto() {
  const input = document.getElementById("uploadFoto");

  if (!input) return;

  input.addEventListener("change", uploadFotoProfil);
}

// ======================================================
// UPLOAD FOTO PROFIL
// ======================================================

async function uploadFotoProfil(e) {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("foto", file);

  try {
    showLoading(true);

    const response = await fetch("http://localhost:3000/api/mahasiswa/profile/upload", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    fotoProfilBaru = result.filename;

    document.getElementById("fotoProfil").src = `http://localhost:3000/uploads/profile/${result.filename}`;

    showToast("Foto profil berhasil diupload.", true);
  } catch (err) {
    console.error(err);

    showToast("Upload foto gagal.", false);
  } finally {
    showLoading(false);
  }
}

// ======================================================
// TAMPILKAN PROFIL
// ======================================================

function tampilkanProfil(data) {
  // ======================================
  // HEADER
  // ======================================

  const profileNama = document.getElementById("profileNama");
  const profileProdi = document.getElementById("profileProdi");
  const profileJabatan = document.getElementById("profileJabatan");

  if (profileNama) profileNama.textContent = data.nama;

  if (profileProdi) profileProdi.textContent = data.prodi;

  if (profileJabatan) {
    profileJabatan.textContent = capitalize(data.jabatan);
  }

  // ======================================
  // BIODATA
  // ======================================

  const idMahasiswa = document.getElementById("idMahasiswa");
  const nim = document.getElementById("nim");
  const nama = document.getElementById("nama");
  const prodi = document.getElementById("prodi");
  const noHp = document.getElementById("no_hp");
  const divisi = document.getElementById("divisi");
  const jabatan = document.getElementById("jabatan");

  if (idMahasiswa) idMahasiswa.value = data.id;

  if (nim) nim.value = data.nim;

  if (nama) nama.value = data.nama;

  if (prodi) prodi.value = data.prodi;

  if (noHp) noHp.value = data.no_hp || "";

  if (divisi) divisi.value = data.nama_divisi || "-";

  if (jabatan) jabatan.value = capitalize(data.jabatan);

  // ======================================
  // AKUN
  // ======================================

  const email = document.getElementById("email");

  const role = document.getElementById("role");

  if (email) {
    email.value = data.email;
  }

  if (role) {
    role.value = capitalize(data.role);
  }

  // ======================================
  // NAVBAR
  // ======================================

  const navbarNama = document.getElementById("namaUser");

  if (navbarNama) {
    navbarNama.textContent = data.nama;
  }

  // ======================================
  // FOTO PROFIL
  // ======================================

  const foto = document.getElementById("fotoProfil");

  if (foto) {
    if (data.foto && data.foto !== "") {
      foto.src = `http://localhost:3000/uploads/profile/${data.foto}`;
    } else {
      foto.src = "../assets/image/default-user.png";
    }
  }
}

// ======================================================
// CAPITALIZE
// ======================================================

function capitalize(text) {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ======================================================
// SHOW LOADING
// ======================================================

function showLoading(show = true) {
  const loading = document.getElementById("loadingOverlay");

  if (!loading) return;

  loading.style.display = show ? "flex" : "none";
}

// ======================================================
// SHOW TOAST
// ======================================================

function showToast(message, success = true) {
  const toastEl = document.getElementById("liveToast");

  const toastMessage = document.getElementById("toastMessage");

  if (!toastEl || !toastMessage) return;

  toastMessage.textContent = message;

  toastEl.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning", "text-bg-info");

  toastEl.classList.add(success ? "text-bg-success" : "text-bg-danger");

  bootstrap.Toast.getOrCreateInstance(toastEl, {
    delay: 3000,
  }).show();
}
// ======================================================
// SIMPAN PROFIL
// ======================================================

async function simpanProfil() {
  const nama = document.getElementById("nama").value.trim();

  const no_hp = document.getElementById("no_hp").value.trim();

  const password_lama = document.getElementById("password_lama").value;

  const password_baru = document.getElementById("password_baru").value;

  const konfirmasi_password = document.getElementById("konfirmasi_password").value;

  // ======================================
  // VALIDASI
  // ======================================

  if (!nama) {
    showToast("Nama tidak boleh kosong.", false);

    return;
  }

  if (password_lama || password_baru || konfirmasi_password) {
    if (!password_lama) {
      showToast("Masukkan password lama.", false);

      return;
    }

    if (!password_baru) {
      showToast("Masukkan password baru.", false);

      return;
    }

    if (password_baru.length < 6) {
      showToast("Password baru minimal 6 karakter.", false);

      return;
    }

    if (password_baru !== konfirmasi_password) {
      showToast("Konfirmasi password tidak sesuai.", false);

      return;
    }
  }

  const payload = {
    nama,
    no_hp,
    foto: fotoProfilBaru || dataProfil.foto || "",
    password_lama,
    password_baru,
  };

  try {
    showLoading(true);

    const result = await putData("/mahasiswa/profile", payload);

    showToast(result.message || "Profil berhasil diperbarui.", true);

    resetPassword();

    formChanged = false;

    await loadProfil();
  } catch (err) {
    console.error(err);

    showToast(err.message || "Gagal memperbarui profil.", false);
  } finally {
    showLoading(false);
  }
}

// ======================================================
// RESET PASSWORD
// ======================================================

function resetPassword() {
  const passwordLama = document.getElementById("password_lama");

  const passwordBaru = document.getElementById("password_baru");

  const konfirmasi = document.getElementById("konfirmasi_password");

  if (passwordLama) passwordLama.value = "";

  if (passwordBaru) passwordBaru.value = "";

  if (konfirmasi) konfirmasi.value = "";
}

// ======================================================
// RESET FORM
// ======================================================

function resetForm() {
  tampilkanProfil(dataProfil);

  resetPassword();

  formChanged = false;

  showToast("Perubahan berhasil dibatalkan.", true);
}

// ======================================================
// TOGGLE PASSWORD
// ======================================================

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (!input) return;

  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";

    icon.classList.remove("fa-eye");

    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";

    icon.classList.remove("fa-eye-slash");

    icon.classList.add("fa-eye");
  }
}
// ======================================================
// INIT VALIDATION
// ======================================================

function initValidation() {
  // ======================================
  // VALIDASI NAMA
  // ======================================

  const namaInput = document.getElementById("nama");

  if (namaInput) {
    namaInput.addEventListener("input", function () {
      if (this.value.length > 100) {
        this.value = this.value.substring(0, 100);
      }
    });
  }

  // ======================================
  // VALIDASI NOMOR HP
  // ======================================

  const noHpInput = document.getElementById("no_hp");

  if (noHpInput) {
    noHpInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  }
}

// ======================================================
// AUTO UPDATE HEADER
// ======================================================

function initAutoHeader() {
  const namaInput = document.getElementById("nama");

  if (!namaInput) return;

  namaInput.addEventListener("input", function () {
    const nama = this.value.trim();

    if (nama === "") return;

    const profileNama = document.getElementById("profileNama");

    if (profileNama) {
      profileNama.textContent = nama;
    }

    const navbarNama = document.getElementById("namaUser");

    if (navbarNama) {
      navbarNama.textContent = nama;
    }
  });
}

// ======================================================
// DETEKSI PERUBAHAN FORM
// ======================================================

function initFormWatcher() {
  const fields = ["nama", "no_hp", "password_lama", "password_baru", "konfirmasi_password"];

  fields.forEach((id) => {
    const element = document.getElementById(id);

    if (!element) return;

    element.addEventListener("input", () => {
      formChanged = true;
    });
  });
}

// ======================================================
// ENTER UNTUK SIMPAN
// ======================================================

function initEnterSubmit() {
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;

    const active = document.activeElement;

    if (!active) return;

    if (active.tagName === "TEXTAREA") return;

    if (active.tagName !== "INPUT") return;

    e.preventDefault();

    simpanProfil();
  });
}
// ======================================================
// KONFIRMASI KELUAR HALAMAN
// ======================================================

window.addEventListener("beforeunload", function (e) {
  if (!formChanged) return;

  e.preventDefault();

  e.returnValue = "";
});

// ======================================================
// RESET STATUS FORM SETELAH LOAD ULANG
// ======================================================

function resetFormChanged() {
  formChanged = false;
}

// ======================================================
// LOG
// ======================================================

console.log("========================================");
console.log("Profil Mahasiswa Loaded");
console.log("========================================");
