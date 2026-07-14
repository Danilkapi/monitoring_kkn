const db = require("../config/db");

// GET ALL
exports.getAllDivisi = (req, res) => {
  db.query("SELECT * FROM divisi ORDER BY nama_divisi ASC", (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result.rows);
  });
};

// GET BY ID
exports.getDivisiById = (req, res) => {
  db.query("SELECT * FROM divisi WHERE id=$1", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result.rows[0]);
  });
};

// CREATE
exports.createDivisi = (req, res) => {
  const { nama_divisi, deskripsi } = req.body;

  db.query("INSERT INTO divisi(nama_divisi,deskripsi) VALUES($1,$2)", [nama_divisi, deskripsi], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Divisi berhasil ditambahkan",
    });
  });
};

// UPDATE
exports.updateDivisi = (req, res) => {
  const { nama_divisi, deskripsi } = req.body;

  db.query("UPDATE divisi SET nama_divisi=$1, deskripsi=$2 WHERE id=$3", [nama_divisi, deskripsi, req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Divisi berhasil diupdate",
    });
  });
};

// DELETE
exports.deleteDivisi = (req, res) => {
  db.query("DELETE FROM divisi WHERE id=$1", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Divisi berhasil dihapus",
    });
  });
};
