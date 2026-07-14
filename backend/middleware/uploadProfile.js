const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =======================================
// Folder Upload
// =======================================

const folder = "uploads/profile";

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, {
    recursive: true,
  });
}

// =======================================
// Storage
// =======================================

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, folder);
  },

  filename(req, file, cb) {
    const namaFile = Date.now() + path.extname(file.originalname);

    cb(null, namaFile);
  },
});

// =======================================
// Export
// =======================================

module.exports = multer({
  storage,
});
