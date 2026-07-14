const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const controller = require("../controllers/mahasiswaActivityController");

// ==========================
// GET
// ==========================

router.get("/", auth, controller.getMyActivity);

// ==========================
// POST
// ==========================

router.post("/", auth, controller.create);

// ==========================
// PUT
// ==========================

router.put("/:id", auth, controller.update);

// ==========================
// DELETE
// ==========================

router.delete("/:id", auth, controller.delete);

// ==========================
// UPLOAD FOTO
// ==========================

router.post(
  "/upload",

  auth,

  upload.single("foto"),

  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Foto tidak ditemukan",
      });
    }

    res.json({
      filename: req.file.filename,
    });
  },
);

module.exports = router;
