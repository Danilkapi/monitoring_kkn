const db = require("../config/db");

// ======================================
// GET AKTIVITAS MILIK MAHASISWA
// ======================================

exports.getMyActivity = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      a.*
    FROM aktivitas a
    JOIN mahasiswa m
      ON m.id = a.mahasiswa_id
    WHERE m.user_id=$1
    ORDER BY a.tanggal DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result.rows);
  });
};

// ======================================
// TAMBAH AKTIVITAS
// ======================================

exports.create = (req, res) => {
  const userId = req.user.id;

  const {
    judul_kegiatan,

    deskripsi,

    tanggal,

    foto,
  } = req.body;

  db.query(
    "SELECT id FROM mahasiswa WHERE user_id=$1",

    [userId],

    (err, mahasiswaResult) => {
      if (err) return res.status(500).json(err);

      if (!mahasiswaResult.rows.length) {
        return res.status(404).json({
          message: "Mahasiswa tidak ditemukan",
        });
      }

      const mahasiswaId = mahasiswaResult.rows[0].id;

      db.query(
        `
        INSERT INTO aktivitas
        (
          mahasiswa_id,
          judul_kegiatan,
          deskripsi,
          tanggal,
          foto
        )
        VALUES ($1,$2,$3,$4,$5)
        `,

        [mahasiswaId, judul_kegiatan, deskripsi, tanggal, foto],

        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Aktivitas berhasil ditambahkan",
          });
        },
      );
    },
  );
};

// ======================================
// UPDATE (PostgreSQL syntax)
// ======================================

exports.update = (req, res) => {
  const userId = req.user.id;

  const id = req.params.id;

  const {
    judul_kegiatan,

    deskripsi,

    tanggal,

    foto,
  } = req.body;

  const sql = `
    UPDATE aktivitas a
    SET
      judul_kegiatan=$1,
      deskripsi=$2,
      tanggal=$3,
      foto=$4
    FROM mahasiswa m
    WHERE a.mahasiswa_id=m.id
      AND a.id=$5
      AND m.user_id=$6
  `;

  db.query(
    sql,

    [judul_kegiatan, deskripsi, tanggal, foto, id, userId],

    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Aktivitas berhasil diupdate",
      });
    },
  );
};

// ======================================
// DELETE (PostgreSQL syntax)
// ======================================

exports.delete = (req, res) => {
  const userId = req.user.id;

  const id = req.params.id;

  const sql = `
    DELETE FROM aktivitas a
    USING mahasiswa m
    WHERE a.mahasiswa_id=m.id
      AND a.id=$1
      AND m.user_id=$2
  `;

  db.query(sql, [id, userId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Aktivitas berhasil dihapus",
    });
  });
};
