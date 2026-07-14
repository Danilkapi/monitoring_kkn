const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const controller = require("../controllers/lokasiController");

router.get("/", auth, controller.getLokasi);

router.post("/", auth, controller.saveLokasi);

module.exports = router;
