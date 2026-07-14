const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const controller = require("../controllers/monitoringDplController");

// =========================================

router.get("/", auth, controller.getMonitoring);

// =========================================

router.get("/:id", auth, controller.getDetailMahasiswa);

// =========================================

module.exports = router;
