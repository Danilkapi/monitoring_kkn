const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT
      u.id,
      u.nama AS nama_user,
      u.email,
      u.password,
      u.role,

      m.id AS mahasiswa_id,
      m.nama AS nama_mahasiswa,
      m.nim,
      m.divisi_id,
      m.jabatan

    FROM users u

    LEFT JOIN mahasiswa m
      ON m.user_id = u.id

    WHERE u.email = $1
  `;

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Terjadi kesalahan server",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];

    console.log("========== LOGIN ==========");
    console.log(user);
    console.log("===========================");

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        mahasiswa_id: user.mahasiswa_id || null,
        role: user.role,
        nama: user.nama_user,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      token,

      user: {
        id: user.id,

        nama: user.nama_user,

        role: user.role,

        mahasiswa_id: user.mahasiswa_id,

        nama_mahasiswa: user.nama_mahasiswa,

        nim: user.nim,

        divisi_id: user.divisi_id,

        jabatan: user.jabatan,
      },
    });
  });
};
