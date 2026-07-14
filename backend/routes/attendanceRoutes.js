const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const attendanceController = require("../controllers/attendanceController");

router.post("/", auth, attendanceController.createAttendance);

router.get("/", auth, attendanceController.getAllAttendance);

router.get("/mahasiswa/:id", auth, attendanceController.getAttendanceByMahasiswa);

router.post("/scan", auth, attendanceController.scanAttendance);

module.exports = router;
