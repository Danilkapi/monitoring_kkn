const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const absensiController = require("../controllers/absensiController");

// GET
router.get("/", auth, absensiController.getAll);

// GET BY ID
router.get("/:id", auth, absensiController.getById);

// CREATE
router.post("/", auth, absensiController.create);

// UPDATE
router.put("/:id", auth, absensiController.update);

// DELETE
router.delete("/:id", auth, absensiController.delete);

module.exports = router;
