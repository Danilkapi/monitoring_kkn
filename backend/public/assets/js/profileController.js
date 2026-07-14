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
      m.jabatan,
      m.foto,
      d.nama_divisi,
      u.username,
      u.email
    FROM mahasiswa m

    JOIN users u
      ON u.id = m.user_id

    LEFT JOIN divisi d
      ON d.id = m.divisi_id

    WHERE
      m.user_id = ?
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Terjadi kesalahan server.",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Profil mahasiswa tidak ditemukan.",
      });
    }

    res.json(result[0]);
  });
};
const bcrypt = require("bcrypt");

// ======================================
// UPDATE PROFILE MAHASISWA
// ======================================

exports.updateProfile = (req, res) => {
  const userId = req.user.id;

  const { nama, no_hp, foto, password_lama, password_baru } = req.body;

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
    WHERE u.id=?
    `,
    [userId],
    async (err, userResult) => {
      if (err) {
        return res.status(500).json({
          message: "Terjadi kesalahan server.",
        });
      }

      if (!userResult.length) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const user = userResult[0];

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
          SET password=?
          WHERE id=?
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
  // UPDATE DATA MAHASASISWA
  // ==========================

  function updateMahasiswa() {
    db.query(
      `
      UPDATE mahasiswa
      SET
        nama=?,
        no_hp=?,
        foto=?
      WHERE
        user_id=?
      `,
      [nama, no_hp, foto, userId],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal memperbarui profil.",
          });
        }

        res.json({
          success: true,
          message: "Profil berhasil diperbarui.",
        });
      },
    );
  }
};
