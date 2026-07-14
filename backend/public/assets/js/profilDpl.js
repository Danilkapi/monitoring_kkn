// ========================================
// ELEMENT
// ========================================

const nama = document.getElementById("nama");
const email = document.getElementById("email");
const password = document.getElementById("password");
const konfirmasiPassword = document.getElementById("konfirmasiPassword");

const profileNama = document.getElementById("profileNama");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");
const profileCreated = document.getElementById("profileCreated");

const fotoProfile = document.getElementById("fotoProfile");
const fotoInput = document.getElementById("fotoInput");
const btnUploadFoto = document.getElementById("btnUploadFoto");

const btnSimpan = document.getElementById("btnSimpan");

const loadingOverlay = document.getElementById("loadingOverlay");

const toastElement = document.getElementById("liveToast");
const toastMessage = document.getElementById("toastMessage");

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
// LOAD PROFILE
// ========================================

async function loadProfile() {
  showLoading();

  try {
    const data = await getData("/dpl/profile");

    nama.value = data.nama;

    email.value = data.email;

    profileNama.innerHTML = data.nama;

    profileEmail.innerHTML = data.email;

    if (data.foto) {
      fotoProfile.src = "/uploads/profile/" + data.foto;
    } else {
      fotoProfile.src = "../assets/image/default-user.png";
    }

    profileRole.innerHTML = data.role.toUpperCase();

    profileCreated.innerHTML = new Date(data.created_at).toLocaleDateString("id-ID");
  } catch (err) {
    console.log(err);

    showToast("Gagal mengambil profil", false);
  } finally {
    hideLoading();
  }
}

// ========================================
// VALIDASI
// ========================================

function validasiForm() {
  if (nama.value.trim() === "") {
    showToast("Nama wajib diisi", false);

    nama.focus();

    return false;
  }

  if (email.value.trim() === "") {
    showToast("Email wajib diisi", false);

    email.focus();

    return false;
  }

  if (password.value !== "") {
    if (password.value.length < 6) {
      showToast("Password minimal 6 karakter", false);

      password.focus();

      return false;
    }

    if (password.value !== konfirmasiPassword.value) {
      showToast("Konfirmasi password tidak sesuai", false);

      konfirmasiPassword.focus();

      return false;
    }
  }

  return true;
}

// ========================================
// EVENT
// ========================================

btnSimpan.addEventListener("click", simpanProfile);

// ========================================
// SIMPAN PROFILE
// ========================================

async function simpanProfile() {
  if (!validasiForm()) return;

  btnSimpan.disabled = true;

  btnSimpan.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Menyimpan...
    `;

  try {
    const response = await putData("/dpl/profile", {
      nama: nama.value,

      email: email.value,

      password: password.value,
    });

    if (response.success) {
      showToast(response.message);

      password.value = "";

      konfirmasiPassword.value = "";

      loadProfile();
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
            Simpan Perubahan
        `;
  }
}

// ========================================
// ENTER
// ========================================

konfirmasiPassword.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    simpanProfile();
  }
});

// ========================================
// INIT
// ========================================

loadProfile();

// ========================================
// PREVIEW FOTO
// ========================================

fotoInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  fotoProfile.src = URL.createObjectURL(file);
});

// ========================================
// UPLOAD FOTO
// ========================================

async function uploadFoto() {
  if (fotoInput.files.length === 0) {
    showToast("Silakan pilih foto terlebih dahulu.", false);
    return;
  }

  btnUploadFoto.disabled = true;

  btnUploadFoto.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Upload...
    `;

  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("foto", fotoInput.files[0]);

    const response = await fetch(`${BASE_URL}/dpl/profile/upload`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message);

      loadProfile();
    } else {
      showToast(result.message, false);
    }
  } catch (err) {
    console.log(err);

    showToast("Gagal upload foto.", false);
  } finally {
    btnUploadFoto.disabled = false;

    btnUploadFoto.innerHTML = `
            <i class="fa-solid fa-camera"></i>
            Upload Foto
        `;
  }
}

// ========================================
// EVENT UPLOAD FOTO
// ========================================

btnUploadFoto.addEventListener("click", uploadFoto);
