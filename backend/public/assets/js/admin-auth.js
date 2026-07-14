const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const namaUser = document.getElementById("namaUser");

if (namaUser) {
  namaUser.innerText = localStorage.getItem("nama");
}

if (!token || role !== "admin") {
  localStorage.clear();
  window.location.href = "../auth/login.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "../auth/login.html";
}
