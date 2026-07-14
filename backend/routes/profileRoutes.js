const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const profileController = require("../controllers/profileController");

const uploadProfile = require("../middleware/uploadProfile");

// ======================================
// GET PROFILE
// ======================================

router.get("/", auth, profileController.getProfile);

// ======================================
// UPDATE PROFILE
// ======================================

router.put("/", auth, profileController.updateProfile);

// ======================================
// UPLOAD FOTO PROFILE
// ======================================

router.post("/upload", auth, uploadProfile.single("foto"), profileController.uploadFoto);

module.exports = router;
