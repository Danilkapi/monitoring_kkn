const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const profileDplController = require("../controllers/profileDplController");

const uploadProfile = require("../middleware/uploadProfile");

// ==========================================
// GET PROFILE
// ==========================================

router.get("/", verifyToken, profileDplController.getProfile);

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put("/", verifyToken, profileDplController.updateProfile);

// ======================================
// UPLOAD FOTO PROFILE
// ======================================

router.post("/upload", verifyToken, uploadProfile.single("foto"), profileDplController.uploadFoto);

module.exports = router;
