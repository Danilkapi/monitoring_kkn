const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const divisiController = require("../controllers/divisiController");

router.get("/", auth, divisiController.getAllDivisi);

router.get("/:id", auth, divisiController.getDivisiById);

router.post("/", auth, divisiController.createDivisi);

router.put("/:id", auth, divisiController.updateDivisi);

router.delete("/:id", auth, divisiController.deleteDivisi);

module.exports = router;
