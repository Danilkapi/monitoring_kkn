const db = require("../config/db");

// GET ALL
exports.getAll = (req, res) => {
  const sql = `
    SELECT
      a.*,
      m.nama
    FROM aktivitas a
    JOIN mahasiswa m ON m.id = a.mahasiswa_id
    ORDER BY a.tanggal DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

// GET BY ID
exports.getById = (req, res) => {
  db.query("SELECT * FROM aktivitas WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
};

// CREATE
exports.create = (req, res) => {
  const { mahasiswa_id, judul_kegiatan, deskripsi, tanggal, foto } = req.body;

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
    VALUES(?,?,?,?,?)
  `,
    [mahasiswa_id, judul_kegiatan, deskripsi, tanggal, foto],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Aktivitas berhasil ditambahkan",
      });
    },
  );
};

// UPDATE
exports.update = (req, res) => {
  const { mahasiswa_id, judul_kegiatan, deskripsi, tanggal, foto } = req.body;

  db.query(
    `
    UPDATE aktivitas
    SET
      mahasiswa_id=?,
      judul_kegiatan=?,
      deskripsi=?,
      tanggal=?,
      foto=?
    WHERE id=?
  `,
    [mahasiswa_id, judul_kegiatan, deskripsi, tanggal, foto, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Aktivitas berhasil diupdate",
      });
    },
  );
};

// DELETE
exports.delete = (req, res) => {
  db.query("DELETE FROM aktivitas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Aktivitas berhasil dihapus",
    });
  });
};

exports.uploadFoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Foto tidak ditemukan",
    });
  }

  res.json({
    message: "Upload berhasil",
    filename: req.file.filename,
  });
};
