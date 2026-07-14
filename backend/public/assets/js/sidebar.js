// =====================================
// Responsive Sidebar
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");

  const overlay = document.getElementById("sidebarOverlay");

  const toggle = document.getElementById("menuToggle");

  // Kalau halaman belum punya sidebar, hentikan
  if (!sidebar || !overlay || !toggle) return;

  // ==========================
  // Buka Sidebar
  // ==========================
  function openSidebar() {
    sidebar.classList.add("active");

    overlay.classList.add("active");

    document.body.style.overflow = "hidden";
  }

  // ==========================
  // Tutup Sidebar
  // ==========================
  function closeSidebar() {
    sidebar.classList.remove("active");

    overlay.classList.remove("active");

    document.body.style.overflow = "";
  }

  // ==========================
  // Klik Hamburger
  // ==========================
  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("active")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // ==========================
  // Klik Overlay
  // ==========================
  overlay.addEventListener("click", closeSidebar);

  // ==========================
  // Klik Menu
  // ==========================
  sidebar.querySelectorAll("a").forEach((menu) => {
    menu.addEventListener("click", () => {
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });

  // ==========================
  // Resize Browser
  // ==========================
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      closeSidebar();
    }
  });
});
