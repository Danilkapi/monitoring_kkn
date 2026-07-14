const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const mahasiswaController = require("../controllers/mahasiswaController");
const mahasiswaDashboardController = require("../controllers/mahasiswaDashboardController");

// Dashboard Mahasiswa
router.get("/dashboard", auth, mahasiswaDashboardController.dashboard);

// CRUD Mahasiswa
router.get("/", auth, mahasiswaController.getAll);
router.get("/:id", auth, mahasiswaController.getById);
router.post("/", auth, mahasiswaController.create);
router.put("/:id", auth, mahasiswaController.update);
router.delete("/:id", auth, mahasiswaController.delete);

module.exports = router;
