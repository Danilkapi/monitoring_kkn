const db = require("../config/db");
const bcrypt = require("bcrypt");

// ==========================================
// GET PROFILE
// ==========================================

exports.getProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT
        id,
        nama,
        email,
        role,
        foto,
        created_at
    FROM users
    WHERE id=?
    LIMIT 1
    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      res.json(rows[0]);
    },
  );
};

// ==========================================
// UPDATE PROFILE
// ==========================================

exports.updateProfile = (req, res) => {
  const userId = req.user.id;

  const { nama, email, password } = req.body;

  if (!nama || !email) {
    return res.status(400).json({
      success: false,
      message: "Nama dan Email wajib diisi",
    });
  }

  // ==========================================
  // TANPA GANTI PASSWORD
  // ==========================================

  if (!password || password.trim() === "") {
    db.query(
      `
      UPDATE users
      SET
          nama=?,
          email=?
      WHERE id=?
      `,
      [nama, email, userId],
      (err) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            success: false,
            message: "Gagal memperbarui profil",
          });
        }

        return res.json({
          success: true,
          message: "Profil berhasil diperbarui",
        });
      },
    );

    return;
  }

  // ==========================================
  // DENGAN PASSWORD BARU
  // ==========================================

  const hashPassword = bcrypt.hashSync(password, 10);

  db.query(
    `
    UPDATE users
    SET
        nama=?,
        email=?,
        password=?
    WHERE id=?
    `,
    [nama, email, hashPassword, userId],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Gagal memperbarui profil",
        });
      }

      res.json({
        success: true,
        message: "Profil berhasil diperbarui",
      });
    },
  );
};

// ==========================================
// UPLOAD FOTO PROFILE DPL
// ==========================================

exports.uploadFoto = (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Foto belum dipilih.",
    });
  }

  const namaFile = req.file.filename;

  db.query(
    `
    UPDATE users
    SET foto=?
    WHERE id=?
    `,
    [namaFile, userId],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Gagal menyimpan foto profil.",
        });
      }

      res.json({
        success: true,
        message: "Foto profil berhasil diperbarui.",
        foto: namaFile,
      });
    },
  );
};
