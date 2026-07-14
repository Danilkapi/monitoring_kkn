require("dotenv").config();

console.log(process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");

const app = express();

const dashboardRoutes = require("./routes/dashboardRoutes");
const absensiRoutes = require("./routes/absensiRoutes");
const qrRoutes = require("./routes/qrRoutes");
const lokasiRoutes = require("./routes/lokasiRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardDplRoutes = require("./routes/dashboardDplRoutes");
const monitoringDplRoutes = require("./routes/monitoringDplRoutes");
const penilaianRoutes = require("./routes/penilaianRoutes");
const profileDplRoutes = require("./routes/profileDplRoutes");

app.use(cors());
app.use(express.json());

// supaya HTML, CSS, JS bisa diakses
app.use(express.static("public"));

// supaya gambar upload bisa diakses
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Sistem Monitoring KKN Berjalan");
});

// API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/divisi", require("./routes/divisiRoutes"));
app.use("/api/mahasiswa/dashboard", require("./routes/mahasiswaDashboardRoutes"));
app.use("/api/mahasiswa/activity", require("./routes/mahasiswaActivityRoutes"));
app.use("/api/mahasiswa/profile", profileRoutes);
app.use("/api/mahasiswa", require("./routes/mahasiswaRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dpl/dashboard", dashboardDplRoutes);
app.use("/api/dpl/monitoring", monitoringDplRoutes);
app.use("/api/dpl/penilaian", penilaianRoutes);
app.use("/api/dpl/profile", profileDplRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/lokasi", lokasiRoutes);
app.use("/api/laporan", laporanRoutes);
app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});
