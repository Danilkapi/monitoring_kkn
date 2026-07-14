const db = require("../config/db");

// ======================================
// GET AKTIVITAS MILIK MAHASASISWA
// ======================================

exports.getMyActivity = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      a.*
    FROM aktivitas a
    JOIN mahasiswa m
      ON m.id = a.mahasiswa_id
    WHERE m.user_id=?
    ORDER BY a.tanggal DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
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
    "SELECT id FROM mahasiswa WHERE user_id=?",

    [userId],

    (err, mahasiswa) => {
      if (err) return res.status(500).json(err);

      if (!mahasiswa.length) {
        return res.status(404).json({
          message: "Mahasiswa tidak ditemukan",
        });
      }

      const mahasiswaId = mahasiswa[0].id;

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
        VALUES (?,?,?,?,?)
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
// UPDATE
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
    JOIN mahasiswa m
      ON a.mahasiswa_id=m.id
    SET
      a.judul_kegiatan=?,
      a.deskripsi=?,
      a.tanggal=?,
      a.foto=?
    WHERE
      a.id=?
      AND
      m.user_id=?
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
// DELETE
// ======================================

exports.delete = (req, res) => {
  const userId = req.user.id;

  const id = req.params.id;

  const sql = `
    DELETE a
    FROM aktivitas a
    JOIN mahasiswa m
      ON a.mahasiswa_id=m.id
    WHERE
      a.id=?
      AND
      m.user_id=?
  `;

  db.query(sql, [id, userId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Aktivitas berhasil dihapus",
    });
  });
};
