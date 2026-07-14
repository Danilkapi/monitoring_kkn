const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Cek login
if (!token) {
  window.location.href = "../auth/login.html";
}

// Cek role admin
if (role !== "admin") {
  alert("Akses ditolak!");

  localStorage.clear();

  window.location.href = "../auth/login.html";
}

// Logout
function logout() {
  const konfirmasi = confirm("Yakin ingin logout?");

  if (konfirmasi) {
    localStorage.clear();

    window.location.href = "../auth/login.html";
  }
}
