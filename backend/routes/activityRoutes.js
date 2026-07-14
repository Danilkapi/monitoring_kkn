const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");
const upload = require("../middleware/upload");

router.get("/", auth, activityController.getAll);
router.get("/:id", auth, activityController.getById);

router.post("/", auth, activityController.create);

router.put("/:id", auth, activityController.update);

router.delete("/:id", auth, activityController.delete);

router.post("/upload", auth, upload.single("foto"), activityController.uploadFoto);

module.exports = router;
