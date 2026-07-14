const db = require("../config/db");

// ======================================
// GET PROFILE MAHASISWA
// ======================================

exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
    m.id,
    m.nim,
    m.nama,
    m.prodi,
    m.no_hp,
    m.foto,
    m.jabatan,
    d.nama_divisi,
    u.email,
    u.role
    FROM mahasiswa m

    JOIN users u
    ON u.id=m.user_id

    LEFT JOIN divisi d
    ON d.id=m.divisi_id

    WHERE m.user_id=$1
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Terjadi kesalahan server.",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profil mahasiswa tidak ditemukan.",
      });
    }

    res.json(result.rows[0]);
  });
};

const bcrypt = require("bcrypt");

// ======================================
// UPDATE PROFILE MAHASISWA
// ======================================

exports.updateProfile = (req, res) => {
  const userId = req.user.id;

  const { nama, no_hp, password_lama, password_baru } = req.body;

  // ==========================
  // Validasi
  // ==========================

  if (!nama || nama.trim() === "") {
    return res.status(400).json({
      message: "Nama tidak boleh kosong.",
    });
  }

  // ==========================
  // Ambil User
  // ==========================

  db.query(
    `
    SELECT
      u.id,
      u.password
    FROM users u
    WHERE u.id=$1
    `,
    [userId],
    async (err, userResult) => {
      if (err) {
        return res.status(500).json({
          message: "Terjadi kesalahan server.",
        });
      }

      if (!userResult.rows.length) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const user = userResult.rows[0];

      // ==========================
      // UPDATE PASSWORD
      // ==========================

      if (password_baru && password_baru !== "") {
        if (!password_lama) {
          return res.status(400).json({
            message: "Password lama wajib diisi.",
          });
        }

        const cocok = await bcrypt.compare(password_lama, user.password);

        if (!cocok) {
          return res.status(400).json({
            message: "Password lama salah.",
          });
        }

        const hashPassword = await bcrypt.hash(password_baru, 10);

        db.query(
          `
          UPDATE users
          SET password=$1
          WHERE id=$2
          `,
          [hashPassword, userId],
          (err) => {
            if (err) {
              return res.status(500).json({
                message: "Gagal mengubah password.",
              });
            }

            updateMahasiswa();
          },
        );
      } else {
        updateMahasiswa();
      }
    },
  );

  // ==========================
  // UPDATE DATA USER & MAHASISWA
  // ==========================

  function updateMahasiswa() {
    // ======================================
    // Update nama pada tabel users
    // ======================================

    db.query(
      `
    UPDATE users
    SET
      nama=$1
    WHERE
      id=$2
    `,
      [nama, userId],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal memperbarui data user.",
          });
        }

        // ======================================
        // Update data mahasiswa
        // ======================================

        db.query(
          `
        UPDATE mahasiswa
        SET
          nama=$1,
          no_hp=$2
        WHERE
          user_id=$3
        `,
          [nama, no_hp, userId],
          (err) => {
            if (err) {
              return res.status(500).json({
                message: "Gagal memperbarui profil mahasiswa.",
              });
            }

            res.json({
              success: true,
              message: "Profil berhasil diperbarui.",
            });
          },
        );
      },
    );
  }
};
// ======================================
// UPLOAD FOTO PROFIL
// ======================================

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
    UPDATE mahasiswa
    SET foto=$1
    WHERE user_id=$2
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
