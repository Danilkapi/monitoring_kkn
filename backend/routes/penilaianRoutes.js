const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const penilaianController = require("../controllers/penilaianController");

// statistik
router.get("/statistik", verifyToken, penilaianController.getStatistik);

// list
router.get("/", verifyToken, penilaianController.getPenilaian);

// detail
router.get("/:id", verifyToken, penilaianController.getDetailPenilaian);

// simpan / update otomatis
router.post("/", verifyToken, penilaianController.simpanPenilaian);

module.exports = router;
