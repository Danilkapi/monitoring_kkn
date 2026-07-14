const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const qrController = require("../controllers/qrController");

router.get("/", auth, qrController.getLatestQR);

router.post("/generate", auth, qrController.generateQR);

router.post("/scan", auth, qrController.scanQR);

module.exports = router;
