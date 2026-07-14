const db = require("../config/db");

// GET ALL
exports.getAllMahasiswa = (req, res) => {
  const sql = `
    SELECT
      m.*,
      d.nama_divisi
    FROM mahasiswa m
    LEFT JOIN divisi d
      ON m.divisi_id = d.id
    ORDER BY m.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

// GET BY ID
exports.getMahasiswaById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM mahasiswa WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
};

// INSERT
exports.createMahasiswa = (req, res) => {
  const { divisi_id, nim, nama, prodi, no_hp, jabatan } = req.body;

  const sql = `
    INSERT INTO mahasiswa
    (
      divisi_id,
      nim,
      nama,
      prodi,
      no_hp,
      jabatan
    )
    VALUES (?,?,?,?,?,?)
  `;

  db.query(sql, [divisi_id, nim, nama, prodi, no_hp, jabatan], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Mahasiswa berhasil ditambahkan",
    });
  });
};

// UPDATE
exports.updateMahasiswa = (req, res) => {
  const { id } = req.params;

  const { divisi_id, nim, nama, prodi, no_hp, jabatan } = req.body;

  const sql = `
    UPDATE mahasiswa
    SET
      divisi_id=?,
      nim=?,
      nama=?,
      prodi=?,
      no_hp=?,
      jabatan=?
    WHERE id=?
  `;

  db.query(sql, [divisi_id, nim, nama, prodi, no_hp, jabatan, id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Mahasiswa berhasil diupdate",
    });
  });
};

// DELETE
exports.deleteMahasiswa = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM mahasiswa WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Mahasiswa berhasil dihapus",
    });
  });
};
