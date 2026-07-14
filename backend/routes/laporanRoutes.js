const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const laporanController = require("../controllers/laporanController");

// =====================================
// GET LAPORAN
// =====================================
// contoh:
// /api/laporan?jenis=absensi
// /api/laporan?jenis=aktivitas
// /api/laporan?jenis=mahasiswa
// /api/laporan?jenis=divisi
//
router.get("/", auth, laporanController.getLaporan);

module.exports = router;
