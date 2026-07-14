const db = require("../config/db");

// ===============================
// GET ALL
// ===============================
exports.getAll = (req, res) => {
  const sql = `
    SELECT
      a.*,
      m.nama
    FROM kehadiran a
    JOIN mahasiswa m
      ON m.id = a.mahasiswa_id
    ORDER BY a.tanggal DESC, a.jam_masuk DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

// ===============================
// GET BY ID
// ===============================
exports.getById = (req, res) => {
  db.query("SELECT * FROM kehadiran WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
};

// ===============================
// CREATE
// ===============================
exports.create = (req, res) => {
  const { mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status } = req.body;

  const sql = `
    INSERT INTO kehadiran
    (
      mahasiswa_id,
      tanggal,
      jam_masuk,
      latitude,
      longitude,
      status
    )
    VALUES (?,?,?,?,?,?)
  `;

  db.query(sql, [mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "kehadiran berhasil ditambahkan",
    });
  });
};

// ===============================
// UPDATE
// ===============================
exports.update = (req, res) => {
  const { mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status } = req.body;

  const sql = `
    UPDATE kehadiran
    SET
      mahasiswa_id=?,
      tanggal=?,
      jam_masuk=?,
      latitude=?,
      longitude=?,
      status=?
    WHERE id=?
  `;

  db.query(sql, [mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "kehadiran berhasil diupdate",
    });
  });
};

// ===============================
// DELETE
// ===============================
exports.delete = (req, res) => {
  db.query("DELETE FROM kehadiran WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "kehadiran berhasil dihapus",
    });
  });
};
