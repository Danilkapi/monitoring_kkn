const db = require("../config/db");

// ==============================
// Ambil Semua Mahasiswa
// ==============================
exports.getAll = (req, res) => {
  db.query("SELECT * FROM mahasiswa", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result.rows);
  });
};

// ==============================
// Ambil Mahasiswa Berdasarkan ID
// ==============================
exports.getById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM mahasiswa WHERE id=$1", [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  });
};

// ==============================
// Tambah Mahasiswa
// ==============================
exports.create = (req, res) => {
  const { nim, nama, prodi, no_hp, jabatan, divisi_id } = req.body;

  db.query(
    `
    INSERT INTO mahasiswa
    (
      nim,
      nama,
      prodi,
      no_hp,
      jabatan,
      divisi_id
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [nim, nama, prodi, no_hp, jabatan, divisi_id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Mahasiswa berhasil ditambahkan",
      });
    },
  );
};

// ==============================
// Update Mahasiswa
// ==============================
exports.update = (req, res) => {
  const { id } = req.params;

  const { nim, nama, prodi, no_hp, jabatan, divisi_id } = req.body;

  db.query(
    `
    UPDATE mahasiswa
    SET
      nim=$1,
      nama=$2,
      prodi=$3,
      no_hp=$4,
      jabatan=$5,
      divisi_id=$6
    WHERE id=$7
    `,
    [nim, nama, prodi, no_hp, jabatan, divisi_id, id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Mahasiswa berhasil diupdate",
      });
    },
  );
};

// ==============================
// Hapus Mahasiswa
// ==============================
exports.delete = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM mahasiswa WHERE id=$1", [id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Mahasiswa berhasil dihapus",
    });
  });
};
