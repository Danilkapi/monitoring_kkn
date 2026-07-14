async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const btn = document.getElementById("btnLogin");

  if (email === "" || password === "") {
    alert("Email dan Password wajib diisi.");
    return;
  }

  // Loading Button
  btn.disabled = true;

  btn.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Masuk...
    `;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);

      return;
    }

    // ===============================
    // Simpan ke Local Storage
    // ===============================

    localStorage.setItem("token", result.token);
    localStorage.setItem("role", result.user.role);
    localStorage.setItem("nama", result.user.nama);

    if (result.user.mahasiswa_id) {
      localStorage.setItem("mahasiswa_id", result.user.mahasiswa_id);
      localStorage.setItem("nim", result.user.nim);
      localStorage.setItem("divisi_id", result.user.divisi_id);
      localStorage.setItem("jabatan", result.user.jabatan);
    }

    // ===============================
    // Redirect Berdasarkan Role
    // ===============================

    switch (result.user.role) {
      case "admin":
        window.location.href = "../admin/dashboard.html";
        break;

      case "mahasiswa":
        window.location.href = "../mahasiswa/dashboard.html";
        break;

      case "dpl":
        window.location.href = "../dpl/dashboard.html";
        break;

      default:
        alert("Role tidak dikenali.");
    }
  } catch (err) {
    console.error(err);

    alert("Tidak dapat terhubung ke server.");
  } finally {
    // Mengembalikan tombol ke keadaan semula
    btn.disabled = false;

    btn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket"></i>
            Login
        `;
  }
}

// =======================================
// Tekan ENTER untuk Login
// =======================================

document.getElementById("password").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    login();
  }
});
